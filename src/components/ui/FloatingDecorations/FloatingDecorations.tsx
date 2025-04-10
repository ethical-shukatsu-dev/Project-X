import FloatingElement from '@/components/ui/FloatingElement';

export default function FloatingDecorations() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
      <FloatingElement
        className="absolute top-[5%] left-[2%] sm:top-[10%] sm:left-[5%]"
        baseSpeed={10}
        intensity={20}
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full sm:w-12 sm:h-12 opacity-20 blur-xl"></div>
      </FloatingElement>

      <FloatingElement
        className="absolute top-[20%] right-[5%] sm:top-[30%] sm:right-[10%]"
        baseSpeed={8}
        intensity={1.2}
      >
        <div className="w-10 h-10 bg-purple-500 rounded-full sm:w-16 sm:h-16 opacity-20 blur-xl"></div>
      </FloatingElement>

      <FloatingElement
        className="absolute bottom-[15%] left-[8%] sm:bottom-[20%] sm:left-[15%]"
        baseSpeed={5}
        intensity={1}
      >
        <div className="w-12 h-12 bg-pink-500 rounded-full sm:w-20 sm:h-20 opacity-20 blur-xl"></div>
      </FloatingElement>

      <FloatingElement
        className="absolute top-[50%] right-[8%] sm:top-[60%] sm:right-[15%]"
        baseSpeed={7}
        intensity={0.9}
      >
        <div className="w-10 h-10 bg-blue-500 rounded-full sm:w-14 sm:h-14 opacity-20 blur-xl"></div>
      </FloatingElement>

      {/* Static decorative elements */}
      <div className="absolute hidden w-40 h-40 bg-blue-500 rounded-full sm:block -left-20 top-1/3 opacity-20 blur-3xl"></div>
      <div className="absolute hidden bg-purple-500 rounded-full sm:block -right-20 top-2/3 w-60 h-60 opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 bg-blue-500 rounded-full left-1/4 w-80 h-80 opacity-10 blur-3xl -z-10"></div>
    </div>
  );
}
