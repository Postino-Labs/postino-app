import React, { useState } from 'react';
import { FiCheckCircle, FiAlertTriangle, FiLock } from 'react-icons/fi';
import { VerificationLevel, IDKitWidget } from '@worldcoin/idkit';
import type { ISuccessResult } from '@worldcoin/idkit';
import axios from 'axios';
import { ethers } from 'ethers';

import { useDocumentContext } from '@/contexts/DocumentContext';

interface CreateAttestationProps {
  onNext: () => void;
  onPrev: () => void;
}

const CreateAttestation: React.FC<CreateAttestationProps> = ({
  onNext,
  onPrev,
}) => {
  const { state, setState } = useDocumentContext();
  const [isCreatingAttestation, setIsCreatingAttestation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const app_id = process.env.NEXT_PUBLIC_WLD_APP_ID as `app_${string}`;
  const action = process.env.NEXT_PUBLIC_WLD_ACTION;

  if (!app_id) {
    throw new Error('app_id is not set in environment variables!');
  }
  if (!action) {
    throw new Error('action is not set in environment variables!');
  }

  const onSuccess = (result: ISuccessResult) => {
    console.log('WorldID verification successful:', result);
    setState((prevState) => ({
      ...prevState,
      creatorSignature: JSON.stringify(result),
      // creatorSignature: result.nullifier_hash,
    }));
  };

  const handleProof = async (result: ISuccessResult) => {
    try {
      console.log(
        'Proof received from IDKit, sending to backend:',
        JSON.stringify(result)
      );
      const response = await axios.post('/api/verify-worldid', {
        proof: {
          merkle_root: result.merkle_root,
          nullifier_hash: result.nullifier_hash,
          proof: result.proof,
          verification_level: result.verification_level,
        },
      });

      if (response.data.success) {
        console.log(
          'Successful response from backend:',
          JSON.stringify(response.data)
        );
        onSuccess(result);
      } else {
        throw new Error(`Verification failed: ${response.data.detail}`);
      }
    } catch (error) {
      console.error('Error during World ID verification:', error);
      setError('World ID verification failed. Please try again.');
    }
  };

  const handleCreateAttestation = async () => {
    setIsCreatingAttestation(true);
    setError(null);
    try {
      if (!state.ipfsHash || !state.creatorSignature) {
        throw new Error('Missing required data for attestation');
      }

      // Convert IPFS hash to bytes32
      const documentHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(state.ipfsHash)
      );

      const worldcoinProof = state.creatorSignature;

      // Here you would typically make an API call to create the attestation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real scenario, you'd get this ID from your API response after creating the attestation
      const attestationId =
        'attest-0x' + Math.random().toString(16).slice(2, 14);

      const attestationResult = {
        id: attestationId,
        documentHash,
        worldcoinProof,
      };

      setState((prevState) => ({
        ...prevState,
        attestation: attestationResult,
      }));
    } catch (error) {
      console.error('Error creating attestation:', error);
      setError('Failed to create attestation. Please try again.');
    } finally {
      setIsCreatingAttestation(false);
    }
  };

  const handleNext = () => {
    if (state.attestation) {
      onNext();
    } else {
      setError('Please create the attestation first.');
    }
  };

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <h2 className='text-2xl font-bold mb-6'>Create Attestation</h2>

      <div className='bg-white shadow-md rounded-lg p-6 mb-6'>
        {state.requireWorldID && !state.creatorSignature && (
          <div className='mb-6'>
            <h3 className='text-lg font-semibold mb-2 flex items-center'>
              <FiAlertTriangle className='mr-2 text-yellow-500' /> World ID
              Verification Required
            </h3>
            <p className='text-sm text-gray-600 mb-4'>
              You must complete World ID verification before creating the
              attestation.
            </p>
            <IDKitWidget
              action={action}
              app_id={app_id}
              onSuccess={onSuccess}
              handleVerify={handleProof}
              verification_level={VerificationLevel.Device}
            >
              {({ open }) => (
                <button
                  onClick={open}
                  className='bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors duration-300'
                >
                  Complete World ID Verification
                </button>
              )}
            </IDKitWidget>
          </div>
        )}

        {state.creatorSignature && (
          <div className='mb-6'>
            <h3 className='text-lg font-semibold mb-2 flex items-center'>
              <FiCheckCircle className='mr-2 text-green-500' /> World ID
              Verification Complete
            </h3>
            <p className='text-sm text-gray-600'>
              Your identity has been verified. You can now create the
              attestation.
            </p>
          </div>
        )}

        <div className='mb-6'>
          <h3 className='text-lg font-semibold mb-2'>Create Attestation</h3>
          <button
            onClick={handleCreateAttestation}
            disabled={
              isCreatingAttestation ||
              (state.requireWorldID && !state.creatorSignature)
            }
            className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors duration-300'
          >
            {isCreatingAttestation
              ? 'Creating Attestation...'
              : 'Create Attestation'}
          </button>
        </div>

        {state.attestation && (
          <div className='mt-4 p-4 bg-green-100 rounded-md'>
            <h3 className='text-lg font-semibold mb-2 flex items-center'>
              <FiCheckCircle className='mr-2 text-green-500' /> Attestation
              Created
            </h3>
            <p className='text-sm'>
              Attestation ID:{' '}
              <span className='font-mono'>{state.attestation.id}</span>
            </p>
          </div>
        )}

        {error && (
          <div className='mt-4 p-4 bg-red-100 text-red-700 rounded-md'>
            <p className='text-sm'>{error}</p>
          </div>
        )}
      </div>

      {(state.creatorSignature || state.attestation) && (
        <div className='bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <FiLock className='h-5 w-5 text-yellow-500' />
            </div>
            <div className='ml-3'>
              <p className='text-sm text-yellow-700'>
                The document is now locked and cannot be edited.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className='flex justify-between'>
        <button
          onClick={onPrev}
          className='bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-300'
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={!state.attestation}
          className='bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400 transition-colors duration-300'
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CreateAttestation;
