import React, { useState } from 'react';
import { useDocumentContext } from '@/contexts/DocumentContext';
import { FiCheckCircle, FiAlertTriangle, FiLock } from 'react-icons/fi';

interface CreateAttestationProps {
  onNext: () => void;
  onPrev: () => void;
}

const CreateAttestation: React.FC<CreateAttestationProps> = ({
  onNext,
  onPrev,
}) => {
  const { state, setState } = useDocumentContext();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCreatingAttestation, setIsCreatingAttestation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWorldIDVerification = async () => {
    setIsVerifying(true);
    setError(null);
    try {
      // Implement World ID verification logic here
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulating verification delay
      setState((prevState) => ({ ...prevState, creatorSignature: 'verified' }));
    } catch (error) {
      console.error('Error during World ID verification:', error);
      setError('World ID verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCreateAttestation = async () => {
    setIsCreatingAttestation(true);
    setError(null);
    try {
      // Implement your attestation creation logic here
      // For example, using EAS
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulating attestation creation delay
      const attestationResult = { id: 'attest-0x1234567890abcdef' }; // Replace with actual attestation
      setState((prevState) => ({
        ...prevState,
        attestation: attestationResult,
      }));
    } catch (error) {
      console.error('Error creating attestation:', error);
      setError('Failed to create attestation. Please try again.');
    } finally {
      setIsCreatingAttestation(false);
    }
  };

  const handleNext = () => {
    if (state.attestation) {
      onNext();
    } else {
      setError('Please create the attestation first.');
    }
  };

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <h2 className='text-2xl font-bold mb-6'>Create Attestation</h2>

      <div className='bg-white shadow-md rounded-lg p-6 mb-6'>
        {state.requireWorldID && !state.creatorSignature && (
          <div className='mb-6'>
            <h3 className='text-lg font-semibold mb-2 flex items-center'>
              <FiAlertTriangle className='mr-2 text-yellow-500' /> World ID
              Verification Required
            </h3>
            <p className='text-sm text-gray-600 mb-4'>
              You must complete World ID verification before creating the
              attestation.
            </p>
            <button
              onClick={handleWorldIDVerification}
              disabled={isVerifying}
              className='bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 disabled:bg-gray-400 transition-colors duration-300'
            >
              {isVerifying ? 'Verifying...' : 'Complete World ID Verification'}
            </button>
          </div>
        )}

        {state.creatorSignature && (
          <div className='mb-6'>
            <h3 className='text-lg font-semibold mb-2 flex items-center'>
              <FiCheckCircle className='mr-2 text-green-500' /> World ID
              Verification Complete
            </h3>
            <p className='text-sm text-gray-600'>
              Your identity has been verified. You can now create the
              attestation.
            </p>
          </div>
        )}

        <div className='mb-6'>
          <h3 className='text-lg font-semibold mb-2'>Create Attestation</h3>
          <button
            onClick={handleCreateAttestation}
            disabled={
              isCreatingAttestation ||
              (state.requireWorldID && !state.creatorSignature)
            }
            className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors duration-300'
          >
            {isCreatingAttestation
              ? 'Creating Attestation...'
              : 'Create Attestation'}
          </button>
        </div>

        {state.attestation && (
          <div className='mt-4 p-4 bg-green-100 rounded-md'>
            <h3 className='text-lg font-semibold mb-2 flex items-center'>
              <FiCheckCircle className='mr-2 text-green-500' /> Attestation
              Created
            </h3>
            <p className='text-sm'>
              Attestation ID:{' '}
              <span className='font-mono'>{state.attestation.id}</span>
            </p>
          </div>
        )}

        {error && (
          <div className='mt-4 p-4 bg-red-100 text-red-700 rounded-md'>
            <p className='text-sm'>{error}</p>
          </div>
        )}
      </div>

      {(state.creatorSignature || state.attestation) && (
        <div className='bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <FiLock className='h-5 w-5 text-yellow-500' />
            </div>
            <div className='ml-3'>
              <p className='text-sm text-yellow-700'>
                The document is now locked and cannot be edited.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className='flex justify-between'>
        <button
          onClick={onPrev}
          className='bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-300'
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={!state.attestation}
          className='bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400 transition-colors duration-300'
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CreateAttestation;
