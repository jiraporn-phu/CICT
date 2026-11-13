import React from 'react';
import { Search } from "lucide-react";

export function EmptyState() {
  return (
    <div className="card py-24 text-center animate-fade-in border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-800 rounded-5xl group mx-auto w-full px-8">
      <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
        <Search className="text-sky-500 dark:text-sky-400 animate-pulse" size={40} strokeWidth={2.5} />
      </div>
      <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 tracking-tight">ไม่พบอุปกรณ์</h3>
      <p className="text-base text-slate-500 dark:text-slate-400 font-semibold max-w-sm mx-auto leading-relaxed">
        ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่
      </p>
    </div>
  );
}
