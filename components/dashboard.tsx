import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Share2, Eye, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { account, isLoading } = useAuth();
  const [pendingDocs, setPendingDocs] = useState<any[]>([]);
  const [signedDocs, setSignedDocs] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    fetchDocuments();
  }, [account]);

  async function fetchDocuments() {
    setIsLoadingDocs(true);
    let { data: createdDocs, error: pendingError } = await supabase
      .from('pending_documents')
      .select('*, users!inner(*)')
      .eq('users.worldcoin_id', account);

    if (pendingError)
      console.error('Error fetching pending documents:', pendingError);
    else setPendingDocs(createdDocs || []);

    let { data: signedDocuments, error: recentError } = await supabase
      .from('user_signatures')
      .select(`*, users!inner(worldcoin_id), pending_documents(*)`)
      .eq('users.worldcoin_id', account)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError)
      console.error('Error fetching signed documents:', recentError);
    else setSignedDocs(signedDocuments || []);

    setIsLoadingDocs(false);
  }

  const LoadingSkeleton = () => (
    <div className='space-y-4'>
      <Skeleton className='h-12 w-3/4' />
      <Skeleton className='h-32 w-full' />
      <Skeleton className='h-32 w-full' />
    </div>
  );

  return (
    <div className='max-w-6xl mx-auto space-y-8 p-6 '>
      <motion.h1
        className='text-4xl font-bold text-gray-500 mb-8'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome to Your Dashboard
      </motion.h1>

      {isLoadingDocs ? (
        <LoadingSkeleton />
      ) : (
        <div className='grid md:grid-cols-2 gap-8'>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className='shadow-sm hover:shadow-md transition-shadow duration-200'>
              <CardHeader className='border-b border-gray-100'>
                <CardTitle className='flex items-center text-xl'>
                  <Zap className='mr-2 h-6 w-6' />
                  Created Documents
                </CardTitle>
              </CardHeader>
              <CardContent className='bg-white p-6'>
                <div className='space-y-4'>
                  {pendingDocs.map((doc: any, index) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className='flex justify-between items-center p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200'
                    >
                      <div>
                        <h3 className='font-medium text-lg'>
                          Document {doc.id}
                        </h3>
                        <p className='text-sm text-gray-500'>
                          Remaining signatures: {doc.remaining_signatures}
                        </p>
                      </div>
                      {doc.remaining_signatures > 0 && (
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                        >
                          <Share2 className='mr-2 h-4 w-4' />
                          Share
                        </Button>
                      )}
                    </motion.div>
                  ))}
                  {pendingDocs.length === 0 && (
                    <p className='text-gray-500 text-center py-4'>
                      No created documents yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className='shadow-sm hover:shadow-md transition-shadow duration-200'>
              <CardHeader className='border-b border-gray-100'>
                <CardTitle className='flex items-center text-xl'>
                  <FileText className='mr-2 h-6 w-6' />
                  Signed Documents
                </CardTitle>
              </CardHeader>
              <CardContent className='bg-white p-6'>
                <div className='space-y-4'>
                  {signedDocs.map((doc: any, index) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className='flex items-center justify-between p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200'
                    >
                      <div>
                        <p className='font-medium text-lg'>
                          Document {doc.pending_documents.id}
                        </p>
                        <p className='text-sm text-gray-500'>
                          Signed at:{' '}
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Link
                        href={{
                          pathname: `/document/${doc.pending_documents.ipfs_hash}`,
                        }}
                        passHref
                      >
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                        >
                          <Eye className='mr-2 h-4 w-4' />
                          View
                        </Button>
                      </Link>
                    </motion.div>
                  ))}
                  {signedDocs.length === 0 && (
                    <p className='text-gray-500 text-center py-4'>
                      No signed documents yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
