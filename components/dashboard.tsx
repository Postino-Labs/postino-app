export default function Dashboard() {
  return (
    <div className='max-w-6xl mx-auto space-y-8'>
      <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
      <section>
        <h2 className='text-xl font-semibold mb-4 text-gray-800'>
          Active documents
        </h2>
        <div className='grid gap-6 md:grid-cols-2'>
          <div className='bg-white p-6 rounded-lg shadow'>
            <h3 className='font-semibold text-lg mb-1'>
              Sales contract with Acme Corp
            </h3>
            <p className='text-sm text-gray-500 mb-4'>Completed 2 days ago</p>
            <button className='px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition duration-200'>
              View details
            </button>
          </div>
          <div className='bg-white p-6 rounded-lg shadow'>
            <h3 className='font-semibold text-lg mb-1'>
              Sales contract with Acme Corp
            </h3>
            <p className='text-sm text-gray-500 mb-4'>
              Waiting for you to sign
            </p>
            <button className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200'>
              Sign now
            </button>
          </div>
        </div>
      </section>
      <section>
        <h2 className='text-xl font-semibold mb-4 text-gray-800'>
          Pending signatures
        </h2>
        <div className='space-y-4'>
          {[1, 2].map((i) => (
            <div
              key={i}
              className='bg-white p-4 rounded-lg shadow flex justify-between items-center'
            >
              <div className='flex items-center space-x-4'>
                <div className='bg-gray-100 p-3 rounded-md'>
                  <svg
                    className='w-6 h-6 text-gray-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                </div>
                <div>
                  <h3 className='font-medium'>Sales contract with Acme Corp</h3>
                  <p className='text-sm text-gray-500'>
                    Sent by John Doe, 2 days ago
                  </p>
                </div>
              </div>
              <button className='px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition duration-200'>
                Review and sign
              </button>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className='text-xl font-semibold mb-4 text-gray-800'>
          Recent activity
        </h2>
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          {[
            {
              action: 'You signed a document',
              document: 'Sales contract with Acme Corp',
              icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
            },
            {
              action: 'You received a document',
              sender: 'Sent by John Doe',
              icon: 'M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20',
            },
            {
              action: 'You received a document',
              sender: 'Sent by John Doe',
              icon: 'M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20',
            },
          ].map((item, i) => (
            <div
              key={i}
              className='flex items-center space-x-4 p-4 border-b last:border-b-0'
            >
              <div className='bg-gray-100 p-2 rounded-full'>
                <svg
                  className='w-6 h-6 text-gray-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
              </div>
              <div className='flex-grow'>
                <p className='font-medium text-gray-700'>{item.action}</p>
                <p className='text-sm text-gray-500'>
                  {item.document || item.sender}
                </p>
              </div>
              <span className='text-sm text-gray-500'>2 days ago</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
