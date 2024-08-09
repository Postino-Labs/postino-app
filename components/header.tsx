import { useAuth } from '@/hooks/useAuth';
import { truncate } from '@/utils/truncate';
import { useAuthModal, useLogout } from '@account-kit/react';
import { signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Globe, LogOut, Menu } from 'lucide-react';
import Image from 'next/image';

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, isAuthenticated, authType } = useAuth();
  const { logout } = useLogout();
  const { openAuthModal } = useAuthModal();

  const handleSignOut = async () => {
    try {
      await signOut();
      await logout();
    } catch (error) {}
  };

  return (
    <header className='bg-white border-b border-gray-200 shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          <div className='flex items-center'>
            <Button
              variant='ghost'
              size='icon'
              className='md:hidden mr-2'
              onClick={onMenuClick}
            >
              <Menu className='h-6 w-6' />
            </Button>
          </div>

          {!isAuthenticated ? (
            <div className='flex space-x-2'>
              <Button
                variant='outline'
                className='flex items-center'
                onClick={(e: any) => {
                  e.preventDefault();
                  signIn('worldcoin');
                }}
              >
                <Image
                  src='/worldcoin-org-wld-logo.png'
                  alt='Worldcoin'
                  width={20}
                  height={20}
                  className='mr-2'
                />
                Worldcoin Login
              </Button>
              <Button
                variant='outline'
                className='flex items-center'
                onClick={openAuthModal}
              >
                <Globe className='h-5 w-5 mr-2' />
                Web3 Login
              </Button>
            </div>
          ) : (
            <div className='flex items-center space-x-4'>
              <div className='flex flex-col items-end'>
                <span className='text-sm text-gray-600'>
                  Signed in with {authType}
                </span>
                <span className='text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full truncate max-w-[200px]'>
                  {authType === 'worldcoin'
                    ? user?.email ?? truncate(user.name)
                    : truncate(user.address)}
                </span>
              </div>
              <Button
                variant='ghost'
                size='sm'
                className='text-gray-600 hover:text-gray-900'
                onClick={handleSignOut}
              >
                <LogOut className='h-4 w-4 mr-2' />
                Sign out
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
