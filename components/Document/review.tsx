import React, { useState } from 'react';
import {
  FiFile,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
} from 'react-icons/fi';
import axios from 'axios';
import { useDocumentContext } from '@/contexts/DocumentContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

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
      if (state.documentId) {
        console.log('Document already exists:', state.documentId);
        onNext();
        return;
      }

      const checkResponse = await axios.get(
        `/api/check-document?ipfsHash=${state.ipfsHash}`
      );

      if (checkResponse.data.exists) {
        console.log('Document already exists:', checkResponse.data.documentId);
        setState((prevState) => ({
          ...prevState,
          isConfirmed: true,
          isLocked: true,
          documentId: checkResponse.data.documentId,
        }));
        onNext();
        return;
      }

      const response = await axios.post('/api/initiate-document', {
        ipfsHash: state.ipfsHash,
        requiredSignatures: state.requiredSignatures,
        worldcoinProofRequired: state.requireWorldID,
        recipients: state.recipients.map((recipient) => recipient.web3Address),
        creatorId,
      });

      if (response.data.documentId) {
        setState((prevState) => ({
          ...prevState,
          isConfirmed: true,
          isLocked: true,
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
    <Card className='max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden'>
      <CardHeader className='border-b border-yellow-500'>
        <CardTitle className='text-2xl font-bold text-yellow-900'>
          Review Document
        </CardTitle>
      </CardHeader>
      <CardContent className='p-6'>
        <div className='bg-white shadow-md rounded-lg p-6 mb-6'>
          <h3 className='text-lg font-semibold mb-4 flex items-center text-gray-700'>
            <FiFile className='mr-2 text-yellow-400' /> Document Details
          </h3>
          <div className='space-y-2 text-gray-600'>
            <p>
              <span className='font-medium'>File Name:</span> {state.file?.name}
            </p>
            <p>
              <span className='font-medium'>File Type:</span> {state.file?.type}
            </p>
            <p>
              <span className='font-medium'>File Size:</span>{' '}
              {state.file
                ? `${(state.file.size / 1024 / 1024).toFixed(2)} MB`
                : 'N/A'}
            </p>
            <p>
              <span className='font-medium'>IPFS Hash:</span>{' '}
              {state.ipfsHash || 'Not uploaded yet'}
            </p>
          </div>
        </div>

        <div className='bg-white shadow-md rounded-lg p-6 mb-6'>
          <h3 className='text-lg font-semibold mb-4 flex items-center text-gray-700'>
            <FiUsers className='mr-2 text-yellow-400' /> Recipients
          </h3>
          {state.recipients && state.recipients.length > 0 ? (
            <ul className='space-y-2'>
              {state.recipients.map((recipient, index) => (
                <li key={index} className='bg-gray-50 p-3 rounded-md'>
                  <p className='font-medium'>{recipient.web3Address}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-gray-600'>No recipients added</p>
          )}
        </div>

        <div className='bg-white shadow-md rounded-lg p-6 mb-6'>
          <h3 className='text-lg font-semibold mb-4 flex items-center text-gray-700'>
            <FiCheckCircle className='mr-2 text-yellow-400' /> Verification
            Requirements
          </h3>
          <div className='flex items-center text-gray-600'>
            <p className='mr-2'>World ID Verification Required:</p>
            {state.requireWorldID ? (
              <FiCheckCircle className='text-green-500 text-xl' />
            ) : (
              <FiXCircle className='text-red-500 text-xl' />
            )}
          </div>
        </div>

        {error && (
          <div
            className='bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md flex items-center'
            role='alert'
          >
            <FiAlertTriangle className='mr-2 text-xl' />
            <span>{error}</span>
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
            className={`bg-yellow-400 text-white px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors duration-300 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Initiating...' : 'Confirm and Continue'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewStep;
