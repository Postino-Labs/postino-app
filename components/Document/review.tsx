import React, { useState } from 'react';
import { FiFile, FiUsers, FiCheck, FiX } from 'react-icons/fi';
import axios from 'axios';
import { useDocumentContext } from '@/contexts/DocumentContext';
import { useAuth } from '@/hooks/useAuth';

const ReviewStep: React.FC<{ onNext: () => void; onPrev: () => void }> = ({
  onNext,
  onPrev,
}) => {
  const { user, authType } = useAuth();
  const { state, setState } = useDocumentContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const creatorId = authType === 'worldcoin' ? user.name : user.address;
  const handleConfirm = async () => {
    if (!creatorId) return setError('No user logged in');
    setIsLoading(true);
    setError(null);

    try {
      // Check if the document already exists in the state
      if (state.documentId) {
        console.log('Document already exists:', state.documentId);
        onNext();
        return;
      }

      // Check if the document already exists in the database
      const checkResponse = await axios.get(
        `/api/check-document?ipfsHash=${state.ipfsHash}`
      );

      if (checkResponse.data.exists) {
        console.log('Document already exists:', checkResponse.data.documentId);
        setState((prevState) => ({
          ...prevState,
          isConfirmed: true,
          documentId: checkResponse.data.documentId,
        }));
        onNext();
        return;
      }

      // If the document doesn't exist, create a new one
      const response = await axios.post('/api/initiate-document', {
        ipfsHash: state.ipfsHash,
        requiredSignatures: state.recipients.length + 1,
        worldcoinProofRequired: state.requireWorldID,
        creatorId,
      });

      if (response.data.documentId) {
        setState((prevState) => ({
          ...prevState,
          isConfirmed: true,
          documentId: response.data.documentId,
        }));
        onNext();
      } else {
        setError('Failed to initiate document. Please try again.');
      }
    } catch (error) {
      console.error('Error initiating document:', error);
      setError(
        'An error occurred while initiating the document. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='max-w-3xl mx-auto'>
      <h2 className='text-2xl font-bold mb-6'>Review Document</h2>

      <div className='bg-white shadow-md rounded-lg p-6 mb-6'>
        <h3 className='text-lg font-semibold mb-4 flex items-center'>
          <FiFile className='mr-2' /> Document Details
        </h3>
        <div className='mb-4'>
          <p>
            <strong>File Name:</strong> {state.file?.name}
          </p>
          <p>
            <strong>File Type:</strong> {state.file?.type}
          </p>
          <p>
            <strong>File Size:</strong>{' '}
            {state.file
              ? `${(state.file.size / 1024 / 1024).toFixed(2)} MB`
              : 'N/A'}
          </p>
        </div>
        <div className='mb-4'>
          <p>
            <strong>IPFS Hash:</strong> {state.ipfsHash || 'Not uploaded yet'}
          </p>
        </div>
      </div>

      <div className='bg-white shadow-md rounded-lg p-6 mb-6'>
        <h3 className='text-lg font-semibold mb-4 flex items-center'>
          <FiUsers className='mr-2' /> Recipients
        </h3>
        {state.recipients && state.recipients.length > 0 ? (
          <ul className='list-disc pl-5'>
            {state.recipients.map((recipient, index) => (
              <li key={index} className='mb-2'>
                <strong>{recipient.name}</strong> ({recipient.email})
                <br />
                {recipient.web3Address && `${recipient.web3Address}`}
              </li>
            ))}
          </ul>
        ) : (
          <p>No recipients added</p>
        )}
      </div>

      <div className='bg-white shadow-md rounded-lg p-6 mb-6'>
        <h3 className='text-lg font-semibold mb-4'>
          Verification Requirements
        </h3>
        <div className='flex items-center'>
          <p className='mr-2'>World ID Verification Required:</p>
          {state.requireWorldID ? (
            <FiCheck className='text-green-500' />
          ) : (
            <FiX className='text-red-500' />
          )}
        </div>
      </div>

      {error && (
        <div
          className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4'
          role='alert'
        >
          <strong className='font-bold'>Error: </strong>
          <span className='block sm:inline'>{error}</span>
        </div>
      )}

      <div className='flex justify-between mt-6'>
        <button
          onClick={onPrev}
          className='bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-300'
          disabled={isLoading}
        >
          Previous
        </button>
        <button
          onClick={handleConfirm}
          className={`bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Initiating...' : 'Confirm and Continue'}
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;
