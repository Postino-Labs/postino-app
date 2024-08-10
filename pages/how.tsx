import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Users, FileSignature, CheckCircle } from 'lucide-react';
import Layout from '@/components/layout';
import Link from 'next/link';

const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: 'Create & Customize',
      description:
        'Upload your document to IPFS, customize invitations, and set required signatures.',
      color: 'text-yellow-500',
    },
    {
      icon: Users,
      title: 'Identity & Signing',
      description:
        'Participants prove identity and sign via off-chain attestation.',
      color: 'text-yellow-500',
    },
    {
      icon: CheckCircle,
      title: 'Finalize On-Chain',
      description: 'Create an on-chain attestation summarizing all signatures.',
      color: 'text-yellow-500',
    },
  ];

  return (
    <Layout>
      <div className='py-16 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <motion.h2
            className='text-3xl font-extrabold text-yellow-600 text-center mb-12'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            How It Works
          </motion.h2>

          <div className='relative'>
            {/* Connecting line */}
            <div className='absolute top-1/2 left-4 right-4 h-1 bg-yellow-400 transform -translate-y-1/2 hidden md:block' />

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  className='relative bg-white p-6 rounded-lg shadow-lg'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                >
                  <div
                    className={`absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center ${step.color}`}
                  >
                    <step.icon size={24} />
                  </div>
                  <h3 className='mt-8 text-xl font-semibold text-gray-900 text-center'>
                    {step.title}
                  </h3>
                  <p className='mt-2 text-gray-600 text-center'>
                    {step.description}
                  </p>

                  {index === 0 && (
                    <motion.div
                      className='flex flex-row mt-4 p-2 gap-2 rounded-md justify-center'
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8, duration: 0.3 }}
                    >
                      <img
                        src='/op-mainnet.webp'
                        alt='optimism'
                        className='w-[50px] h-auto rounded'
                      />
                      <img
                        src='/worldcoin-org-wld-logo.png'
                        alt='worldcoin'
                        className='w-[50px] h-auto rounded'
                      />
                    </motion.div>
                  )}
                  {index === 1 && (
                    <Link
                      href='https://optimism.easscan.org/schema/view/0x81eda0d9ce8c4b8b211e8700215bd854703d21f44da8f35985f7e9d25228a438'
                      target='_blank'
                      passHref
                    >
                      <motion.div
                        className='flex flex-col mt-4 p-2 rounded-md items-center'
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8, duration: 0.3 }}
                      >
                        <img
                          src='/eas.png'
                          alt='Off-chain Attestation Schema'
                          className='w-[50px] h-auto rounded'
                        />
                        <p className='text-xs text-gray-500 mt-1 text-center underline'>
                          Off-chain Attestation Schema
                        </p>
                      </motion.div>
                    </Link>
                  )}

                  {index === 2 && (
                    <Link
                      href='https://optimism-sepolia.easscan.org/schema/view/0x91dbb634e5b814b76019e9330870af4abd073cd6f10273f87041e5977d522342'
                      target='_blank'
                      passHref
                    >
                      <motion.div
                        className='flex flex-col mt-4 p-2 rounded-md items-center'
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8, duration: 0.3 }}
                      >
                        <img
                          src='/eas.png'
                          alt='On-chain Attestation Schema'
                          className='w-[50px] h-auto rounded'
                        />
                        <p className='text-xs text-gray-500 mt-1 text-center underline'>
                          Off-chain Attestation Schema
                        </p>
                      </motion.div>
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HowItWorks;
