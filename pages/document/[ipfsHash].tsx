import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabase';
import Layout from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  Maximize,
  Minimize,
  XCircle,
} from 'lucide-react';

const DocumentDetails = () => {
  const router = useRouter();
  const { ipfsHash } = router.query;
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullView, setIsFullView] = useState(false);

  useEffect(() => {
    if (ipfsHash) {
      fetchDocumentDetails(ipfsHash as string);
    }
  }, [ipfsHash]);

  const fetchDocumentDetails = async (ipfsHash: string) => {
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

  const LoadingSkeleton = () => (
    <div className='space-y-6'>
      <Skeleton className='h-64 w-full' />
      <Skeleton className='h-12 w-3/4' />
      <Skeleton className='h-4 w-1/2' />
      <div className='grid grid-cols-2 gap-6'>
        <Skeleton className='h-24' />
        <Skeleton className='h-24' />
        <Skeleton className='h-24' />
        <Skeleton className='h-24' />
      </div>
    </div>
  );

  const MotionCard = motion(Card);

  const DocumentPreview = ({ ipfsHash }: { ipfsHash: string }) => (
    <MotionCard
      className='mb-8 overflow-hidden'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <CardHeader className='border-b border-gray-100'>
        <CardTitle className='flex items-center justify-between'>
          <div className='flex items-center'>
            <FileText className='mr-2' />
            Document Preview
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsFullView(!isFullView)}
          >
            {isFullView ? (
              <Minimize className='mr-2' />
            ) : (
              <Maximize className='mr-2' />
            )}
            {isFullView ? 'Minimize' : 'Full View'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className='p-0'>
        <motion.div
          animate={{ height: isFullView ? '80vh' : '300px' }}
          transition={{ duration: 0.3 }}
        >
          <iframe
            src={`https://peach-fuzzy-woodpecker-421.mypinata.cloud/ipfs/${ipfsHash}`}
            className='w-full h-full border-0'
            title='PDF Preview'
          />
        </motion.div>
      </CardContent>
    </MotionCard>
  );

  return (
    <Layout>
      <div className='p-6 max-w-4xl mx-auto'>
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardContent className='pt-6'>
              <p className='text-center text-red-500'>{error}</p>
            </CardContent>
          </MotionCard>
        ) : document ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className='text-3xl font-bold mb-6 text-gray-800'>
              Document: {document.ipfs_hash.substring(0, 15)}...
            </h1>

            {/* Document Preview */}
            <DocumentPreview ipfsHash={document.ipfs_hash} />

            {/* Document Details Card */}
            <MotionCard
              className='mb-8 overflow-hidden'
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CardHeader className='border-b border-gray-100'>
                <CardTitle>Document Details</CardTitle>
              </CardHeader>
              <CardContent className='grid grid-cols-2 gap-6 p-6'>
                <div className='flex items-center space-x-3'>
                  <Calendar className='text-yellow-500' />
                  <div>
                    <p className='text-sm font-medium text-gray-500'>Created</p>
                    <p className='text-gray-700'>
                      {new Date(document.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  {document.remaining_signatures === 0 ? (
                    <CheckCircle className='text-green-500' />
                  ) : (
                    <XCircle className='text-red-500' />
                  )}
                  <div>
                    <p className='text-sm font-medium text-gray-500'>Status</p>
                    <Badge
                      variant={
                        document.remaining_signatures === 0
                          ? 'default'
                          : 'destructive'
                      }
                      className='mt-1'
                    >
                      {document.remaining_signatures === 0
                        ? 'Completed'
                        : 'Pending'}
                    </Badge>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <FileText className='text-yellow-500' />
                  <div>
                    <p className='text-sm font-medium text-gray-500'>
                      Required Signatures
                    </p>
                    <p className='text-gray-700'>
                      {document.required_signatures}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <FileText className='text-yellow-500' />
                  <div>
                    <p className='text-sm font-medium text-gray-500'>
                      Remaining Signatures
                    </p>
                    <p className='text-gray-700'>
                      {document.remaining_signatures}
                    </p>
                  </div>
                </div>
              </CardContent>
            </MotionCard>

            {/* Signatures Card */}
            <MotionCard
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <CardHeader className='border-b border-gray-100'>
                <CardTitle>Signatures</CardTitle>
              </CardHeader>
              <CardContent className='p-6'>
                <div className='space-y-4'>
                  {document.signatures.map(
                    (signature: string, index: number) => (
                      <motion.div
                        key={index}
                        className='flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow duration-200'
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div>
                          <p className='font-semibold text-gray-700'>
                            {signature.substring(0, 20)}...
                          </p>
                        </div>
                        <Badge
                          variant='outline'
                          className='bg-green-50 text-green-700 border-green-200'
                        >
                          Signed
                        </Badge>
                      </motion.div>
                    )
                  )}
                </div>
              </CardContent>
            </MotionCard>
          </motion.div>
        ) : (
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardContent className='pt-6'>
              <p className='text-center text-gray-500'>Document not found</p>
            </CardContent>
          </MotionCard>
        )}
      </div>
    </Layout>
  );
};

export default DocumentDetails;
