import Image from "next/image";
import {Avatar} from "@/components/ui/avatar";

interface CompanyLogosProps {
  className?: string;
}

export default function CompanyLogos({className = ""}: CompanyLogosProps) {
  const companies = [
    {name: "Toyota", logo: "/images/companies/toyota.png"},
    {name: "SEGA", logo: "/images/companies/sega.png"},
    {name: "Softbank", logo: "/images/companies/softbank.png"},
    {name: "Mizuho", logo: "/images/companies/mizuho.png"},
    {name: "Deloitte", logo: "/images/companies/deloitte.png"},
    {name: "NRI", logo: "/images/companies/nri.png"},
    {name: "Nestle", logo: "/images/companies/nestle.png"},
    {name: "Asahi", logo: "/images/companies/asahi.png"},
  ];

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-4 gap-4 sm:gap-6 items-center justify-items-center max-w-5xl mx-auto">
        {companies.map((company) => (
          <Avatar
            key={company.name}
            className="size-16 sm:size-20 md:size-20 bg-white rounded-full p-3 sm:p-4 md:p-5 transition-all duration-200 hover:scale-105 shadow-sm ring-2 ring-purple-500/80"
          >
            <div className="relative w-full h-full">
              <Image
                src={company.logo}
                alt={`${company.name} logo`}
                fill
                priority
                className="object-contain scale-125 md:scale-160"
                sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 112px"
              />
            </div>
          </Avatar>
        ))}
      </div>
    </div>
  );
}
