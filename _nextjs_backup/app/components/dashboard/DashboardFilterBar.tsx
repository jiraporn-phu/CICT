"use client";

import { Calendar, Layers } from "lucide-react";
import { CustomDatePicker } from "../CustomDatePicker";

interface DashboardFilterBarProps {
  readonly filterLevel: "all" | "day" | "month" | "year" | "custom";
  readonly setFilterLevel: (v: "all" | "day" | "month" | "year" | "custom") => void;
  readonly selectedDate: string;
  readonly setSelectedDate: (v: string) => void;
  readonly selectedMonth: string;
  readonly setSelectedMonth: (v: string) => void;
  readonly selectedYear: string;
  readonly setSelectedYear: (v: string) => void;
  readonly startDate: string;
  readonly setStartDate: (v: string) => void;
  readonly endDate: string;
  readonly setEndDate: (v: string) => void;
  readonly availableMonths?: { key: string; label: string }[];
  readonly availableYears?: { key: string; label: string }[];
}

export default function DashboardFilterBar({
  filterLevel, setFilterLevel,
  selectedDate, setSelectedDate,
  selectedMonth, setSelectedMonth,
  selectedYear, setSelectedYear,
  startDate, setStartDate,
  endDate, setEndDate,
  availableMonths, availableYears,
}: DashboardFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        {[
          { id: "all", label: "ทั้งหมด" },
          { id: "day", label: "รายวัน" },
          { id: "month", label: "รายเดือน" },
          { id: "year", label: "รายปี" },
          { id: "custom", label: "กำหนดเอง" }
        ].map((level) => (
          <button
            key={level.id}
            onClick={() => setFilterLevel(level.id as any)}
            className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
              filterLevel === level.id
              ? "bg-white text-sky-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {level.label}
          </button>
        ))}
      </div>

      {filterLevel === "day" && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
          <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm overflow-hidden">
            <select
              value={selectedDate.split('-')[2]}
              onChange={(e) => {
                const parts = selectedDate.split('-');
                setSelectedDate(`${parts[0]}-${parts[1]}-${e.target.value.padStart(2, '0')}`);
              }}
              className="px-2 py-1.5 text-sm font-black text-slate-900 dark:text-slate-300 outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 border-r border-slate-100 dark:border-slate-800"
            >
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>{i + 1}</option>
              ))}
            </select>
            <select
              value={selectedDate.slice(0, 7)}
              onChange={(e) => {
                const day = selectedDate.split('-')[2];
                setSelectedDate(`${e.target.value}-${day}`);
              }}
              className="px-3 py-1.5 text-sm font-black text-slate-900 dark:text-slate-300 outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 border-r border-slate-100 dark:border-slate-800 min-w-[100px]"
            >
              {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((mIdx) => {
                const year = selectedDate.split('-')[0];
                const label = new Date(`${year}-${mIdx}-02`).toLocaleDateString('th-TH-u-ca-buddhist', { timeZone: 'Asia/Bangkok', month: 'long' });
                return <option key={mIdx} value={`${year}-${mIdx}`}>{label}</option>;
              })}
            </select>
            <select
              value={selectedDate.split('-')[0]}
              onChange={(e) => {
                const rest = selectedDate.split('-').slice(1).join('-');
                setSelectedDate(`${e.target.value}-${rest}`);
              }}
              className="px-2 py-1.5 text-sm font-black text-slate-900 dark:text-slate-300 outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {availableYears?.map(y => (
                <option key={y.key} value={y.key}>พ.ศ. {parseInt(y.key) + 543}</option>
              ))}
            </select>
          </div>
          <Calendar size={18} className="text-sky-500 shrink-0" />
        </div>
      )}

      {filterLevel === "month" && (
        <div className="relative group animate-in fade-in slide-in-from-right-2 duration-300">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="appearance-none pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-black text-slate-900 dark:text-slate-300 outline-none hover:border-sky-400 transition-all cursor-pointer min-w-[200px] shadow-sm"
          >
            {availableMonths?.map(m => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
          <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-sky-500 transition-colors pointer-events-none" />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-slate-400 rotate-45" />
          </div>
        </div>
      )}

      {filterLevel === "year" && (
        <div className="relative group animate-in fade-in slide-in-from-right-2 duration-300">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="appearance-none pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-black text-slate-900 dark:text-slate-300 outline-none hover:border-sky-400 transition-all cursor-pointer min-w-[140px] shadow-sm"
          >
            {availableYears?.map(y => (
              <option key={y.key} value={y.key}>{y.label}</option>
            ))}
          </select>
          <Layers size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-sky-500 transition-colors pointer-events-none" />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-slate-400 rotate-45" />
          </div>
        </div>
      )}

      {filterLevel === "custom" && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm gap-2">
            <CustomDatePicker 
              value={startDate} 
              onChange={setStartDate}
              className="border-none bg-transparent shadow-none"
              placeholder="วันเริ่มต้น"
            />
            <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase">ถึง</span>
            <CustomDatePicker 
              value={endDate} 
              onChange={setEndDate}
              className="border-none bg-transparent shadow-none"
              placeholder="วันสิ้นสุด"
            />
          </div>
          <Calendar size={18} className="text-sky-500 shrink-0" />
        </div>
      )}
    </div>
  );
}
