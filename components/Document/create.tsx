import React, { useCallback, useState } from 'react';
import { useDocumentContext } from '@/contexts/DocumentContext';
import { useDropzone } from 'react-dropzone';

interface Recipient {
  name: string;
  email: string;
}

const CreateDocument: React.FC<{
  onNext: () => void;
  onPrev?: () => void;
}> = ({ onNext }) => {
  const { state, setState } = useDocumentContext();
  const [newRecipient, setNewRecipient] = useState<Recipient>({
    name: '',
    email: '',
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setState((prevState) => ({ ...prevState, file: acceptedFiles[0] }));
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
      setNewRecipient({ name: '', email: '' });
    }
  };

  const removeRecipient = (index: number) => {
    setState((prevState) => ({
      ...prevState,
      recipients: prevState.recipients?.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(state);
    onNext();
  };

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Create a new document</h1>
      <form onSubmit={handleSubmit}>
        <div className='mb-6'>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <input {...getInputProps()} />
            {state.file ? (
              <p>File selected: {state.file.name}</p>
            ) : (
              <p>Drag and drop your file here or click to browse</p>
            )}
          </div>
          <p className='mt-2 text-sm text-gray-500'>
            Supported formats: PDF, PNG, JPG, JPEG
          </p>
        </div>

        <div className='mb-4'>
          <h2 className='text-lg font-semibold mb-2'>Invite people to sign</h2>
          {state.recipients?.map((recipient, index) => (
            <div key={index} className='flex items-center mb-2'>
              <span className='mr-2'>
                {recipient.name} ({recipient.email})
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
          <button
            type='button'
            onClick={addRecipient}
            className='mt-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600'
          >
            Add Recipient
          </button>
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
