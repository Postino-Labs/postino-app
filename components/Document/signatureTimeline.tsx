import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, User, FileText, Clock } from 'lucide-react';
import { truncate } from '@/utils/truncate';

const SignatureTimeline = ({ signatures }: any) => {
  console.log({ signatures });
  return (
    <div className='space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent'>
      {signatures.map((signature: any, index: any) => {
        const attestation = JSON.parse(signature.attestation);
        if (!attestation) return null;
        return (
          <motion.div
            key={signature.id}
            className='relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className='flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-emerald-500 text-white group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2'>
              <User className='w-4 h-4' />
            </div>
            <div className='w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded shadow'>
              <div className='flex items-center justify-between space-x-2 mb-2'>
                <div className='font-bold text-slate-900'>
                  {signature.users.worldcoin_id
                    ? 'WorldCoin ID'
                    : 'Web3 Address'}{' '}
                  {truncate(
                    signature.users.worldcoin_id ||
                      signature.users.ethereum_address
                  )}
                </div>
                <time
                  className='font-mono text-slate-500 text-sm'
                  dateTime={signature.created_at}
                >
                  {new Date(signature.created_at).toLocaleString()}
                </time>
              </div>
              <div className='space-y-2 text-sm'>
                <div className='flex items-center text-slate-600'>
                  <FileText className='w-4 h-4 mr-2' />
                  <span>UID: {truncate(attestation.uid)}</span>
                </div>
                <div className='flex items-center text-slate-600'>
                  <Clock className='w-4 h-4 mr-2' />
                  <span>
                    Timestamp:{' '}
                    {new Date(attestation.message.time * 1000).toLocaleString()}{' '}
                  </span>
                </div>
              </div>
              <details className='mt-2'>
                <summary className='cursor-pointer text-sm text-slate-600 hover:text-slate-900'>
                  View Full Off-Chain Attestation
                </summary>
                <pre className='mt-2 text-xs bg-slate-100 p-2 rounded overflow-auto'>
                  {JSON.stringify(attestation, null, 2)}
                </pre>
              </details>
              <div className='flex items-center mt-3'>
                <CheckCircle className='w-4 h-4 text-emerald-500 mr-2' />
                <Badge
                  variant='outline'
                  className='bg-emerald-50 text-emerald-700 border-emerald-200'
                >
                  Signed
                </Badge>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default SignatureTimeline;
