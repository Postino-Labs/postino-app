import React from 'react';
import { useDocumentContext } from '@/contexts/DocumentContext';

interface ConfigureVerificationProps {
  onNext: () => void;
  onPrev: () => void;
}

const ConfigureVerification: React.FC<ConfigureVerificationProps> = ({
  onNext,
  onPrev,
}) => {
  const { state, setState } = useDocumentContext();

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
    onNext();
  };

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <h2 className='text-2xl font-bold mb-6'>Configure Verification</h2>
      <form onSubmit={handleSubmit}>
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
        </div>
        <p className='text-sm text-gray-600 mb-4'>
          Enabling World ID verification will require signers to verify their
          identity.
        </p>
        <div className='flex justify-between'>
          <button
            type='button'
            onClick={onPrev}
            className='bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400'
          >
            Previous
          </button>
          <button
            type='submit'
            className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfigureVerification;
