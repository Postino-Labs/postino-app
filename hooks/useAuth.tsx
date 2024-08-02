import { useSession } from 'next-auth/react';
import { useSignerStatus, useUser } from '@account-kit/react';

export function useAuth() {
  const { data: session, status } = useSession();
  const web3User = useUser();
  const signerStatus = useSignerStatus();
  const isLoading = status === 'loading' || signerStatus.isInitializing;

  if (session) {
    return {
      user: session.user,
      isAuthenticated: true,
      authType: 'worldcoin',
      status: status,
      isLoading,
      session,
    };
  } else if (web3User) {
    return {
      user: {
        name: web3User.address,
        address: web3User.address,
      },
      isAuthenticated: true,
      authType: 'alchemy',
      status: 'authenticated',
      isLoading,
    };
  } else {
    return {
      user: null,
      isAuthenticated: false,
      authType: null,
      status: status,
      isLoading,
    };
  }
}
