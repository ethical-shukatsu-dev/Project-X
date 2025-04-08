'use client';

import { ReactNode } from 'react';
import MicrosoftClarity from './MicrosoftClarity';
import { CLARITY_ENABLED, CLARITY_PROJECT_ID } from '@/lib/clarity';

interface ClarityProviderProps {
  children: ReactNode;
}

export default function ClarityProvider({ children }: ClarityProviderProps) {
  return (
    <>
      {CLARITY_ENABLED && <MicrosoftClarity clarityProjectId={CLARITY_PROJECT_ID} />}
      {children}
    </>
  );
} 