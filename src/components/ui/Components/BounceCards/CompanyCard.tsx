import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface CompanyCardProps {
  name: string;
  logoUrl?: string | null;
}

export default function CompanyCard({ name, logoUrl }: CompanyCardProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 w-full h-full p-6">
      <Avatar className="w-24 h-24 bg-white border-4 border-white shadow-lg">
        <AvatarImage src={logoUrl || ""} alt={name} />
        <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <h3 className="text-lg font-semibold text-white drop-shadow-lg max-w-[180px] truncate">
        {name}
      </h3>
    </div>
  );
} 