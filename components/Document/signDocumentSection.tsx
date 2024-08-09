import React, { useState } from 'react';
import { FiCheckCircle, FiAlertTriangle, FiX } from 'react-icons/fi';
import { VerificationLevel, IDKitWidget } from '@worldcoin/idkit';
import type { ISuccessResult } from '@worldcoin/idkit';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SignDocumentSectionProps {
  documentId: string;
  ipfsHash: string;
  onSigningComplete: () => void;
}

const SignDocumentSection: React.FC<SignDocumentSectionProps> = ({
  documentId,
  ipfsHash,
  onSigningComplete,
}) => {
  const { user, account, authType } = useAuth();
  const [isCreatingAttestation, setIsCreatingAttestation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  const app_id = process.env.NEXT_PUBLIC_WLD_APP_ID as `app_${string}`;
  const action = process.env.NEXT_PUBLIC_WLD_ACTION!;

  const onSuccess = (result: ISuccessResult) => {
    console.log('WorldID verification successful:', result);
    setSignature(JSON.stringify(result));
  };

  const handleProof = async (result: ISuccessResult) => {
    try {
      const response = await axios.post('/api/verify-worldid', {
        proof: {
          merkle_root: result.merkle_root,
          nullifier_hash: result.nullifier_hash,
          proof: result.proof,
          verification_level: result.verification_level,
        },
      });

      if (response.data.success) {
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
      if (!ipfsHash || !signature) {
        throw new Error('Missing required data for attestation');
      }

      const payload = {
        ipfsHash,
        worldcoinProof: JSON.parse(signature).proof,
        worldcoinId: authType === 'worldcoin' ? account : null,
        ethereumAddress: authType === 'alchemy' ? account : null,
      };

      const response = await axios.post('/api/submit-signature', payload);

      if (response.data.newAttestationUID) {
        console.log('Attestation created successfully:', response.data.message);
        onSigningComplete();
      } else {
        throw new Error(
          'Failed to create attestation: No attestation UID returned'
        );
      }
    } catch (error: any) {
      console.log('Error creating attestation:', error);
      setError(
        error?.response?.data?.error ||
          error.message ||
          'Failed to create attestation. Please try again.'
      );
    } finally {
      setIsCreatingAttestation(false);
    }
  };

  return (
    <Card className='mb-8'>
      <CardHeader>
        <CardTitle>Sign Document</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className='mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md'>
            <div className='flex items-center'>
              <FiAlertTriangle className='flex-shrink-0 h-5 w-5 text-red-500 mr-2' />
              <p className='font-bold'>Error</p>
            </div>
            <p className='mt-2'>{error}</p>
            <button
              onClick={() => {
                setError(null);
                setSignature(null);
              }}
              className='mt-2 text-red-500 hover:text-red-700'
            >
              <FiX className='inline-block mr-1' />
              Dismiss
            </button>
          </div>
        )}
        {!signature && (
          <div>
            <IDKitWidget
              action={action}
              app_id={app_id}
              onSuccess={onSuccess}
              handleVerify={handleProof}
              verification_level={VerificationLevel.Device}
            >
              {({ open }) => (
                <Button className='bg-yellow-500' onClick={open}>
                  Complete World ID Verification
                </Button>
              )}
            </IDKitWidget>
          </div>
        )}
        {signature && (
          <div>
            <p className='mb-4 text-green-600'>
              <FiCheckCircle className='inline mr-2' />
              Verification complete
            </p>
            <Button
              className='bg-yellow-400'
              onClick={handleCreateAttestation}
              disabled={isCreatingAttestation}
            >
              {isCreatingAttestation
                ? 'Creating Attestation...'
                : 'Create Attestation'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SignDocumentSection;
