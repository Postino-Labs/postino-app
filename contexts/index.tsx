import { PropsWithChildren } from 'react';
import { DocumentProvider } from './DocumentContext';

export const Contexts = (props: PropsWithChildren<{}>) => {
  return <DocumentProvider>{props.children}</DocumentProvider>;
};
