import React from 'react';
import Layout from '@/components/layout';
import {
  FileText,
  Briefcase,
  UserCheck,
  Lock,
  Key,
  Shield,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const Templates = () => {
  const templateTypes = [
    {
      icon: FileText,
      name: 'Agreements',
      description: 'NDAs, terms of service, privacy policies',
    },
    {
      icon: Briefcase,
      name: 'Business Contracts',
      description: 'Employment, vendor, partnership agreements',
    },
    {
      icon: UserCheck,
      name: 'Consent Forms',
      description: 'Medical consents, photo releases, GDPR compliance',
    },
  ];

  const futureImprovements = [
    {
      icon: Lock,
      title: 'Enhanced Privacy',
      description: 'Bringing more privacy to uploaded documents',
    },
    {
      icon: Key,
      title: 'Conditional Actions',
      description:
        'Enabling actions that depend on signatures, like accessing documents after signing an NDA',
    },
    {
      icon: Shield,
      title: 'Multi-level Security',
      description: 'Implementing different levels of security beyond Worldcoin',
    },
  ];

  return (
    <Layout>
      <div className='container mx-auto px-4 py-8'>
        <motion.h1
          className='text-4xl font-bold text-yellow-600 mb-6 text-center'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Document Templates Coming Soon
        </motion.h1>

        <motion.p
          className='text-xl text-gray-600 mb-12 text-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Streamline your document signing process with our upcoming template
          feature!
        </motion.p>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-12'>
          {templateTypes.map((type, index) => (
            <motion.div
              key={type.name}
              className='bg-white p-6 rounded-lg shadow-md text-center'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              <type.icon className='w-16 h-16 mx-auto mb-4 text-yellow-500' />
              <h2 className='text-2xl font-semibold mb-2'>{type.name}</h2>
              <p className='text-gray-600'>{type.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className='mt-16'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h2 className='text-3xl font-bold text-yellow-600 mb-6 text-center'>
            And Future Improvements
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {futureImprovements.map((improvement, index) => (
              <motion.div
                key={improvement.title}
                className='bg-white p-6 rounded-lg shadow-md text-center'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + 0.1 * index, duration: 0.5 }}
              >
                <improvement.icon className='w-12 h-12 mx-auto mb-4 text-yellow-500' />
                <h3 className='text-xl font-semibold mb-2'>
                  {improvement.title}
                </h3>
                <p className='text-gray-600'>{improvement.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Templates;
