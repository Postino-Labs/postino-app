import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ipfsHash } = req.query;

  if (!ipfsHash) {
    return res.status(400).json({ error: 'IPFS hash is required' });
  }

  try {
    const { data, error } = await supabase
      .from('pending_documents')
      .select('id')
      .eq('ipfs_hash', ipfsHash);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (data && data.length > 0) {
      res.status(200).json({ exists: true, documentId: data[0].id });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking document:', error);
    res.status(500).json({ error: 'Failed to check document' });
  }
}
