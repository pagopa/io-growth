import { ReactNode } from 'react';

export type ContactRowProps = {
  icon: ReactNode;
  label: string;
  href: string;
  onClick?: () => void;
};
