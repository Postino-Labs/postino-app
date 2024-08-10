import { SessionProvider } from 'next-auth/react';
import './styles/alchemy-modal.css';
import './globals.css';

import type { AppProps } from 'next/app';
import type { Session } from 'next-auth';
import { Providers } from '@/providers';
import { Contexts } from '@/contexts';
import Head from 'next/head';

// Use of the <SessionProvider> is mandatory to allow components that call
// `useSession()` anywhere in your application to access the `session` object.
export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={session}>
      <Providers>
        <Contexts>
          <Head>
            <link
              rel='shortcut icon'
              href='https://www.postino.xyz/favicon.ico'
            />
          </Head>
          <Component {...pageProps} />
        </Contexts>
      </Providers>
    </SessionProvider>
  );
}
