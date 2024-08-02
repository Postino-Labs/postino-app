import 'next-auth';
import 'next-auth/jwt';
import { User as AlchemyUser } from '@account-kit/react';

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    provider?: 'worldcoin' | 'alchemy';
  }
}

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    provider?: 'worldcoin' | 'alchemy';
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      address?: string | null; // For Alchemy users
    } & DefaultSession['user'];
  }
}

// If we need to extend the User type for Alchemy Account Kit
declare module '@account-kit/react' {
  interface User extends AlchemyUser {
    // Add any additional properties
  }
}
