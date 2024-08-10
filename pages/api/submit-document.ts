import { NextApiRequest, NextApiResponse } from 'next';
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';
import { documentSchemaUID, EASContractOPSepoliaAddress } from '@/utils/eas';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// EAS contract address on Sepolia
const EAS_CONTRACT_ADDRESS = EASContractOPSepoliaAddress;
const SCHEMA_UID = documentSchemaUID; // Your schema UID

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { documentId } = req.body;

  try {
    // Fetch document details from Supabase
    const { data: document, error } = await supabase
      .from('pending_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) throw error;
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL_OP_SEPOLIA);
    const wallet = new ethers.Wallet(process.env.ATTESTOR_PRIVATE_KEY!);
    const signer = wallet.connect(provider);
    const eas = new EAS(EAS_CONTRACT_ADDRESS);
    eas.connect(signer);

    // Initialize SchemaEncoder
    const schemaEncoder = new SchemaEncoder(
      'uint8 requiredSignatures, string[] signatureUIDs, string ipfs, bool worldcoinProofRequired'
    );
    const encodedData = schemaEncoder.encodeData([
      {
        name: 'requiredSignatures',
        value: document.required_signatures,
        type: 'uint8',
      },
      { name: 'signatureUIDs', value: document.signatures, type: 'string[]' },
      { name: 'ipfs', value: document.ipfs_hash, type: 'string' },
      {
        name: 'worldcoinProofRequired',
        value: document.worldcoin_proof_required,
        type: 'bool',
      },
    ]);

    // Create attestation
    const tx = await eas.attest({
      schema: SCHEMA_UID,
      data: {
        recipient: '0x0000000000000000000000000000000000000000',
        expirationTime: 0 as unknown as bigint,
        revocable: false,
        data: encodedData,
      },
    });

    const newAttestationUID = await tx.wait();

    // Update document with attestation UID
    const { error: updateError } = await supabase
      .from('pending_documents')
      .update({ attestation: newAttestationUID })
      .eq('id', documentId);

    if (updateError) throw updateError;

    res.status(200).json({
      message: 'Attestation created successfully',
      attestationUID: newAttestationUID,
    });
  } catch (error) {
    console.error('Error creating attestation:', error);
    res.status(500).json({ message: 'Error creating attestation', error });
  }
}
