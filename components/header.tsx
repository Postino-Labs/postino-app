import { useAuth } from '@/hooks/useAuth';
import { truncate } from '@/utils/truncate';
import { useAuthModal, useLogout } from '@account-kit/react';
import { signIn, signOut } from 'next-auth/react';

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, isAuthenticated, authType } = useAuth();
  const { logout } = useLogout();
  const { openAuthModal } = useAuthModal();

  const handleSignOut = async () => {
    if (authType === 'worldcoin') {
      await signOut();
    } else if (authType === 'alchemy') {
      await logout();
    }
  };
  return (
    <header className='bg-transparent border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          <div className='flex'>
            <button
              className='md:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500'
              onClick={onMenuClick}
            >
              <span className='sr-only'>Open sidebar</span>
              {/* Heroicon name: menu */}
              <svg
                className='h-6 w-6'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M4 6h16M4 12h16M4 18h16'
                />
              </svg>
            </button>
          </div>
          {!isAuthenticated && (
            <div className='flex flex-row gap-2 items-center'>
              <a
                className='btn btn-primary'
                href={`/api/auth/signin`}
                onClick={(e: any) => {
                  e.preventDefault();
                  signIn('worldcoin');
                }}
              >
                Login w Worldcoin
              </a>
              <button className='btn btn-secondary' onClick={openAuthModal}>
                Login w Alchemy
              </button>
            </div>
          )}
          {isAuthenticated && (
            <div className='flex items-center'>
              <span className='text-sm text-gray-600 mr-2 hidden sm:inline'>
                Signed in with {authType} as
              </span>
              <span className='text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full truncate max-w-[200px]'>
                {authType === 'worldcoin'
                  ? user?.email ?? truncate(user.name)
                  : truncate(user.address)}
              </span>
              <button
                className='ml-4 text-sm text-gray-600 hover:text-gray-900'
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
