import React from 'react';
import Layout from '@/components/layout';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Twitter, Github } from 'lucide-react';

const teamMembers = [
  {
    name: 'mateodazab',
    image: '/pfp1.jpg',
    twitter: 'https://twitter.com/mateodazab',
    github: 'https://github.com/mateodaza',
  },
  {
    name: 'estarossa',
    image: '/pfp2.jpg',
    github: 'https://github.com/CarlosQ96',
  },
];

const Team = () => {
  return (
    <Layout>
      <div className='max-w-2xl mx-auto px-4 py-12'>
        <motion.h1
          className='text-3xl font-bold text-yellow-600 mb-8 text-center'
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Team
        </motion.h1>

        <div className='space-y-6'>
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              className='flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <Image
                src={member.image}
                alt={member.name}
                width={60}
                height={60}
                className='rounded-full'
              />
              <div className='flex-grow'>
                <h2 className='text-xl font-medium text-gray-700'>
                  {member.name}
                </h2>
              </div>
              <div className='flex space-x-2'>
                {member.twitter && (
                  <a
                    href={member.twitter}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-gray-400 hover:text-blue-400 transition-colors'
                  >
                    <Twitter size={20} />
                  </a>
                )}
                <a
                  href={member.github}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-gray-400 hover:text-gray-600 transition-colors'
                >
                  <Github size={20} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Team;
