import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Home, FileText, Users, Plus } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const router = useRouter();
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    setShouldAnimate(true);
  }, []);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/templates', label: 'Templates', icon: FileText },
    { href: '/team', label: 'Team', icon: Users },
  ];

  return (
    <AnimatePresence>
      <motion.aside
        className='w-64 h-full bg-white flex flex-col shadow-lg'
        initial={false}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className='flex flex-col items-center justify-center py-6'
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Image src='/postino.png' alt='Postino' width={160} height={40} />
          <motion.span
            className='text-xl font-bold text-yellow-600 mt-[-40px]'
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            postino
          </motion.span>
        </motion.div>

        <nav className='flex-grow px-4 mt-6'>
          <ul className='space-y-2'>
            {navItems.map((item, index) => (
              <motion.li
                key={item.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
              >
                <Link href={item.href} passHref>
                  <Button
                    variant={
                      router.pathname === item.href ? 'default' : 'ghost'
                    }
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
              </motion.li>
            ))}
          </ul>
        </nav>
        <motion.div
          className='px-4 py-6'
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href='/new' passHref>
              <Button className='w-full bg-yellow-400 text-white hover:bg-yellow-500 rounded-lg shadow-md text-base font-medium'>
                <Plus className='mr-2 h-5 w-5' />
                New document
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.aside>
    </AnimatePresence>
  );
}
