'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

type Props = {
  pixelId?: string;
  trackable?: boolean;
}

const FacebookPixel = ({ 
  pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID,
  trackable = true 
}: Props) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pixelId || !trackable) return;

    // Dynamically import react-facebook-pixel
    import('react-facebook-pixel')
      .then((x) => x.default)
      .then((ReactPixel) => {
        const options = {
          autoConfig: true,
          debug: process.env.NODE_ENV !== 'production',
        };
        
        ReactPixel.init(pixelId, undefined, options);
        ReactPixel.pageView();
      });
  }, [pixelId, trackable, pathname, searchParams]);

  return null;
};

export default FacebookPixel; 