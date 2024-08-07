import React from 'react';
import { useDocumentContext } from '@/contexts/DocumentContext';
import CreateDocument from '@/components/Document/create';
import UploadToIPFS from '@/components/Document/uploadToIPFS';
import CreateAttestation from '@/components/Document/createAttestation';
import ReviewStep from '@/components/Document/review';
import Layout from '@/components/layout';
import { FiLock, FiTrash2 } from 'react-icons/fi';
import SuccessView from '@/components/Document/success';

const steps = [
  { id: 1, name: 'Create Document' },
  { id: 2, name: 'Upload to IPFS' },
  { id: 3, name: 'Review' },
  { id: 4, name: 'Create Attestation' },
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
    if (stepId === 4) return !!state.ipfsHash;
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
      <div className='max-w-4xl mx-auto p-6'>
        {!state.attestation && (
          <nav aria-label='Progress'>
            <ol className='flex items-center justify-between mb-8'>
              {steps.map((step) => (
                <li
                  key={step.id}
                  className={`relative ${
                    state.currentStep >= step.id && isStepAccessible(step.id)
                      ? 'text-blue-600'
                      : 'text-gray-500'
                  }`}
                >
                  <button
                    onClick={() => jumpToStep(step.id)}
                    disabled={
                      (isDocumentLocked && step.id < state.currentStep) ||
                      !isStepAccessible(step.id)
                    }
                    className={`group flex items-center ${
                      (isDocumentLocked && step.id < state.currentStep) ||
                      !isStepAccessible(step.id)
                        ? 'cursor-not-allowed opacity-50'
                        : ''
                    }`}
                  >
                    <span
                      className={`h-8 w-8 flex items-center justify-center rounded-full border-2 ${
                        state.currentStep >= step.id &&
                        isStepAccessible(step.id)
                          ? 'border-blue-600'
                          : 'border-gray-300'
                      } group-hover:border-blue-400 transition-colors duration-150`}
                    >
                      {step.id}
                    </span>
                    <span className='ml-2 text-sm font-medium group-hover:text-blue-500 transition-colors duration-150'>
                      {step.name}
                    </span>
                    {(isDocumentLocked && step.id < state.currentStep) ||
                    !isStepAccessible(step.id) ? (
                      <FiLock className='ml-2 text-gray-400' />
                    ) : null}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        )}
        {isDocumentLocked &&
          state.currentStep < steps.length &&
          !state.attestation && (
            <div className='bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6'>
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
            </div>
          )}
        {renderStep()}
        <div className='mt-6 flex justify-end'>
          <button
            onClick={clearState}
            className='flex items-center bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-300'
          >
            <FiTrash2 className='mr-2' />
            Clear State (Debug)
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default DocumentStepper;
