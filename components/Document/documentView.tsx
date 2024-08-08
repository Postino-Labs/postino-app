import { Recipient } from '@/contexts/DocumentContext';
import React from 'react';
import { FiFile, FiUsers, FiCheck, FiX } from 'react-icons/fi';

interface DocumentViewProps {
  file: File | null;
  ipfsHash: string;
  recipients: Recipient[] | [];
  requireWorldID: boolean;
  attestationId: string;
}

const DocumentView: React.FC<DocumentViewProps> = ({
  file,
  ipfsHash,
  recipients,
  requireWorldID,
  attestationId,
}) => {
  return (
    <div className='bg-white shadow-md rounded-lg p-6'>
      <h2 className='text-2xl font-bold mb-6'>Document Details</h2>

      <div className='mb-6'>
        <h3 className='text-lg font-semibold mb-2 flex items-center'>
          <FiFile className='mr-2' /> File Information
        </h3>
        <p>
          <strong>File Name:</strong> {file?.name || 'N/A'}
        </p>
        <p>
          <strong>File Type:</strong> {file?.type || 'N/A'}
        </p>
        <p>
          <strong>File Size:</strong>{' '}
          {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
        </p>
      </div>

      <div className='mb-6'>
        <h3 className='text-lg font-semibold mb-2'>IPFS Information</h3>
        <p>
          <strong>IPFS Hash:</strong> {ipfsHash}
        </p>
      </div>

      <div className='mb-6'>
        <h3 className='text-lg font-semibold mb-2 flex items-center'>
          <FiUsers className='mr-2' /> Recipients
        </h3>
        {recipients.length > 0 ? (
          <ul className='list-disc pl-5'>
            {recipients.map((recipient, index) => (
              <li key={index}>
                {recipient.web3Address && `${recipient.web3Address}`}
              </li>
            ))}
          </ul>
        ) : (
          <p>No recipients added</p>
        )}
      </div>

      <div className='mb-6'>
        <h3 className='text-lg font-semibold mb-2'>
          Verification Requirements
        </h3>
        <div className='flex items-center'>
          <p className='mr-2'>World ID Verification Required:</p>
          {requireWorldID ? (
            <FiCheck className='text-green-500' />
          ) : (
            <FiX className='text-red-500' />
          )}
        </div>
      </div>

      <div className='mb-6'>
        <h3 className='text-lg font-semibold mb-2'>Attestation Information</h3>
        <p>
          <strong>Attestation ID:</strong> {attestationId}
        </p>
      </div>
    </div>
  );
};

export default DocumentView;
