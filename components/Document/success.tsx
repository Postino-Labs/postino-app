import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDocumentContext } from '@/contexts/DocumentContext';
import DocumentView from './documentView';
import { FiCheckCircle, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const SuccessView: React.FC = () => {
  const { state, setState } = useDocumentContext();
  const router = useRouter();

  const displayState = {
    file: state.file,
    ipfsHash: state.ipfsHash,
    recipients: state.recipients,
    requireWorldID: state.requireWorldID,
    attestationId: state.attestation?.id || '',
  };

  // Function to reset the state
  const resetState = () => {
    setState({
      file: null,
      recipients: [],
      requiredSignatures: 1,
      requireWorldID: false,
      ipfsHash: '',
      attestation: null,
      creatorSignature: null,
      currentStep: 1,
      documentId: undefined,
      isConfirmed: false,
    });
  };

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      resetState();
    };
  }, []);

  useEffect(() => {
    // Trigger confetti animation on component mount
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const handleBackToDashboard = () => {
    resetState();
    router.push('/dashboard'); // Adjust this route as needed
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='max-w-4xl mx-auto p-6'
    >
      <Card className='mb-8 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600'>
        <CardHeader>
          <CardTitle className='text-3xl font-bold text-white flex items-center'>
            <FiCheckCircle className='mr-2' />
            Congratulations!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-xl text-white'>
            Your document has been successfully attested and is now ready for
            signing!
          </p>
        </CardContent>
      </Card>

      <Card className='mb-8'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-gray-800'>
            Document Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentView
            file={displayState.file}
            ipfsHash={displayState.ipfsHash}
            recipients={displayState?.recipients || []}
            requireWorldID={displayState.requireWorldID}
            attestationId={displayState.attestationId}
          />
        </CardContent>
      </Card>

      <motion.div
        className='mt-6 flex flex-row justify-between'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <Button
          onClick={handleBackToDashboard}
          className='bg-yellow-400 text-white px-6 py-3 rounded-md hover:bg-yellow-500 transition-colors duration-300 text-lg font-semibold flex items-center'
        >
          <FiArrowLeft className='mr-2' />
          Back to Dashboard
        </Button>
        <Link href={`/document/${displayState.ipfsHash}`}>
          <Button className='bg-yellow-400 text-white px-6 py-3 rounded-md hover:bg-yellow-500 transition-colors duration-300 text-lg font-semibold flex items-center'>
            <FiArrowRight className='mr-2' />
            Check Document
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default SuccessView;
