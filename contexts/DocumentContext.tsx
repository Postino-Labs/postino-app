import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Recipient {
  name: string;
  email: string;
  web3Address?: string;
}

interface DocumentState {
  file: File | null;
  recipients: Recipient[];
  requireWorldID: boolean;
  ipfsHash: string;
  attestation: any; // You might want to define a more specific type for the attestation
  creatorSignature?: any;
  currentStep: number;
  documentId?: string;
  isConfirmed?: boolean;
  // Add any other state properties here
}

interface DocumentContextType {
  state: DocumentState;
  setState: React.Dispatch<React.SetStateAction<DocumentState>>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(
  undefined
);

export const useDocumentContext = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error(
      'useDocumentContext must be used within a DocumentProvider'
    );
  }
  return context;
};

export const DocumentProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<DocumentState>({
    file: null,
    recipients: [],
    requireWorldID: true,
    ipfsHash: '',
    attestation: null,
    currentStep: 1,
    isConfirmed: false,
    // Initialize other state properties here
  });

  return (
    <DocumentContext.Provider value={{ state, setState }}>
      {children}
    </DocumentContext.Provider>
  );
};
