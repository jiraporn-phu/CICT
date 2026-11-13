import React from 'react';
import { Package } from "lucide-react";
import { categoryIcons } from "@/app/lib/constants";
import { EquipmentItem } from "@/app/lib/types";

export function EquipmentImage({ item }: { readonly item: EquipmentItem }) {
  if (item.imageUrl) {
    return (
      <img 
        src={item.imageUrl} 
        alt={item.name} 
        className="w-full h-full object-cover"
      />
    );
  }
  
  const Icon = categoryIcons[item.category] || Package;
  return <Icon size={48} className="text-slate-300 group-hover:text-sky-400 transition-colors duration-300" />;
}
