import { createContext } from 'react';
import { ToastContextValue } from './types';

export const ToastContext = createContext<ToastContextValue | null>(null);
