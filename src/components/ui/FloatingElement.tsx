"use client";

import { ReactNode } from "react";

import {useEffect} from "react";
import {useRef, useState} from "react";

// 3D floating element component
interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  baseSpeed?: number;
  intensity?: number;
}

const FloatingElement = ({
  children,
  className = "",
  baseSpeed = 4,
  intensity = 1,
}: FloatingElementProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({x: 0, y: 0});

  useEffect(() => {
    const interval = setInterval(() => {
      const x = Math.sin(Date.now() / 1000 / baseSpeed) * 15 * intensity;
      const y = Math.cos(Date.now() / 1500 / baseSpeed) * 15 * intensity;
      setPosition({x, y});
    }, 50);

    return () => clearInterval(interval);
  }, [baseSpeed, intensity]);

  return (
    <div
      ref={ref}
      className={`${className} transition-transform duration-[2000ms] ease-out will-change-transform`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
    >
      {children}
    </div>
  );
};

export default FloatingElement;
