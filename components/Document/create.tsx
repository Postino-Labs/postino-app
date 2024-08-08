import React, { useCallback, useState } from 'react';
import { useDocumentContext } from '@/contexts/DocumentContext';
import { useDropzone } from 'react-dropzone';
import { Document, Page, pdfjs } from 'react-pdf';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FiPlus, FiTrash2, FiUpload } from 'react-icons/fi';

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

  const handleRequireWorldIDChange = (checked: boolean) => {
    setState((prevState) => ({
      ...prevState,
      requireWorldID: checked,
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
          className='w-full'
        >
          <Page
            pageNumber={1}
            width={window.innerWidth * 0.38}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      );
    }

    return null;
  };

  return (
    <Card className='max-w-4xl mx-auto'>
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>
          Create a new document
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer h-80 relative overflow-hidden ${
                isDragActive
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-gray-300'
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
                <div className='flex flex-col items-center justify-center h-full'>
                  <FiUpload className='text-4xl text-gray-400 mb-2' />
                  <p>Drag and drop your file here or click to browse</p>
                </div>
              )}
            </div>
            <p className='mt-2 text-sm text-gray-500'>
              Supported formats: PDF, PNG, JPG, JPEG
            </p>
            {state.file && (
              <p className='mt-2 text-sm font-medium text-yellow-600'>
                File selected: {state.file.name}
              </p>
            )}
          </div>

          <div>
            <h2 className='text-lg font-semibold mb-2'>
              Invite people to sign
            </h2>
            {state.recipients?.map((recipient, index) => (
              <div
                key={index}
                className='flex items-center justify-between bg-gray-50 p-2 rounded mb-2'
              >
                <span>
                  {recipient.name} ({recipient.email})
                  {recipient.web3Address && ` - ${recipient.web3Address}`}
                </span>
                <Button
                  type='button'
                  variant='ghost'
                  onClick={() => removeRecipient(index)}
                  className='text-red-500 hover:text-red-700'
                >
                  <FiTrash2 />
                </Button>
              </div>
            ))}
            <div className='grid grid-cols-2 gap-4 mt-4'>
              <Input
                type='text'
                name='name'
                placeholder='Name'
                value={newRecipient.name}
                onChange={handleNewRecipientChange}
              />
              <Input
                type='email'
                name='email'
                placeholder='Email'
                value={newRecipient.email}
                onChange={handleNewRecipientChange}
              />
            </div>
            <Input
              type='text'
              name='web3Address'
              placeholder='Web3 Address (optional)'
              value={newRecipient.web3Address}
              onChange={handleNewRecipientChange}
              className='mt-2'
            />
            <Button
              type='button'
              onClick={addRecipient}
              className='mt-2 bg-yellow-400 text-white hover:bg-yellow-500'
            >
              <FiPlus className='mr-2' /> Add Recipient
            </Button>
          </div>

          <div className='flex items-center space-x-2'>
            <Checkbox
              id='worldID'
              checked={state.requireWorldID}
              onCheckedChange={handleRequireWorldIDChange}
            />
            <Label htmlFor='worldID'>Require World ID verification</Label>
          </div>
          <p className='text-sm text-gray-600'>
            Enabling World ID verification will require signers to verify their
            identity.
          </p>

          <p className='text-sm text-gray-600'>
            All added recipients will be required to sign the document.
          </p>

          <Button
            type='submit'
            className='bg-yellow-400 text-white hover:bg-yellow-500'
          >
            Next
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateDocument;
