import React from 'react';

const ReviewStep: React.FC<{ onNext: () => void; onPrev: () => void }> = ({
  onNext,
  onPrev,
}) => (
  <div className='text-center'>
    <h2 className='text-2xl font-bold mb-4'>Review Document</h2>
    <p className='mb-4'>This is a placeholder for the Review step.</p>
    <div className='flex justify-between'>
      <button
        onClick={onPrev}
        className='bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400'
      >
        Previous
      </button>
      <button
        onClick={onNext}
        className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
      >
        Next
      </button>
    </div>
  </div>
);

export default ReviewStep;
