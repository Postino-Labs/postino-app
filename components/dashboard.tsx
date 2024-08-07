import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { account, isLoading } = useAuth();
  const [pendingDocs, setPendingDocs] = useState<any[]>([]);
  const [signedDocs, setSignedDocs] = useState<any[]>([]);

  useEffect(() => {
    if (isLoading) return;
    fetchDocuments();
  }, [account]);

  async function fetchDocuments() {
    let { data: createdDocs, error: pendingError } = await supabase
      .from('pending_documents')
      .select('*, users!inner(*)')
      .eq('users.worldcoin_id', account);

    if (pendingError)
      console.error('Error fetching pending documents:', pendingError);
    else setPendingDocs(createdDocs || []);

    let { data: signedDocuments, error: recentError } = await supabase
      .from('user_signatures')
      .select(
        `*,users!inner(worldcoin_id),pending_documents(*)
    `
      )
      .eq('users.worldcoin_id', account)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError)
      console.error('Error fetching signed documents:', recentError);
    else setSignedDocs(signedDocuments || []);
  }

  return (
    <div className='max-w-6xl mx-auto space-y-8'>
      <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>

      <section>
        <h2 className='text-xl font-semibold mb-4 text-gray-800'>
          Created Documents
        </h2>
        <div className='space-y-4'>
          {pendingDocs.map((doc: any) => (
            <div
              key={doc.id}
              className='bg-white p-4 rounded-lg shadow flex justify-between items-center'
            >
              <div>
                <h3 className='font-medium'>Document {doc.id}</h3>
                <p className='text-sm text-gray-500'>
                  Remaining signatures: {doc.remaining_signatures}
                </p>
              </div>
              {doc.remaining_signatures > 0 && (
                <button className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200'>
                  Share Document
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className='text-xl font-semibold mb-4 text-gray-800'>
          Documents You Have Signed
        </h2>
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          {signedDocs.map((doc: any) => (
            <div
              key={doc.id}
              className='flex items-center justify-between p-4 border-b last:border-b-0'
            >
              <div>
                <p className='font-medium text-gray-700'>
                  Document {doc.pending_documents.id}
                </p>
                <p className='text-sm text-gray-500'>
                  Signed at: {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
              <Link
                href={{
                  pathname: `/document/${doc.pending_documents.ipfs_hash}`,
                }}
                className='px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition duration-200'
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
