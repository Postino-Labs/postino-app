import React from 'react';
import { useDocumentContext } from '@/contexts/DocumentContext';
import { FiFile, FiUsers, FiCheck, FiX } from 'react-icons/fi';

const ReviewStep: React.FC<{ onNext: () => void; onPrev: () => void }> = ({
  onNext,
  onPrev,
}) => {
  const { state } = useDocumentContext();

  return (
    <div className='max-w-2xl mx-auto p-6'>
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

      <div className='flex justify-between mt-6'>
        <button
          onClick={onPrev}
          className='bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-300'
        >
          Previous
        </button>
        <button
          onClick={onNext}
          className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300'
        >
          Confirm and Continue
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;
