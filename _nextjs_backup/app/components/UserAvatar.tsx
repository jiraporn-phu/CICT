"use client";

import React from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  image?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function UserAvatar({ image, name, size = 'md', className = "" }: Readonly<UserAvatarProps>) {
  const sizeConfigs = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-3xl",
  };

  const sizeClass = sizeConfigs[size];
  const initial = name ? name.charAt(0).toUpperCase() : null;
  
  let fallbackIcon;
  if (!initial) {
    const iconSizes = { sm: 14, md: 18, lg: 24, xl: 32 };
    const iconSize = iconSizes[size] || 18;
    fallbackIcon = <User size={iconSize} className="opacity-40" />;
  }

  return (
    <div className={`rounded-full bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0 border border-white shadow-sm overflow-hidden ${sizeClass} ${className}`}>
      {image ? (
        <img 
          src={image} 
          alt={name || "User Profile"} 
          className="w-full h-full object-cover" 
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        initial || fallbackIcon
      )}
    </div>
  );
}
