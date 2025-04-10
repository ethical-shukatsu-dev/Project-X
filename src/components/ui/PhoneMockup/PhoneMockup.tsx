import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PhoneMockupProps {
  imageSrc: string;
  altText?: string;
  className?: string;
}

export default function PhoneMockup({
  imageSrc,
  altText = 'App mockup in iPhone',
  className = '',
}: PhoneMockupProps) {
  return (
    <div className={cn('relative w-full h-[630px] max-w-[300px] mx-auto', className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-[40px] blur-xl"></div>
      <div className="relative h-full w-full">
        <div className="absolute inset-0 bg-black rounded-[40px] border-6 border-slate-900 overflow-hidden shadow-2xl transform rotate-0 scale-100">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-7 bg-black rounded-b-xl z-10"></div>
          <Image src={imageSrc} alt={altText} fill className="object-fill rounded-3xl" priority />
        </div>
      </div>
    </div>
  );
}
