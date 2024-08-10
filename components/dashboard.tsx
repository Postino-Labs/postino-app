import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/router';
import { toast, Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Share2, Eye, Zap, CheckCircle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { truncate } from '@/utils/truncate';

const DocumentItem = ({ doc, type }: any) => {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);

  const handleCardClick = () => {
    router.push(
      `/document/${
        type === 'signed' ? doc.pending_documents.ipfs_hash : doc.ipfs_hash
      }`
    );
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/document/${
      type === 'signed' ? doc.pending_documents.ipfs_hash : doc.ipfs_hash
    }`;
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div
      className='flex justify-between items-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer'
      onClick={handleCardClick}
    >
      <div>
        <h3 className='font-medium text-lg'>
          Document{' '}
          {(type === 'signed' ? doc.pending_documents.ipfs_hash : doc.ipfs_hash)
            ?.toString()
            .slice(-10)}
        </h3>
        {type === 'assigned' && (
          <p className='text-sm text-gray-600'>
            Created by: {truncate(doc.users.worldcoin_id)}
          </p>
        )}
        {type !== 'signed' && (
          <p className='text-sm text-gray-600'>
            {doc.remaining_signatures > 0 ? (
              `Remaining signatures: ${doc.remaining_signatures}`
            ) : (
              <div className='flex flex-row items-center gap-2'>
                Signatures completed
                <CheckCircle className='h-4 w-4 text-green-500' />
              </div>
            )}
          </p>
        )}
        {type === 'signed' && (
          <p className='text-sm text-gray-600'>
            Signed at: {new Date(doc.created_at).toLocaleDateString()}
          </p>
        )}
      </div>
      <Button
        variant='ghost'
        size='sm'
        className='text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
        onClick={handleShare}
      >
        <Share2 className='mr-2 h-4 w-4' />
        {isCopied ? 'Copied!' : 'Share'}
      </Button>
    </div>
  );
};

export default function Dashboard() {
  const { account, isLoading } = useAuth();
  const [pendingDocs, setPendingDocs] = useState<any[]>([]);
  const [signedDocs, setSignedDocs] = useState<any[]>([]);
  const [assignedDocs, setAssignedDocs] = useState<any[]>([]);

  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    fetchDocuments();
  }, [account]);

  async function fetchDocuments() {
    setIsLoadingDocs(true);

    // Fetch documents where the user is the creator
    let { data: createdDocs, error: pendingError } = await supabase
      .from('pending_documents')
      .select('*, users!inner(*)')
      .eq('users.worldcoin_id', account);

    if (pendingError)
      console.error('Error fetching pending documents:', pendingError);
    else setPendingDocs(createdDocs || []);

    // Fetch documents where the user is a recipient
    let { data: assignedDocs, error: recipientError } = await supabase
      .from('pending_documents')
      .select('*, users!inner(*)')
      .contains('recipients', [account]);

    if (recipientError)
      console.error('Error fetching assigned documents:', recipientError);
    else setAssignedDocs(assignedDocs || []);

    // Fetch signed documents
    let { data: signedDocuments, error: recentError } = await supabase
      .from('user_signatures')
      .select('*, users!inner(ethereum_address), pending_documents(*)')
      .eq('users.ethereum_address', account)
      .order('created_at', { ascending: false });

    // If the above query doesn't work, try this alternative:
    if (!signedDocuments || signedDocuments.length === 0) {
      let { data: signedWorldcoinDocuments, error: recentError } =
        await supabase
          .from('user_signatures')
          .select('*, users!inner(ethereum_address), pending_documents(*)')
          .eq('users.ethereum_address', account)
          .order('created_at', { ascending: false });

      if (signedWorldcoinDocuments && signedWorldcoinDocuments.length > 0) {
        signedDocuments = signedWorldcoinDocuments;
        recentError = recentError;
      }
    }
    console.log({ signedDocuments });
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

  const NotLoggedInView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='space-y-12'
    >
      <div className='text-center'>
        <motion.h1
          className='text-4xl font-bold text-yellow-600 mb-4'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Welcome to Postino
        </motion.h1>
        <motion.p
          className='text-xl text-gray-600 mb-8'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Revolutionizing document signing with cutting-edge Web3 security
        </motion.p>
      </div>

      <div className='grid md:grid-cols-3 gap-8'>
        {[
          {
            title: 'Create',
            icon: Zap,
            description: 'Easily create and upload documents for signing',
          },
          {
            title: 'Sign',
            icon: FileText,
            description: 'Securely sign documents with unparalleled protection',
          },
          {
            title: 'Manage',
            icon: Eye,
            description: 'Track and manage all your documents in one place',
          },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
          >
            <Card className='text-center h-full flex flex-col justify-between'>
              <CardHeader>
                <feature.icon className='w-12 h-12 mx-auto text-yellow-500 mb-4' />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600'>{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        className='bg-[#f5f0e5] p-8 rounded-lg'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <h2 className='text-2xl font-bold mb-4 text-center'>
          Unmatched Security with Postino
        </h2>
        <ul className='space-y-4'>
          {[
            {
              title: 'Worldcoin Identity Verification',
              description:
                'Ensure signer authenticity with biometric-based identity verification, providing an unparalleled level of trust and security.',
            },
            {
              title: 'Ethereum Attestation Service (EAS)',
              description:
                'Leverage the power of blockchain to create tamper-proof, verifiable records of every signature and document state.',
            },
            {
              title: 'Web3 Technology',
              description:
                'Utilize decentralized infrastructure to eliminate single points of failure and enhance data integrity.',
            },
            {
              title: 'Real-time Tracking',
              description:
                'Monitor document status and signatures in real-time, ensuring transparency throughout the signing process.',
            },
          ].map((point, index) => (
            <motion.li
              key={index}
              className='flex items-start'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
            >
              <Shield className='h-6 w-6 text-yellow-500 mr-3 mt-1 flex-shrink-0' />
              <div>
                <h3 className='font-semibold text-lg'>{point.title}</h3>
                <p className='text-gray-600'>{point.description}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );

  return (
    <div className='max-w-6xl mx-auto space-y-8 p-6'>
      <Toaster position='top-right' />
      {account && (
        <motion.h1
          className='text-4xl font-bold text-gray-700 mb-8'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome to your Dashboard
        </motion.h1>
      )}

      {isLoadingDocs ? (
        <LoadingSkeleton />
      ) : account ? (
        <div className='space-y-8'>
          <div className='grid md:grid-cols-2 gap-8'>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className='shadow-sm hover:shadow-md transition-shadow duration-200 h-full'>
                <CardHeader className='border-b border-gray-100'>
                  <CardTitle className='flex items-center text-xl'>
                    <Zap className='mr-2 h-6 w-6 text-yellow-500' />
                    Created Documents
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className='bg-white p-6 overflow-y-auto'
                  style={{ maxHeight: '400px' }}
                >
                  <div className='space-y-4'>
                    {pendingDocs.map((doc: any, index) => (
                      <DocumentItem key={doc.id} doc={doc} type='created' />
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
              <Card className='shadow-sm hover:shadow-md transition-shadow duration-200 h-full'>
                <CardHeader className='border-b border-gray-100'>
                  <CardTitle className='flex items-center text-xl'>
                    <FileText className='mr-2 h-6 w-6 text-yellow-500' />
                    Assigned Documents
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className='bg-white p-6 overflow-y-auto'
                  style={{ maxHeight: '400px' }}
                >
                  <div className='space-y-4'>
                    {assignedDocs.map((doc: any, index) => (
                      <DocumentItem key={doc.id} doc={doc} type='assigned' />
                    ))}
                    {assignedDocs.length === 0 && (
                      <p className='text-gray-500 text-center py-4'>
                        No assigned documents yet.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className='shadow-sm hover:shadow-md transition-shadow duration-200'>
              <CardHeader className='border-b border-gray-100'>
                <CardTitle className='flex items-center text-xl'>
                  <CheckCircle className='mr-2 h-6 w-6 text-green-500' />
                  Signed Documents
                </CardTitle>
              </CardHeader>
              <CardContent
                className='bg-white p-6 overflow-y-auto'
                style={{ maxHeight: '400px' }}
              >
                <div className='space-y-4'>
                  {signedDocs.map((doc: any, index) => (
                    <DocumentItem key={doc.id} doc={doc} type='signed' />
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
      ) : (
        <NotLoggedInView />
      )}
    </div>
  );
}
