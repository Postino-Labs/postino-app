import { NextApiRequest, NextApiResponse } from 'next';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface InitiateDocumentRequest {
  ipfsHash: string;
  requiredSignatures: number;
  worldcoinProofRequired: boolean;
  creatorId: string;
  recipients: string[];
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
    requiredSignatures,
    worldcoinProofRequired,
    creatorId,
    recipients,
  }: InitiateDocumentRequest = req.body;

  try {
    // Check if the creator exists in the users table
    let { data: creator, error: creatorError } = await supabase
      .from('users')
      .select('id')
      .or(`worldcoin_id.eq.${creatorId},ethereum_address.eq.${creatorId}`)
      .single();

    if (creatorError) {
      if (creatorError.code === 'PGRST116') {
        // User not found, create a new user
        const { data: newUser, error: newUserError } = await supabase
          .from('users')
          .insert({
            worldcoin_id: worldcoinProofRequired ? creatorId : null,
            ethereum_address: !worldcoinProofRequired ? creatorId : null,
          })
          .select()
          .single();

        if (newUserError) throw newUserError;
        if (!newUser) throw new Error('Failed to create new user');
        creator = newUser;
      } else {
        throw creatorError;
      }
    }

    if (!creator) {
      throw new Error('Creator not found and could not be created');
    }

    // Store the document in Supabase
    const expectedSignatures = recipients.length + 1; // Add 1 for the creator
    const { data, error } = await supabase
      .from('pending_documents')
      .insert({
        ipfs_hash: ipfsHash,
        required_signatures: expectedSignatures, // Add 1 for the creator
        worldcoin_proof_required: worldcoinProofRequired,
        signatures: [],
        creator_id: creator.id,
        remaining_signatures: expectedSignatures,
        recipients: recipients,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to insert document');

    // Only create entries in the document_signers table if there are recipients
    if (recipients.length > 0) {
      const signerEntries = recipients.map((recipient) => ({
        document_id: data.id,
        user_address: recipient,
        has_signed: false,
      }));

      const { error: signerError } = await supabase
        .from('document_signers')
        .insert(signerEntries);

      if (signerError) {
        console.error('Error inserting document signers:', signerError);
        // Don't throw the error, just log it
      }
    }

    res.status(200).json({
      message: 'Document initiated',
      documentId: data.id,
      recipients: recipients,
    });
  } catch (error) {
    console.error('Error initiating document:', error);
    res.status(500).json({ error: 'Failed to initiate document' });
  }
}
