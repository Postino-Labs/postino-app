import { NextApiRequest, NextApiResponse } from 'next';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  AttestationShareablePackageObject,
  createOffchainURL,
  EAS,
  SignedOffchainAttestation,
} from '@ethereum-attestation-service/eas-sdk';
import { ethers, Wallet } from 'ethers';
import { signatureSchemaEncoder, signatureSchemaUID } from '@/utils/eas';
import crypto from 'crypto';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

function transformToShareablePackage(
  attestation: SignedOffchainAttestation,
  signer: any
): AttestationShareablePackageObject {
  return {
    signer,
    sig: {
      version: attestation.version,
      domain: attestation.domain,
      primaryType: attestation.primaryType,
      types: attestation.types,
      signature: {
        r: attestation.signature.r,
        s: attestation.signature.s,
        v: attestation.signature.v,
      },
      uid: attestation.uid,
      message: {
        ...attestation.message,
        version: attestation.message.version,
        schema: attestation.message.schema,
        recipient: attestation.message.recipient,
        time: attestation.message.time,
        expirationTime: attestation.message.expirationTime,
        revocable: attestation.message.revocable,
        refUID: attestation.message.refUID,
        data: attestation.message.data,
        nonce: attestation.message.nonce,
      },
    },
  };
}

// Initialize Supabase client
const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize EAS
const easContractAddress = '0x4200000000000000000000000000000000000021';
const schemaUID = signatureSchemaUID;
const eas = new EAS(easContractAddress);

// Initialize SchemaEncoder
const schemaEncoder = signatureSchemaEncoder;

interface SubmitSignatureRequest {
  ipfsHash: string;
  signature: string;
  worldcoinProof: string;
  recipientAddress?: string;
  worldcoinId?: string;
  ethereumAddress?: string;
}

async function getOrCreateUser(
  worldcoinId: string | undefined,
  ethereumAddress: string | undefined
) {
  let user;

  if (worldcoinId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('worldcoin_id', worldcoinId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    user = data;

    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({ worldcoin_id: worldcoinId })
        .single();

      if (createError) throw createError;
      user = newUser;
    }
  } else if (ethereumAddress) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('ethereum_address', ethereumAddress)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    user = data;

    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({ ethereum_address: ethereumAddress })
        .single();

      if (createError) throw createError;
      user = newUser;
    }
  } else {
    throw new Error('Either worldcoinId or ethereumAddress must be provided');
  }

  return user;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    ipfsHash,
    signature,
    worldcoinProof,
    worldcoinId,
    recipientAddress,
    ethereumAddress,
  }: SubmitSignatureRequest = req.body;

  try {
    // Get or create user
    const user = await getOrCreateUser(worldcoinId, ethereumAddress);

    if (!user) {
      return res
        .status(400)
        .json({ error: 'Failed to create or retrieve user' });
    }

    // Fetch the document from Supabase
    const { data: document, error: fetchError } = await supabase
      .from('pending_documents')
      .select('*')
      .eq('ipfs_hash', ipfsHash)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Document not found' });
      }
      throw fetchError;
    }

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if the user has already signed this specific document
    const { data: existingSignature, error: signatureError } = await supabase
      .from('user_signatures')
      .select('*')
      .eq('user_id', user.id)
      .eq('document_id', document.id)
      .single();

    if (signatureError && signatureError.code !== 'PGRST116')
      throw signatureError;

    if (existingSignature) {
      return res
        .status(400)
        .json({ error: 'User has already signed this document' });
    }

    // Check if more signatures are needed
    if (document.remaining_signatures <= 0) {
      return res.status(400).json({
        error: 'Document has already collected all required signatures',
      });
    }

    const _worldcoinProof = worldcoinProof ?? '0x';
    const _signature = signature ?? '0x';

    // Use this documentHash in the encodedData
    const encodedData = schemaEncoder.encodeData([
      { name: 'documentHash', value: ipfsHash, type: 'string' },
      { name: 'signature', value: _signature, type: 'bytes' },
      {
        name: 'worldcoinProof',
        value: _worldcoinProof,
        type: 'bytes',
      },
    ]);

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new Wallet(process.env.ATTESTOR_PRIVATE_KEY!);
    const signer = wallet.connect(provider);
    await eas.connect(signer as any);

    const offchain = await eas.getOffchain();

    const _params = {
      recipient:
        recipientAddress ?? '0x0000000000000000000000000000000000000000',
      expirationTime: BigInt(0),
      time: Math.floor(Date.now() / 1000) as any, // Current Unix timestamp
      revocable: true,
      schema: schemaUID,
      refUID:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      data: encodedData,
    };
    const offchainAttestation = await offchain.signOffchainAttestation(
      _params,
      signer
    );
    console.log('Offchain attestation:', offchainAttestation);
    // Instead of tx.wait(), we'll use the UID from the offchain attestation
    const newAttestationUID = offchainAttestation.uid;

    // Update the document in Supabase
    const { data: updatedDocument, error: updateError } = await supabase
      .from('pending_documents')
      .update({
        signatures: [...document.signatures, newAttestationUID],
        remaining_signatures: document.remaining_signatures - 1,
        encoded_offchain_attestation: JSON.stringify(offchainAttestation),
      })
      .eq('id', document.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Link the signature to the user
    const { error: linkError } = await supabase.from('user_signatures').insert({
      user_id: user.id,
      document_id: document.id,
      attestation_uid: newAttestationUID,
    });

    if (linkError) throw linkError;

    const isComplete = updatedDocument.remaining_signatures === 0;

    res.status(200).json({
      newAttestationUID,
      isComplete,
      message: isComplete
        ? 'All required signatures collected. Ready for finalization.'
        : `Signature submitted. ${updatedDocument.remaining_signatures} signatures remaining.`,
      offchainAttestation: offchainAttestation,
    });
  } catch (error) {
    console.error('Error submitting signature:', error);
    res
      .status(500)
      .json({ error: 'Failed to submit signature', details: error });
  }
}
