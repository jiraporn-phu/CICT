import Link from "next/link";
import { Monitor } from "lucide-react";

interface HeroBannerProps {
  readonly isAdmin: boolean;
  readonly totalCount: number;
  readonly totalUnits: number;
  readonly availableCount: number;
  readonly borrowedCount: number;
  readonly statusFilter: string;
  readonly setStatusFilter: (v: string) => void;
}

export default function HeroBanner({ isAdmin, totalCount, totalUnits, availableCount, borrowedCount, statusFilter, setStatusFilter }: HeroBannerProps) {
  return (
    <div className="mb-6 overflow-hidden animate-fade-in border-none shadow-xl shadow-sky-100 dark:shadow-none bg-slate-900 bg-linear-to-br! from-slate-900 via-blue-900 to-sky-600 dark:from-slate-950 dark:via-slate-900 dark:to-blue-900 rounded-4xl relative">
      <div className="px-8 py-10 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        <h1 className="text-3xl font-black text-white! mb-2 tracking-tight">🖥️ รายการอุปกรณ์อิเล็กทรอนิกส์</h1>
        <p className="text-sm text-slate-300 mb-6">เลือกดูและทำการยืมหรือเบิกอุปกรณ์สำหรับการทำงาน</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl relative z-10">
          <button
            onClick={() => setStatusFilter("all")}
            className={`bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center cursor-pointer transition-all hover:bg-white/20 w-full border border-white/5 ${statusFilter === 'all' ? 'ring-2 ring-white/50 shadow-lg shadow-white/20 bg-white/20' : ''}`}
          >
            <p className="text-2xl font-black text-white">{totalCount}</p>
            <p className="text-[11px] text-slate-300 font-bold uppercase tracking-wider mt-1">ทั้งหมด (รายการ)</p>
          </button>
          
          <button
            onClick={() => setStatusFilter("all")}
            className={`bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center cursor-pointer transition-all hover:bg-white/20 w-full border border-white/5 ${statusFilter === 'all' ? 'ring-2 ring-white/50 shadow-lg shadow-white/20 bg-white/20' : ''}`}
          >
            <p className="text-2xl font-black text-sky-300">{totalUnits}</p>
            <p className="text-[11px] text-slate-300 font-bold uppercase tracking-wider mt-1">ทั้งหมด (ชิ้น)</p>
          </button>
          
          <button
            onClick={() => setStatusFilter("available")}
            className={`bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center cursor-pointer transition-all hover:bg-white/20 w-full border border-white/5 ${statusFilter === 'available' ? 'ring-2 ring-emerald-400 shadow-lg shadow-emerald-400/20 bg-white/20' : ''}`}
          >
            <p className="text-2xl font-black text-emerald-400">{availableCount}</p>
            <p className="text-[11px] text-slate-300 font-bold uppercase tracking-wider mt-1">พร้อมให้ยืม</p>
          </button>
          
          <button
            onClick={() => setStatusFilter("borrowed")}
            className={`bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center cursor-pointer transition-all hover:bg-white/20 w-full border border-white/5 ${statusFilter === 'borrowed' ? 'ring-2 ring-red-400 shadow-lg shadow-red-400/20 bg-white/20' : ''}`}
          >
            <p className="text-2xl font-black text-red-400">{borrowedCount}</p>
            <p className="text-[11px] text-slate-300 font-bold uppercase tracking-wider mt-1">กำลังถูกยืม</p>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex gap-3">
          {isAdmin ? (
            <Link href="/equipment" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors backdrop-blur-sm">
              <Monitor size={16} /> ไปหน้าจัดการอุปกรณ์ / เพิ่มรายการ
            </Link>
          ) : (
            <Link href="/my-requests" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors backdrop-blur-sm">
              <Monitor size={16} /> ติดตามการ ยืม-เบิก ของฉัน
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
