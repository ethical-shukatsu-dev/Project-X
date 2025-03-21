interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: "blue" | "purple" | "pink";
}

export default function FeatureCard({ title, description, icon, color }: FeatureCardProps) {
  const colorMap = {
    blue: {
      bg: "bg-blue-500/10",
      hoverBg: "group-hover:bg-blue-500/20",
      text: "text-blue-400",
      shadow: "hover:shadow-blue-500/10",
      border: "hover:border-blue-500/50",
      gradient: "from-blue-500",
    },
    purple: {
      bg: "bg-purple-500/10",
      hoverBg: "group-hover:bg-purple-500/20",
      text: "text-purple-400",
      shadow: "hover:shadow-purple-500/10",
      border: "hover:border-purple-500/50",
      gradient: "from-purple-500",
    },
    pink: {
      bg: "bg-pink-500/10",
      hoverBg: "group-hover:bg-pink-500/20",
      text: "text-pink-400",
      shadow: "hover:shadow-pink-500/10",
      border: "hover:border-pink-500/50",
      gradient: "from-pink-500",
    },
  };

  const styles = colorMap[color];

  return (
    <div className={`relative p-6 md:p-8 rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 group transition-all hover:shadow-xl ${styles.shadow} ${styles.border} duration-300`}>
      <div className={`flex items-center justify-center mb-6 transition-all duration-300 rounded-full w-14 h-14 ${styles.bg} ${styles.hoverBg}`}>
        <div className={styles.text}>{icon}</div>
      </div>
      <h3 className={`mb-3 text-xl font-semibold text-white transition-colors group-hover:${styles.text}`}>
        {title}
      </h3>
      <p className="text-gray-400 transition-colors group-hover:text-gray-300">
        {description}
      </p>
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${styles.gradient} to-transparent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500`}></div>
    </div>
  );
} 