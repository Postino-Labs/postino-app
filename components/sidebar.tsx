import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Home, MailQuestion, FileText, Users, Plus } from 'lucide-react';

const Sidebar: React.FC = React.memo(() => {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/how', label: 'How it Works', icon: MailQuestion },
    { href: '/templates', label: 'Templates', icon: FileText },
    { href: '/team', label: 'Team', icon: Users },
  ];

  return (
    <aside className='w-64 h-full bg-white flex flex-col shadow-lg'>
      <div className='flex flex-col items-center justify-center py-6 relative'>
        <Link href='/' className='flex flex-col items-center'>
          <div className='w-[160px] h-[100px] relative'>
            <Image
              src='/postino.png'
              alt='Postino'
              layout='fill'
              objectFit='cover'
              priority
              onLoadingComplete={() => setImageLoaded(true)}
              className={cn(
                'transition-opacity duration-300 w-[200px] h-[100px]',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
            />
          </div>
          <span className='text-xl font-bold text-yellow-600 mt-2'>
            postino
          </span>
        </Link>
      </div>

      <nav className='flex-grow px-4 mt-6'>
        <ul className='space-y-2'>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} passHref>
                <Button
                  variant={router.pathname === item.href ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start rounded-lg text-base font-medium',
                    router.pathname === item.href
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className='mr-3 h-5 w-5' />
                  {item.label}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className='px-4 py-6'>
        <Link href='/new' passHref>
          <Button className='w-full bg-yellow-500 text-white hover:bg-yellow-600 rounded-lg shadow-md text-base font-medium'>
            <Plus className='mr-2 h-5 w-5' />
            New document
          </Button>
        </Link>
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
