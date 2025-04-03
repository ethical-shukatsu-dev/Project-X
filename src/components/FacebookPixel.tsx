'use client';

import { useEffect } from 'react';
import ReactPixel from 'react-facebook-pixel';

const FacebookPixel = () => {
  useEffect(() => {
    // Initialize Facebook Pixel
    if (typeof window !== 'undefined') {
      const options = {
        autoConfig: true,
        debug: process.env.NODE_ENV !== 'production',
      };
      
      ReactPixel.init(process.env.NEXT_PUBLIC_FB_PIXEL_ID as string, undefined, options);
      ReactPixel.pageView();
    }
  }, []);

  return null;
};

export default FacebookPixel; 