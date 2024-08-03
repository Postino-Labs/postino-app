import React, { useState } from 'react';
import SignStep from '@/components/Document/sign';
import ReviewStep from '@/components/Document/review';
import CreateDocument from '@/components/Document/create';
import Layout from '@/components/layout';

const steps = [
  { id: 1, name: 'Create Document' },
  { id: 2, name: 'Review' },
  { id: 3, name: 'Sign' },
];

const DocumentStepper: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const jumpToStep = (stepId: number) => {
    if (stepId >= 1 && stepId <= steps.length) {
      setCurrentStep(stepId);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CreateDocument onNext={nextStep} />;
      case 2:
        return <ReviewStep onNext={nextStep} onPrev={prevStep} />;
      case 3:
        return <SignStep onPrev={prevStep} />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className='max-w-4xl mx-auto p-6'>
        <nav aria-label='Progress'>
          <ol className='flex items-center justify-between mb-8'>
            {steps.map((step) => (
              <li
                key={step.id}
                className={`relative ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <button
                  onClick={() => jumpToStep(step.id)}
                  className='group flex items-center'
                >
                  <span
                    className={`h-8 w-8 flex items-center justify-center rounded-full border-2 ${
                      currentStep >= step.id
                        ? 'border-blue-600'
                        : 'border-gray-300'
                    } group-hover:border-blue-400 transition-colors duration-150`}
                  >
                    {step.id}
                  </span>
                  <span className='ml-2 text-sm font-medium group-hover:text-blue-500 transition-colors duration-150'>
                    {step.name}
                  </span>
                </button>
                {step.id < steps.length - 1 && (
                  <div className='absolute top-4 left-0 w-full'>
                    <div
                      className={` w-full ${
                        currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    ></div>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </nav>
        {renderStep()}
      </div>
    </Layout>
  );
};

export default DocumentStepper;
