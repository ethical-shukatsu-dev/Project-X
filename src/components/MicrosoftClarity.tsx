'use client';

import { useEffect } from 'react';
import clarity from '@microsoft/clarity';

interface MicrosoftClarityProps {
  clarityProjectId: string;
}

export default function MicrosoftClarity({ clarityProjectId }: MicrosoftClarityProps) {
  useEffect(() => {
    // Initialize Clarity
    if (clarityProjectId && typeof window !== 'undefined') {
      try {
        clarity.init(clarityProjectId);
        console.log('Microsoft Clarity initialized successfully');
      } catch (error) {
        console.error('Error initializing Microsoft Clarity:', error);
      }
    }
  }, [clarityProjectId]);

  return null; // This component doesn't render anything
}
