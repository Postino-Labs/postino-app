import React from 'react';
import { useDocumentContext } from '@/contexts/DocumentContext';
import CreateDocument from '@/components/Document/create';
import UploadToIPFS from '@/components/Document/uploadToIPFS';
import CreateAttestation from '@/components/Document/createAttestation';
import ReviewStep from '@/components/Document/review';
import Layout from '@/components/layout';
import { FiLock, FiTrash2, FiCheck } from 'react-icons/fi';
import SuccessView from '@/components/Document/success';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const steps = [
  { id: 1, name: 'Create Document', icon: 'FiFileText' },
  { id: 2, name: 'Upload to IPFS', icon: 'FiUploadCloud' },
  { id: 3, name: 'Review', icon: 'FiEye' },
  { id: 4, name: 'Create Attestation', icon: 'FiCheckCircle' },
];

const DocumentStepper: React.FC = () => {
  const { state, setState } = useDocumentContext();

  const isDocumentLocked = state.creatorSignature || state.attestation;

  const nextStep = () => {
    if (state.currentStep < steps.length) {
      setState((prevState) => ({
        ...prevState,
        currentStep: prevState.currentStep + 1,
      }));
    }
  };

  const prevStep = () => {
    if (state.currentStep > 1 && !isDocumentLocked) {
      setState((prevState) => ({
        ...prevState,
        currentStep: prevState.currentStep - 1,
      }));
    }
  };

  const isStepAccessible = (stepId: number) => {
    if (stepId === 1) return true;
    if (stepId === 2) return !!state.file;
    if (stepId === 3) return !!state.ipfsHash;
    if (stepId === 4) return !!state.isConfirmed;
    return false;
  };

  const jumpToStep = (stepId: number) => {
    if (
      stepId >= 1 &&
      stepId <= steps.length &&
      (!isDocumentLocked || stepId >= state.currentStep) &&
      isStepAccessible(stepId)
    ) {
      setState((prevState) => ({ ...prevState, currentStep: stepId }));
    }
  };

  const clearState = () => {
    setState({
      file: null,
      recipients: [],
      requireWorldID: true,
      ipfsHash: '',
      attestation: null,
      creatorSignature: null,
      currentStep: 1,
    });
  };

  const renderStep = () => {
    if (state.attestation) {
      return <SuccessView />;
    }
    switch (state.currentStep) {
      case 1:
        return <CreateDocument onNext={nextStep} />;
      case 2:
        return <UploadToIPFS onNext={nextStep} onPrev={prevStep} />;
      case 3:
        return <ReviewStep onNext={nextStep} onPrev={prevStep} />;
      case 4:
        return <CreateAttestation onNext={nextStep} onPrev={prevStep} />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <motion.div
        className='max-w-4xl mx-auto p-6'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {!state.attestation && (
          <Card className='mb-8'>
            <CardContent className='pt-6'>
              <nav aria-label='Progress'>
                <ol className='flex items-center justify-between'>
                  {steps.map((step) => (
                    <li key={step.id} className='relative'>
                      <Button
                        variant={
                          state.currentStep >= step.id &&
                          isStepAccessible(step.id)
                            ? 'default'
                            : 'outline'
                        }
                        size='sm'
                        onClick={() => jumpToStep(step.id)}
                        disabled={
                          (isDocumentLocked && step.id < state.currentStep) ||
                          !isStepAccessible(step.id)
                        }
                        className={`w-full ${
                          (isDocumentLocked && step.id < state.currentStep) ||
                          !isStepAccessible(step.id)
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                      >
                        <span className='flex items-center justify-center w-8 h-8 mr-2'>
                          {state.currentStep > step.id ? (
                            <FiCheck className='text-yellow-600' />
                          ) : (
                            <span className='text-yellow-600'>{step.id}</span>
                          )}
                        </span>
                        <span className='text-sm'>{step.name}</span>
                        {(isDocumentLocked && step.id < state.currentStep) ||
                        !isStepAccessible(step.id) ? (
                          <FiLock className='ml-2 text-gray-400' />
                        ) : null}
                      </Button>
                    </li>
                  ))}
                </ol>
              </nav>
            </CardContent>
          </Card>
        )}
        {isDocumentLocked &&
          state.currentStep < steps.length &&
          !state.attestation && (
            <motion.div
              className='bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <FiLock className='h-5 w-5 text-yellow-500' />
                </div>
                <div className='ml-3'>
                  <p className='text-sm text-yellow-700'>
                    The document is locked. You cannot go back to previous
                    steps.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        <motion.div
          key={state.currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
        <motion.div
          className='mt-6 flex justify-end'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Button
            variant='destructive'
            onClick={clearState}
            className='flex items-center'
          >
            <FiTrash2 className='mr-2' />
            Clear State (Debug)
          </Button>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default DocumentStepper;
