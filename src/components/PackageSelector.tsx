"use client";

import { Box, Laptop, Package, Zap } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Packages to Include
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {PACKAGES.map((pkg) => {
          const Icon = pkg.icon;
          const isSelected = selectedPackages.includes(pkg.id);
          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => togglePackage(pkg.id)}
              className={cn(
                "flex w-full items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left cursor-pointer group",
                isSelected
                  ? "bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                  : "bg-secondary/50 border-border hover:border-muted-foreground/30 text-muted-foreground hover:bg-secondary/80",
              )}
            >
              <Checkbox
                id={pkg.id}
                checked={isSelected}
                onCheckedChange={() => togglePackage(pkg.id)}
                className="hidden" // We'll keep the whole box clickable
              />
              <Icon
                className={cn(
                  "w-5 h-5 transition-transform group-hover:scale-110",
                  isSelected ? "text-primary" : "text-muted-foreground",
                )}
              />
              <Label htmlFor={pkg.id} className="text-sm font-medium cursor-pointer flex-1">
                {pkg.name}
              </Label>
              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
