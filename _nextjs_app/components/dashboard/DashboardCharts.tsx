"use client";

import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie,

  Cell,
} from "recharts";

function ActivityBadge({ type }: { readonly type: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    borrow: { bg: "#dbeafe", text: "#1d4ed8", label: "ยืมอุปกรณ์แล้ว" },
    return: { bg: "#d1fae5", text: "#065f46", label: "คืนอุปกรณ์แล้ว" },
    request: { bg: "#fef3c7", text: "#92400e", label: "รอดำเนินการ" },
    approve: { bg: "#e0e7ff", text: "#3730a3", label: "อนุมัติแล้ว" },
    requisition: { bg: "#ffedd5", text: "#ea580c", label: "เบิกอุปกรณ์แล้ว" },
  };
  const c = config[type] || { bg: "#f3f4f6", text: "#6b7280", label: type };
  return (
    <span className="badge text-[11px]" style={{ background: c.bg, color: c.text }}>
      {c.label}
    </span>
  );
}

interface BarChartData { month: string; monthKey: string; borrowed: number; returned: number; added: number }

export function BorrowReturnChart({ data }: { readonly data: BarChartData[] }) {
  return (
    <div className="card p-5 lg:col-span-2 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-black text-slate-900 dark:text-white">ภาพรวมการยืมอุปกรณ์-คืนอุปกรณ์</h2>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "currentColor", fontWeight: 900 }} axisLine={{ stroke: 'currentColor', strokeWidth: 1 }} tickLine={{ stroke: 'currentColor' }} className="text-slate-500 dark:text-slate-400" />
          <YAxis tick={{ fontSize: 11, fill: "currentColor", fontWeight: 900 }} axisLine={{ stroke: 'currentColor', strokeWidth: 1 }} tickLine={{ stroke: 'currentColor' }} className="text-slate-500 dark:text-slate-400" />
          <Tooltip 
            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontSize: "12px", fontWeight: 900, backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }} 
            itemStyle={{ color: 'var(--foreground)' }} 
          />
          <Legend wrapperStyle={{ fontSize: "12px", color: "currentColor", fontWeight: 900 }} className="text-slate-600 dark:text-slate-300" />
          <Bar dataKey="borrowed" name="ยืมอุปกรณ์" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
          <Bar dataKey="returned" name="คืนอุปกรณ์" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="added" name="เพิ่มมาใหม่" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryPieChart({ data, title }: { readonly data: { name: string; value: number; color: string }[]; readonly title: string }) {
  return (
    <div className="card p-5 animate-fade-in flex flex-col h-full">
      <h3 className="text-sm font-black text-slate-500 dark:text-slate-400 mb-4">{title}</h3>
      <div className="flex-1 min-h-[140px]">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2} dataKey="value">
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontSize: "11px", fontWeight: 900, backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3">
        {data.map((cat) => (
          <div key={cat.name} className="flex items-center gap-1.5 min-w-0">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-black truncate">{cat.name} <span className="font-extrabold text-slate-900 dark:text-white">{cat.value}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecentActivityList({ activities, filterTitle }: { readonly activities: { id: string; user: string; equipment: string; type: string; timestamp: string }[]; readonly filterTitle: string }) {
  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-black text-slate-900 dark:text-white">การเคลื่อนไหวล่าสุด ({filterTitle})</h2>
      </div>
      <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
        {activities.length > 0 ? (
          activities.map((act) => (
            <div key={act.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-lg transition-colors px-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <ActivityBadge type={act.type} />
                  <span className="text-sm font-black text-slate-900 dark:text-slate-200 truncate">{act.user}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-black mt-0.5 truncate pl-1">{act.equipment}</p>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap font-black">{act.timestamp}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400 text-center py-4 italic">ไม่มีกิจกรรมล่าสุด</p>
        )}
      </div>
    </div>
  );
}

export function RecentEquipmentList({ equipment, filterTitle }: { readonly equipment: { id: string; name: string; category: string; quantity: number; date: string; time: string }[]; readonly filterTitle: string }) {
  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-black text-slate-900 dark:text-white">อุปกรณ์ที่เพิ่มมาใหม่ ({filterTitle})</h2>
        <Link href="/equipment" className="text-[11px] font-black text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 uppercase tracking-wider underline transition-colors">ดูทั้งหมด &rarr;</Link>
      </div>
      <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
        {equipment?.length > 0 ? (
          equipment.map((eq) => (
            <div key={eq.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-lg transition-colors px-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-200 truncate">{eq.name} <span className="text-[11px] text-slate-500 dark:text-slate-400 font-black font-mono">(เพิ่มเข้ามา {eq.quantity} ชิ้น)</span></span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-black mt-0.5 truncate pl-3">{eq.category}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-black uppercase tracking-tight">{eq.date}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-black leading-none">{eq.time}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400 text-center py-4 italic">ยังไม่มีข้อมูลการเพิ่มอุปกรณ์</p>
        )}
      </div>
    </div>
  );
}
