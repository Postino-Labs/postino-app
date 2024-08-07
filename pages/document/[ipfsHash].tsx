import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';
import Layout from '@/components/layout';

const DocumentDetails = () => {
  const router = useRouter();
  const { ipfsHash } = router.query;
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (ipfsHash) {
      fetchDocumentDetails(ipfsHash);
    }
  }, [ipfsHash]);

  const fetchDocumentDetails = async (ipfsHash: any) => {
    try {
      setLoading(true);
      let { data, error } = await supabase
        .from('pending_documents')
        .select(
          `
          *,
          user_signatures (
            id,
            user_id,
            created_at,
            users (id, worldcoin_id)
          )
        `
        )
        .eq('ipfs_hash', ipfsHash)
        .single();

      if (error) throw error;
      console.log({ data });
      if (data) {
        setDocument(data);
      } else {
        setError('Document not found');
      }
    } catch (err) {
      setError('Error fetching document details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!document) return <div>Document not found</div>;

  return (
    <Layout>
      <div className='p-6 max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold mb-4'>
          {document.ipfs_hash || 'Untitled Document'}
        </h1>

        <h2 className='text-xl font-semibold mb-4'>Document details</h2>
        <div className='grid grid-cols-2 gap-4 mb-6'>
          <div>
            <p className='text-sm text-gray-500'>Created</p>
            <p>{new Date(document.created_at).toLocaleString()}</p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Status</p>
            <p>{'Status'}</p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Required Signatures</p>
            <p>{document.required_signatures}</p>
          </div>
        </div>

        <h2 className='text-xl font-semibold mb-4'>Signatures</h2>

        <div className='space-y-4 mb-6'>
          {document.signatures.map((signature: any, index: number) => (
            <div key={index} className='flex justify-between items-center'>
              <div>
                <p className='font-semibold'>{signature}</p>
              </div>
              <p>Signed</p>
            </div>
          ))}
        </div>

        {/* You can add more sections here, like an activity log, if that data is available */}
      </div>
    </Layout>
  );
};

export default DocumentDetails;
