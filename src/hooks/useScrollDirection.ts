"use client";

import { useState, useEffect } from "react";

/**
 * A hook that tracks scroll direction to hide/show elements like headers
 * @param threshold Minimum scroll amount (px) before direction change is detected
 * @returns An object with scrollDirection ("up" or "down") and scrollY position
 */
export function useScrollDirection(threshold = 10) {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let lastScrollY = window.pageYOffset;
    
    const updateScrollDirection = () => {
      const currentScrollY = window.pageYOffset;
      const direction = currentScrollY > lastScrollY ? "down" : "up";
      
      // Only update direction if the scroll difference exceeds the threshold
      if (Math.abs(currentScrollY - lastScrollY) > threshold) {
        setScrollDirection(direction);
      }

      setScrollY(currentScrollY);
      lastScrollY = currentScrollY;
    };

    const onScroll = () => {
      window.requestAnimationFrame(updateScrollDirection);
    };

    window.addEventListener("scroll", onScroll);
    
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return { scrollDirection, scrollY };
}

export default useScrollDirection; 