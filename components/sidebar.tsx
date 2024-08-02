import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className='w-64 h-full bg-gray-100 flex flex-col'>
      <nav className='flex-grow px-4 py-6'>
        <ul className='space-y-1'>
          <li className='bg-white rounded-md shadow'>
            <Link
              href='/dashboard'
              className='block px-4 py-2 text-blue-600 font-medium'
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link href='/documents' className='block px-4 py-2 text-gray-600'>
              Documents
            </Link>
          </li>
          <li>
            <Link href='/templates' className='block px-4 py-2 text-gray-600'>
              Templates
            </Link>
          </li>
          <li>
            <Link href='/teams' className='block px-4 py-2 text-gray-600'>
              Team
            </Link>
          </li>
        </ul>
      </nav>
      <div className='px-4 py-3 mt-auto'>
        <button className='w-full bg-blue-500 text-white py-2 px-4 rounded-md'>
          New document
        </button>
      </div>
      <div className='px-4 py-3'>
        <h3 className='font-medium text-gray-700 mb-3'>Join signing</h3>
        <div className='bg-white p-3 rounded-md mb-2 text-sm'>
          <div className='flex items-center justify-between mb-1'>
            <span className='font-medium'>Sign and send</span>
            <span className='bg-gray-200 px-2 py-1 rounded-full text-xs'>
              1/1
            </span>
          </div>
          <span className='text-gray-500 text-xs'>Signers: 2/3</span>
        </div>
        <div className='bg-white p-3 rounded-md text-sm'>
          <div className='flex items-center justify-between mb-1'>
            <span className='font-medium'>Sign and send</span>
            <span className='bg-gray-200 px-2 py-1 rounded-full text-xs'>
              0/1
            </span>
          </div>
          <span className='text-gray-500 text-xs'>Signers: 0/3</span>
        </div>
      </div>
    </aside>
  );
}
