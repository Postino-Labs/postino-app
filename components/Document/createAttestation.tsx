import React, { useState } from 'react';
import { FiCheckCircle, FiAlertTriangle, FiLock, FiX } from 'react-icons/fi';
import { VerificationLevel, IDKitWidget } from '@worldcoin/idkit';
import type { ISuccessResult } from '@worldcoin/idkit';
import axios from 'axios';
import { ethers } from 'ethers';

import { useDocumentContext } from '@/contexts/DocumentContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useSigner, useSignerStatus } from '@account-kit/react';
import Link from 'next/link';

interface CreateAttestationProps {
  onNext: () => void;
  onPrev: () => void;
}

const CreateAttestation: React.FC<CreateAttestationProps> = ({
  onNext,
  onPrev,
}) => {
  const signer = useSigner();
  const { status: signerStatus } = useSignerStatus();

  const { user, authType } = useAuth();
  const { state, setState } = useDocumentContext();
  const [isCreatingAttestation, setIsCreatingAttestation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSigningEth, setIsSigningEth] = useState(false);

  const creatorId = authType === 'worldcoin' ? user.name : user.address;

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

  const handleEthereumSignature = async () => {
    setIsSigningEth(true);
    setError(null);
    try {
      if (!signer) {
        throw new Error('No signer available');
      }
      if (signerStatus !== 'CONNECTED') {
        throw new Error('Signer not connected');
      }
      const message = `Sign this message to confirm your identity for document: ${state.ipfsHash}`;
      const signature = await signer.signMessage(message);

      setState((prevState) => ({
        ...prevState,
        creatorSignature: signature,
      }));

      console.log('Ethereum signature successful:', signature);
    } catch (error) {
      console.error('Error during Ethereum signing:', error);
      setError('Ethereum signing failed. Please try again.');
    } finally {
      setIsSigningEth(false);
    }
  };

  const handleCreateAttestation = async () => {
    setIsCreatingAttestation(true);
    setError(null);
    try {
      if (!state.ipfsHash || !state.creatorSignature) {
        throw new Error('Missing required data for attestation');
      }

      let payload;
      if (state.requireWorldID) {
        const creatorSignatureObj = JSON.parse(state.creatorSignature);
        payload = {
          ipfsHash: state.ipfsHash,
          worldcoinProof: creatorSignatureObj.proof,
          worldcoinId: creatorId,
        };
      } else {
        payload = {
          ipfsHash: state.ipfsHash,
          ethereumSignature: state.creatorSignature,
          ethereumAddress: creatorId,
        };
      }

      const response = await axios.post('/api/submit-signature', payload);

      if (response.data.newAttestationUID) {
        const attestationResult = {
          id: response.data.newAttestationUID,
          documentHash: ethers.keccak256(ethers.toUtf8Bytes(state.ipfsHash)),
          proof: state.requireWorldID
            ? payload.worldcoinProof
            : payload.ethereumSignature,
          isComplete: response.data.isComplete,
          easExplorerUrl: response.data.easExplorerUrl,
        };

        setState((prevState) => ({
          ...prevState,
          attestation: attestationResult,
        }));

        console.log('Attestation created successfully:', response.data.message);
      } else {
        throw new Error(
          'Failed to create attestation: No attestation UID returned'
        );
      }
    } catch (error) {
      console.error('Error creating attestation:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to create attestation. Please try again.'
      );
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
    <Card className='max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden'>
      <CardHeader className='border-b border-yellow-500'>
        <CardTitle className='text-2xl font-bold text-yellow-900'>
          Create Attestation
        </CardTitle>
      </CardHeader>
      <CardContent className='p-6'>
        {error && (
          <div className='mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md'>
            <div className='flex items-center'>
              <FiAlertTriangle className='flex-shrink-0 h-5 w-5 text-red-500 mr-2' />
              <p className='font-bold'>Error</p>
            </div>
            <p className='mt-2'>{error}</p>
            <button
              onClick={() => setError(null)}
              className='mt-2 text-red-500 hover:text-red-700'
            >
              <FiX className='inline-block mr-1' />
              Dismiss
            </button>
          </div>
        )}

        <div className='bg-white shadow-md rounded-lg p-6 mb-6'>
          {state.requireWorldID ? (
            <>
              {!state.creatorSignature && (
                <div className='mb-6'>
                  <h3 className='text-lg font-semibold mb-2 flex items-center'>
                    <FiAlertTriangle className='mr-2 text-yellow-500' /> World
                    ID Verification Required
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
            </>
          ) : (
            <>
              {!state.creatorSignature && (
                <div className='mb-6'>
                  <h3 className='text-lg font-semibold mb-2 flex items-center'>
                    <FiAlertTriangle className='mr-2 text-yellow-500' />{' '}
                    Ethereum Signature Required
                  </h3>
                  <p className='text-sm text-gray-600 mb-4'>
                    Please sign with your Ethereum wallet to verify your
                    identity.
                  </p>
                  <button
                    onClick={handleEthereumSignature}
                    disabled={isSigningEth}
                    className='bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors duration-300 disabled:bg-gray-400'
                  >
                    {isSigningEth ? 'Signing...' : 'Sign with Ethereum'}
                  </button>
                </div>
              )}
            </>
          )}

          {state.creatorSignature && (
            <div className='mb-6'>
              <h3 className='text-lg font-semibold mb-2 flex items-center'>
                <FiCheckCircle className='mr-2 text-green-500' /> Verification
                Complete
              </h3>
              <p className='text-sm text-gray-600'>
                Your identity has been verified. You can now create the
                attestation.
              </p>
            </div>
          )}

          {!state.attestation && (
            <div className='mb-6'>
              <h3 className='text-lg font-semibold mb-2'>Create Attestation</h3>
              <button
                onClick={handleCreateAttestation}
                disabled={isCreatingAttestation || !state.creatorSignature}
                className='bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors duration-300 disabled:bg-gray-400'
              >
                {isCreatingAttestation
                  ? 'Creating Attestation...'
                  : 'Create Attestation'}
              </button>
            </div>
          )}

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
        </div>

        {(state.creatorSignature || state.attestation || state.isLocked) && (
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
          <Link
            href={{
              pathname: `/document/${state.ipfsHash}`,
            }}
            passHref
          >
            <button
              disabled={!state.attestation}
              className='bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400 transition-colors duration-300'
            >
              View Document
            </button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateAttestation;
