import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Recipient {
  name: string;
  email: string;
}

interface DocumentState {
  file: File | null;
  recipients: Recipient[];
  requireSignature: boolean;
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
    requireSignature: false,
    // Initialize other state properties here
  });

  return (
    <DocumentContext.Provider value={{ state, setState }}>
      {children}
    </DocumentContext.Provider>
  );
};
