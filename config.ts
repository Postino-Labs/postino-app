// @noErrors
import {
  createConfig,
  //  cookieStorage
} from '@account-kit/react';
import { QueryClient } from '@tanstack/react-query';
import { optimism } from '@account-kit/infra';

export const config = createConfig(
  {
    // alchemy config
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!, // TODO: add your Alchemy API key - setup your app and embedded account config in the alchemy dashboard (https://dashboard.alchemy.com/accounts)
    chain: optimism, // TODO: specify your preferred chain here and update imports from @account-kit/infra
    ssr: true, // Defers hydration of the account state to the client after the initial mount solving any inconsistencies between server and client state (read more here: https://accountkit.alchemy.com/react/ssr)
    // storage: cookieStorage, // persist the account state using cookies (read more here: https://accountkit.alchemy.com/react/ssr#persisting-the-account-state)
  },
  {
    // authentication ui config - your customizations here
    auth: {
      sections: [[{ type: 'email' }], [{ type: 'injected' }]],
      // addPasskeyOnSignup: true,
      // showSignInText: true,
    },
  }
);

export const queryClient = new QueryClient();
