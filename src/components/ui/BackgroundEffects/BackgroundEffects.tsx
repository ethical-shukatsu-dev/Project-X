import Aurora from "@/components/ui/Backgrounds/Aurora/Aurora";

interface BackgroundEffectsProps {
  auroraColorStops?: string[];
  auroraAmplitude?: number;
  auroraBlend?: number;
}

export default function BackgroundEffects({
  auroraColorStops = ["#3B82F6", "#8B5CF6", "#EC4899"],
  auroraAmplitude = 1.5,
  auroraBlend = 0.6,
}: BackgroundEffectsProps) {
  return (
    <>
      {/* Background Aurora Effect */}
      <div className="absolute inset-0 z-0 opacity-40 sm:opacity-50">
        <Aurora
          colorStops={auroraColorStops}
          amplitude={auroraAmplitude}
          blend={auroraBlend}
        />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 z-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      ></div>

      {/* Grain overlay using CSS pattern */}
      <div
        className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      ></div>
    </>
  );
} 