import {Avatar, AvatarImage, AvatarFallback} from "@/components/ui/avatar";
import {useEffect, useRef, useState} from "react";
import {EyeOff} from "lucide-react";

interface CompanyCardProps {
  name: string;
  logoUrl?: string | null;
  shouldAnonymize?: boolean;
}

export default function CompanyCard({name, logoUrl, shouldAnonymize = false}: CompanyCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [avatarSize, setAvatarSize] = useState(96); // Default 24 * 4 = 96px

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Avatar should be ~40% of container width, but capped between 48px and 96px
        setAvatarSize(Math.min(96, Math.max(48, containerWidth * 0.4)));
      }
    };

    // Initial size calculation
    updateSize();

    // Add resize observer to update sizes when container changes
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const getAnonymousName = () => {
    return `Company ${name.substring(0, 3).toUpperCase()}`;
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center w-full h-full gap-3 p-4 bg-white/90"
    >
      {shouldAnonymize ? (
        <Avatar
          className="bg-white border-4 border-white shadow-lg ring-1 ring-black/5"
          style={{
            width: avatarSize,
            height: avatarSize,
          }}
        >
          <div className="flex items-center justify-center w-full h-full bg-gray-200">
            <EyeOff className="opacity-70" size={avatarSize * 0.4} />
          </div>
        </Avatar>
      ) : (
        <Avatar
          className="bg-white border-4 border-white shadow-lg ring-1 ring-black/5"
          style={{
            width: avatarSize,
            height: avatarSize,
          }}
        >
          <AvatarImage src={logoUrl || ""} alt={name} />
          <AvatarFallback
            className="text-[length:calc(var(--avatar-size)*0.4)]"
            style={{"--avatar-size": `${avatarSize}px`} as React.CSSProperties}
          >
            {name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      
      <h3
        className="hidden w-full font-semibold text-center truncate text-black/80 sm:block drop-shadow-lg"
        style={{
          fontSize: `${Math.max(0.875, avatarSize * 0.016)}rem`,
          maxWidth: `${avatarSize * 2}px`,
        }}
      >
        {shouldAnonymize ? getAnonymousName() : name}
      </h3>
    </div>
  );
}
