import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDocumentContext } from '@/contexts/DocumentContext';
import DocumentView from './documentView';
import { FiCheckCircle } from 'react-icons/fi';

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

  const handleBackToDashboard = () => {
    resetState();
    router.push('/dashboard'); // Adjust this route as needed
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <div className='bg-green-100 border-l-4 border-green-500 p-4 mb-6'>
        <div className='flex'>
          <div className='flex-shrink-0'>
            <FiCheckCircle className='h-5 w-5 text-green-500' />
          </div>
          <div className='ml-3'>
            <p className='text-lg font-medium text-green-800'>
              Document Successfully Attested!
            </p>
            <p className='text-sm text-green-700 mt-2'>
              Your document has been successfully uploaded, attested, and is now
              ready for signing.
            </p>
          </div>
        </div>
      </div>

      <DocumentView
        file={displayState.file}
        ipfsHash={displayState.ipfsHash}
        recipients={displayState?.recipients || []}
        requireWorldID={displayState.requireWorldID}
        attestationId={displayState.attestationId}
      />

      <div className='mt-6'>
        <button
          onClick={handleBackToDashboard}
          className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300'
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default SuccessView;
