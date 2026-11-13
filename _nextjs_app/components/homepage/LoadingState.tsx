import React from 'react';
import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <Loader2 size={40} className="animate-spin mb-4 text-sky-500" />
      <p>กำลังโหลดข้อมูล...</p>
    </div>
  );
}
