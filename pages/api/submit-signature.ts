import { NextApiRequest, NextApiResponse } from 'next';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EAS } from '@ethereum-attestation-service/eas-sdk';
import { ethers, Wallet } from 'ethers';
import { signatureSchemaEncoder, signatureSchemaUID } from '@/utils/eas';

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
  signerAddress: string;
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
    signerAddress,
    worldcoinId,
    ethereumAddress,
  }: SubmitSignatureRequest = req.body;

  try {
    // Get or create user
    const user = await getOrCreateUser(worldcoinId, ethereumAddress);

    // Fetch the document from Supabase
    const { data: document, error: fetchError } = await supabase
      .from('pending_documents')
      .select('*')
      .eq('ipfs_hash', ipfsHash)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // PGRST116 is the error code for "Results contain 0 rows"
        return res.status(404).json({ error: 'Document not found' });
      }
      throw fetchError;
    }

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if the user has already signed
    const { data: existingSignature, error: signatureError } = await supabase
      .from('user_signatures')
      .select('*')
      .eq('user_id', user.id)
      .eq('document_id', document.id)
      .single();

    if (signatureError && signatureError.code !== 'PGRST116')
      throw signatureError;
    if (existingSignature)
      return res
        .status(400)
        .json({ error: 'User has already signed this document' });

    // Check if more signatures are needed
    if (document.remaining_signatures <= 0) {
      return res.status(400).json({
        error: 'Document has already collected all required signatures',
      });
    }

    // Convert ipfsHash to bytes32
    const documentHash = ethers.utils.hexZeroPad(
      ethers.utils.toUtf8Bytes(ipfsHash),
      32
    );

    const encodedData = schemaEncoder.encodeData([
      { name: 'documentHash', value: documentHash, type: 'bytes32' },
      { name: 'signature', value: signature, type: 'bytes' },
      {
        name: 'worldcoinProof',
        value: worldcoinProof || ethers.constants.HashZero,
        type: 'bytes32',
      },
    ]);

    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new Wallet(process.env.ATTESTOR_PRIVATE_KEY!);
    const signer = wallet.connect(provider);

    await eas.connect(signer as any);

    const tx = await eas.attest({
      schema: schemaUID,
      data: {
        recipient: signerAddress,
        expirationTime: 0 as any,
        revocable: true,
        data: encodedData,
      },
    });

    const newAttestationUID = await tx.wait();

    // Update the document in Supabase
    const { data: updatedDocument, error: updateError } = await supabase
      .from('pending_documents')
      .update({
        signatures: [...document.signatures, newAttestationUID],
        remaining_signatures: document.remaining_signatures - 1,
      })
      .eq('ipfs_hash', ipfsHash)
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
      easExplorerUrl: `https://optimism.easscan.org/attestation/view/${newAttestationUID}`,
    });
  } catch (error) {
    console.error('Error submitting signature:', error);
    res.status(500).json({ error: 'Failed to submit signature' });
  }
}
