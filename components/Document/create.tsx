import React, { useCallback, useState, useEffect } from 'react';
import { useDocumentContext } from '@/contexts/DocumentContext';
import { useDropzone } from 'react-dropzone';
import { Document, Page, pdfjs } from 'react-pdf';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FiPlus, FiTrash2, FiUpload } from 'react-icons/fi';
import { Alert, AlertDescription } from '@/components/ui/alert';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Recipient {
  web3Address: string;
}

const CreateDocument: React.FC<{
  onNext: () => void;
  onPrev?: () => void;
}> = ({ onNext }) => {
  const { state, setState } = useDocumentContext();
  const [newRecipient, setNewRecipient] = useState<Recipient>({
    web3Address: '',
  });
  const [numPages, setNumPages] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (state.recipients.length > state.requiredSignatures) {
      setState((prevState) => ({
        ...prevState,
        requiredSignatures: state.recipients.length,
      }));
    }
  }, [state.recipients, state.requiredSignatures, setState]);

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
    setNewRecipient({ web3Address: e.target.value });
  };

  const addRecipient = () => {
    if (newRecipient.web3Address) {
      setState((prevState) => ({
        ...prevState,
        recipients: [...prevState.recipients, newRecipient],
      }));
      setNewRecipient({ web3Address: '' });
    }
  };

  const removeRecipient = (index: number) => {
    setState((prevState) => ({
      ...prevState,
      recipients: prevState.recipients.filter((_, i) => i !== index),
    }));
  };

  const handleRequiredSignaturesChange = (signatures: number) => {
    setState((prevState) => ({
      ...prevState,
      requiredSignatures: signatures,
    }));
  };

  const handleRequireWorldIDChange = (checked: boolean) => {
    setState((prevState) => ({
      ...prevState,
      requireWorldID: checked,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!state.file) {
      newErrors.push('Please upload a document.');
    }

    if (state.requiredSignatures <= 0) {
      newErrors.push('Required signatures must be greater than 0.');
    }

    if (
      state.recipients.length > 0 &&
      state.requiredSignatures > state.recipients.length
    ) {
      newErrors.push(
        'Required signatures cannot exceed the number of recipients.'
      );
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log(state);
      onNext();
    }
  };

  const renderPreview = () => {
    if (!state.file) return null;

    if (state.file.type.startsWith('image/')) {
      return (
        <img
          src={URL.createObjectURL(state.file)}
          alt='Preview'
          className='w-full h-full object-cover rounded-lg'
        />
      );
    } else if (state.file.type === 'application/pdf') {
      return (
        <Document
          file={state.file}
          onLoadSuccess={({ numPages }: { numPages: number }) =>
            setNumPages(numPages)
          }
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
    <Card className='max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden'>
      <CardHeader className='border-b border-yellow-500'>
        <CardTitle className='text-2xl font-bold text-gray-500'>
          Create a New Document
        </CardTitle>
      </CardHeader>
      <CardContent className='p-6'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {errors.length > 0 && (
            <Alert variant='destructive'>
              <AlertDescription>
                <ul className='list-disc pl-5'>
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          <div>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer h-80 relative overflow-hidden transition-colors duration-300 ${
                isDragActive
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-gray-300 hover:border-yellow-400 hover:bg-yellow-50'
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
                  <FiUpload className='text-5xl text-yellow-400 mb-4' />
                  <p className='text-lg text-gray-600'>
                    Drag and drop your file here or click to browse
                  </p>
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
          <div className='bg-gray-50 p-4 rounded-lg'>
            <h2 className='text-lg font-semibold mb-2 text-gray-700'>
              Required Signatures:
            </h2>
            <Input
              type='number'
              id='requiredSignatures'
              name='requiredSignatures'
              value={state.requiredSignatures}
              onChange={(e) =>
                handleRequiredSignaturesChange(parseInt(e.target.value))
              }
              min='1'
              className='mt-1 border-yellow-300 focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50'
            />
            {state.recipients.length > 0 &&
              state.requiredSignatures > state.recipients.length && (
                <p className='text-sm text-yellow-600 mt-1'>
                  Note: Required signatures exceed the number of recipients.
                </p>
              )}
          </div>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <h2 className='text-lg font-semibold mb-2 text-gray-700'>
              Invite People to Sign
            </h2>
            {state.recipients.map((recipient, index) => (
              <div
                key={index}
                className='flex items-center justify-between bg-white p-3 rounded-md mb-2 shadow-sm'
              >
                <span className='text-gray-700 font-medium'>
                  {recipient.web3Address}
                </span>
                <Button
                  type='button'
                  variant='ghost'
                  onClick={() => removeRecipient(index)}
                  className='text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-2'
                >
                  <FiTrash2 />
                </Button>
              </div>
            ))}
            <div className='flex mt-4'>
              <Input
                type='text'
                name='web3Address'
                placeholder='Web3 Address'
                value={newRecipient.web3Address}
                onChange={handleNewRecipientChange}
                className='flex-grow mr-2 border-yellow-300 focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:ring-opacity-50'
              />
              <Button
                type='button'
                onClick={addRecipient}
                className='bg-yellow-400 text-white hover:bg-yellow-500 transition-colors duration-300'
              >
                <FiPlus className='mr-2' /> Add
              </Button>
            </div>
          </div>
          {/* <div className='flex items-center space-x-2 bg-gray-50 p-4 rounded-lg'>
            <Checkbox
              id='worldID'
              checked={state.requireWorldID}
              onCheckedChange={handleRequireWorldIDChange}
              className='text-yellow-500 focus:ring-yellow-500'
            />
            <Label htmlFor='worldID' className='text-gray-700'>
              Require World ID verification
            </Label>
          </div>
          <p className='text-sm text-gray-600 italic'>
            Enabling World ID verification will require signers to verify their
            identity.
          </p> */}
          <Button
            type='submit'
            className='w-full bg-yellow-400 text-white hover:bg-yellow-500 transition-colors duration-300 py-2 text-lg font-semibold'
          >
            Next
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateDocument;
