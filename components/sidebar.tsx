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
            <div className='block px-4 py-2 text-gray-600'>Templates</div>
          </li>
          <li>
            <div className='block px-4 py-2 text-gray-600'>Team</div>
          </li>
        </ul>
      </nav>
      <div className='px-4 py-3 mt-auto'>
        <Link
          href='/new'
          className='w-full bg-blue-500 text-white py-2 px-4 rounded-md'
        >
          New document
        </Link>
      </div>
    </aside>
  );
}
