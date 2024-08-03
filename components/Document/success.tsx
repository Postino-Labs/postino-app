import React from 'react';
import { useDocumentContext } from '@/contexts/DocumentContext';
import DocumentView from './documentView';
import { FiCheckCircle } from 'react-icons/fi';

const SuccessView: React.FC = () => {
  const { state } = useDocumentContext();

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
        file={state.file}
        ipfsHash={state.ipfsHash}
        recipients={state.recipients}
        requireWorldID={state.requireWorldID}
        attestationId={state.attestation?.id || ''}
      />

      <div className='mt-6'>
        <button
          onClick={() => {
            /* Handle navigation to dashboard or new document creation */
          }}
          className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300'
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default SuccessView;
