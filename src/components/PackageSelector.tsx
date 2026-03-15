"use client";

import { Checkbox } from "@/components/ui/checkbox"; // I'll create a simple checkbox if shadcn isn't here, or just use native for now
import { cn } from "@/lib/utils";
import { Package, Laptop, Zap, Box } from "lucide-react";

const PACKAGES = [
  { id: "shadcn", name: "Shadcn UI", icon: Package },
  { id: "lucide", name: "Lucide Icons", icon: Laptop },
  { id: "framer-motion", name: "Framer Motion", icon: Zap },
  { id: "tailwind", name: "Tailwind CSS", icon: Box },
];

interface PackageSelectorProps {
  selectedPackages: string[];
  onChange: (packages: string[]) => void;
}

export function PackageSelector({ selectedPackages, onChange }: PackageSelectorProps) {
  const togglePackage = (id: string) => {
    if (selectedPackages.includes(id)) {
      onChange(selectedPackages.filter((p) => p !== id));
    } else {
      onChange([...selectedPackages, id]);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Packages to Include</h3>
      <div className="grid grid-cols-2 gap-3">
        {PACKAGES.map((pkg) => {
          const Icon = pkg.icon;
          const isSelected = selectedPackages.includes(pkg.id);
          return (
            <button
              key={pkg.id}
              onClick={() => togglePackage(pkg.id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left",
                isSelected 
                  ? "bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                  : "bg-secondary/50 border-border hover:border-muted-foreground/50 text-muted-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isSelected ? "text-primary" : "text-muted-foreground")} />
              <span className="text-sm font-medium">{pkg.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
