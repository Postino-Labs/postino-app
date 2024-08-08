import React, { useState } from 'react';
import { useDocumentContext } from '@/contexts/DocumentContext';
import { FiUploadCloud, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface UploadToIPFSProps {
  onNext: () => void;
  onPrev: () => void;
}

const UploadToIPFS: React.FC<UploadToIPFSProps> = ({ onNext, onPrev }) => {
  const { state, setState } = useDocumentContext();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!state.file) {
      setError('No file selected');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', state.file);

    try {
      const response = await fetch('/api/upload-to-ipfs', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

      const data = await response.json();
      setState((prevState) => ({ ...prevState, ipfsHash: data.ipfsHash }));
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      setError('Failed to upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    if (state.ipfsHash) {
      onNext();
    } else {
      setError('Please upload the document to IPFS first.');
    }
  };

  return (
    <Card className='max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden'>
      <CardHeader className='border-b border-yellow-500'>
        <CardTitle className='text-2xl font-bold text-gray-500'>
          Upload to IPFS
        </CardTitle>
      </CardHeader>
      <CardContent className='p-6'>
        <div className='mb-8 bg-white shadow-md rounded-lg p-6'>
          <div className='flex flex-col items-center justify-center mb-6'>
            {state.ipfsHash ? (
              <FiCheck className='text-green-500 text-6xl mb-4' />
            ) : (
              <FiUploadCloud className='text-yellow-400 text-6xl mb-4' />
            )}
            <p className='text-center text-lg'>
              {state.ipfsHash
                ? 'Your document has been successfully uploaded to IPFS.'
                : 'Upload your document to IPFS for secure, decentralized storage.'}
            </p>
          </div>
          {state.file && !state.ipfsHash && (
            <p className='text-sm text-gray-600 mb-4 text-center'>
              Selected file: {state.file.name}
            </p>
          )}
          {!state.ipfsHash && (
            <div className='flex justify-center mb-6'>
              <button
                onClick={handleUpload}
                disabled={isUploading || !state.file}
                className={`flex items-center justify-center w-full max-w-xs bg-yellow-400 text-white px-4 py-2 rounded-md hover:bg-yellow-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300`}
              >
                {isUploading ? (
                  <>
                    <svg
                      className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FiUploadCloud className='mr-2' />
                    Upload to IPFS
                  </>
                )}
              </button>
            </div>
          )}
          {state.ipfsHash && (
            <div className='mt-4 p-4 bg-gray-50 rounded-md'>
              <p className='text-sm font-semibold mb-2'>IPFS Hash:</p>
              <p className='text-xs break-all'>{state.ipfsHash}</p>
            </div>
          )}
          {error && (
            <div className='mt-4 p-4 bg-red-100 text-red-700 rounded-md flex items-center'>
              <FiAlertTriangle className='mr-2' />
              <p className='text-sm'>{error}</p>
            </div>
          )}
        </div>
        <div className='flex justify-between'>
          <button
            onClick={onPrev}
            className='bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-300'
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className='bg-yellow-400 text-white px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors duration-300'
          >
            Next
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadToIPFS;
