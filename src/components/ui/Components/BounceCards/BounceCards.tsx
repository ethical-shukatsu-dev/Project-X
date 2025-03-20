/*
	Installed from https://reactbits.dev/ts/tailwind/
*/

import { useEffect, ReactNode } from "react";
import { gsap } from "gsap";

interface BounceCardsProps {
  className?: string;
  cards: ReactNode[];
  containerWidth?: number;
  containerHeight?: number;
  animationDelay?: number;
  animationStagger?: number;
  easeType?: string;
  transformStyles?: string[];
  enableHover?: boolean;
}

export default function BounceCards({
  className = "",
  cards = [],
  containerWidth = 400,
  containerHeight = 400,
  animationDelay = 0.5,
  animationStagger = 0.06,
  easeType = "elastic.out(1, 0.8)",
  transformStyles = [
    "rotate(12deg) translate(-240px)",
    "rotate(6deg) translate(-120px)",
    "rotate(0deg)",
    "rotate(-6deg) translate(120px)",
    "rotate(-12deg) translate(240px)",
  ],
  enableHover = false,
}: BounceCardsProps) {
  useEffect(() => {
    gsap.fromTo(
      ".card",
      { scale: 0 },
      {
        scale: 1,
        stagger: animationStagger,
        ease: easeType,
        delay: animationDelay,
      },
    );
  }, [animationDelay, animationStagger, easeType]);

  const getNoRotationTransform = (transformStr: string): string => {
    const hasRotate = /rotate\([\s\S]*?\)/.test(transformStr);
    if (hasRotate) {
      return transformStr.replace(/rotate\([\s\S]*?\)/, "rotate(0deg)");
    } else if (transformStr === "none") {
      return "rotate(0deg)";
    } else {
      return `${transformStr} rotate(0deg)`;
    }
  };

  const getPushedTransform = (
    baseTransform: string,
    offsetX: number,
  ): string => {
    const translateRegex = /translate\(([-0-9.]+)px\)/;
    const match = baseTransform.match(translateRegex);
    if (match) {
      const currentX = parseFloat(match[1]);
      const newX = currentX + offsetX;
      return baseTransform.replace(translateRegex, `translate(${newX}px)`);
    } else {
      return baseTransform === "none"
        ? `translate(${offsetX}px)`
        : `${baseTransform} translate(${offsetX}px)`;
    }
  };

  const pushSiblings = (hoveredIdx: number) => {
    if (!enableHover) return;

    cards.forEach((_, i) => {
      const selector = `.card-${i}`;
      gsap.killTweensOf(selector);

      const baseTransform = transformStyles[i] || "none";
      const offsetMultiplier = containerWidth * 0.2; // 20% of container width
      const maxOffset = 160;

      if (i === hoveredIdx) {
        const noRotation = getNoRotationTransform(baseTransform);
        gsap.to(selector, {
          transform: noRotation,
          duration: 0.4,
          ease: "back.out(1.4)",
          overwrite: "auto",
        });
      } else {
        const offsetX = i < hoveredIdx 
          ? Math.max(-maxOffset, -offsetMultiplier)
          : Math.min(maxOffset, offsetMultiplier);
        const pushedTransform = getPushedTransform(baseTransform, offsetX);

        const distance = Math.abs(hoveredIdx - i);
        const delay = distance * 0.05;

        gsap.to(selector, {
          transform: pushedTransform,
          duration: 0.4,
          ease: "back.out(1.4)",
          delay,
          overwrite: "auto",
        });
      }
    });
  };

  const resetSiblings = () => {
    if (!enableHover) return;

    cards.forEach((_, i) => {
      const selector = `.card-${i}`;
      gsap.killTweensOf(selector);

      const baseTransform = transformStyles[i] || "none";
      gsap.to(selector, {
        transform: baseTransform,
        duration: 0.4,
        ease: "back.out(1.4)",
        overwrite: "auto",
      });
    });
  };

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{
        width: containerWidth,
        height: containerHeight,
      }}
    >
      {cards.map((content, idx) => (
        <div
          key={idx}
          className={`card card-${idx} absolute border-8 border-white/90 rounded-[30px] overflow-hidden bg-white/5 backdrop-blur-sm flex items-center justify-center`}
          style={{
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            transform: transformStyles[idx] || "none",
            width: Math.min(200, Math.max(120, containerWidth * 0.3)),
            aspectRatio: "1",
          }}
          onMouseEnter={() => pushSiblings(idx)}
          onMouseLeave={resetSiblings}
        >
          {content}
        </div>
      ))}
    </div>
  );
}
