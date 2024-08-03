import React, { useCallback, useState } from 'react';
import { useDocumentContext } from '@/contexts/DocumentContext';
import { useDropzone } from 'react-dropzone';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Recipient {
  name: string;
  email: string;
  web3Address?: string;
}

const CreateDocument: React.FC<{
  onNext: () => void;
  onPrev?: () => void;
}> = ({ onNext }) => {
  const { state, setState } = useDocumentContext();
  const [newRecipient, setNewRecipient] = useState<Recipient>({
    name: '',
    email: '',
    web3Address: '',
  });
  const [numPages, setNumPages] = useState<number | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setState((prevState) => ({ ...prevState, file }));
      }
    },
    [setState]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
  });

  const handleNewRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRecipient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addRecipient = () => {
    if (newRecipient.name && newRecipient.email) {
      setState((prevState) => ({
        ...prevState,
        recipients: [...(prevState.recipients || []), newRecipient],
      }));
      setNewRecipient({ name: '', email: '', web3Address: '' });
    }
  };

  const removeRecipient = (index: number) => {
    setState((prevState) => ({
      ...prevState,
      recipients: prevState.recipients?.filter((_, i) => i !== index),
    }));
  };

  const handleRequireWorldIDChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setState((prevState) => ({
      ...prevState,
      requireWorldID: e.target.checked,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(state);
    onNext();
  };

  const renderPreview = () => {
    if (!state.file) return null;

    if (state.file.type.startsWith('image/')) {
      return (
        <img
          src={URL.createObjectURL(state.file)}
          alt='Preview'
          className='w-full h-full object-cover'
        />
      );
    } else if (state.file.type === 'application/pdf') {
      return (
        <Document
          file={state.file}
          onLoadSuccess={({ numPages }: any) => setNumPages(numPages)}
          className='w-full h-full'
        >
          <Page
            pageNumber={1}
            className='w-full h-full'
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      );
    }

    return null;
  };

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Create a new document</h1>
      <form onSubmit={handleSubmit}>
        <div className='mb-6'>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer h-64 relative overflow-hidden ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <input {...getInputProps()} />
            {state.file ? (
              <div className='absolute inset-0'>
                {renderPreview()}
                <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300'>
                  <p className='text-white'>Click or drag to change file</p>
                </div>
              </div>
            ) : (
              <div className='flex items-center justify-center h-full'>
                <p>Drag and drop your file here or click to browse</p>
              </div>
            )}
          </div>
          <p className='mt-2 text-sm text-gray-500'>
            Supported formats: PDF, PNG, JPG, JPEG
          </p>
          {state.file && (
            <p className='mt-2'>File selected: {state.file.name}</p>
          )}
        </div>

        <div className='mb-4'>
          <h2 className='text-lg font-semibold mb-2'>Invite people to sign</h2>
          {state.recipients?.map((recipient, index) => (
            <div key={index} className='flex items-center mb-2'>
              <span className='mr-2'>
                {recipient.name} ({recipient.email})
                {recipient.web3Address && ` - ${recipient.web3Address}`}
              </span>
              <button
                type='button'
                onClick={() => removeRecipient(index)}
                className='text-red-500 hover:text-red-700'
              >
                Remove
              </button>
            </div>
          ))}
          <div className='grid grid-cols-2 gap-4 mt-4'>
            <input
              type='text'
              name='name'
              placeholder='Name'
              value={newRecipient.name}
              onChange={handleNewRecipientChange}
              className='border rounded-md p-2'
            />
            <input
              type='email'
              name='email'
              placeholder='Email'
              value={newRecipient.email}
              onChange={handleNewRecipientChange}
              className='border rounded-md p-2'
            />
          </div>
          <div className='mt-2'>
            <input
              type='text'
              name='web3Address'
              placeholder='Web3 Address (optional)'
              value={newRecipient.web3Address}
              onChange={handleNewRecipientChange}
              className='border rounded-md p-2 w-full'
            />
          </div>
          <button
            type='button'
            onClick={addRecipient}
            className='mt-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600'
          >
            Add Recipient
          </button>
        </div>

        <div className='mb-4'>
          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={state.requireWorldID}
              onChange={handleRequireWorldIDChange}
              className='mr-2'
            />
            Require World ID verification
          </label>
          <p className='text-sm text-gray-600 mt-1'>
            Enabling World ID verification will require signers to verify their
            identity.
          </p>
        </div>

        <p className='text-sm text-gray-600 mb-4'>
          All added recipients will be required to sign the document.
        </p>

        <button
          type='submit'
          className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
        >
          Next
        </button>
      </form>
    </div>
  );
};

export default CreateDocument;
