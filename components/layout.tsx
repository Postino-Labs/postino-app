import { useState } from 'react';
import type { ReactNode } from 'react';
import Header from './header';
import Sidebar from './sidebar';

export default function Layout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='h-screen flex overflow-hidden bg-[#F9F6F0]'>
      {/* Sidebar for mobile */}
      <div className={`md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className='fixed inset-0 flex z-40'>
          <div className='fixed inset-0' onClick={() => setSidebarOpen(false)}>
            <div className='absolute inset-0 bg-gray-600 opacity-75'></div>
          </div>
          <div className='relative flex-1 flex flex-col max-w-xs w-full bg-white'>
            <Sidebar />
          </div>
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className='hidden md:flex md:flex-shrink-0'>
        <div className='flex flex-col w-64'>
          <Sidebar />
        </div>
      </div>

      <div className='flex flex-col w-0 flex-1 overflow-hidden'>
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className='flex-1 relative overflow-y-auto focus:outline-none'>
          <div className='py-6'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8'>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
