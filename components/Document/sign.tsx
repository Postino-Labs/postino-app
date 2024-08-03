import React from 'react';

const SignStep: React.FC<{ onPrev: () => void }> = ({ onPrev }) => (
  <div className='text-center'>
    <h2 className='text-2xl font-bold mb-4'>Sign Document</h2>
    <p className='mb-4'>This is a placeholder for the Sign step.</p>
    <div className='flex justify-between'>
      <button
        onClick={onPrev}
        className='bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400'
      >
        Previous
      </button>
      <button className='bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600'>
        Complete
      </button>
    </div>
  </div>
);

export default SignStep;
