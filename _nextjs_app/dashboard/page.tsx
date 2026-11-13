"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import DashboardLayout from "../components/DashboardLayout";
import {
  Monitor, ArrowDownUp, CheckCircle, AlertTriangle, Activity,
  Building, Users as UsersIcon, Layers, TrendingUp, TrendingDown,
  FileText, Clock,
} from "lucide-react";
import DashboardFilterBar from "../components/dashboard/DashboardFilterBar";
import { BorrowReturnChart, CategoryPieChart, RecentActivityList, RecentEquipmentList } from "../components/dashboard/DashboardCharts";
import { getThaiNowDate } from "../lib/utils";

interface DashboardData {
  stats: {
    totalEquipment: number; totalPhysicalUnits: number;
    currentlyBorrowed: number; available: number; overdueReturns: number;
    totalUsers: number; pendingRequests: number; pendingUserApprovals: number;
    todayActivities: number; newItemsThisMonth: number;
    totalDepartments: number; totalCategories: number;
    totalRequisitions: number;
  };
  categoryDistribution: { name: string; value: number; color: string }[];
  itDistribution: { name: string; value: number; color: string }[];
  prDistribution: { name: string; value: number; color: string }[];
  monthlyChartData: { month: string; monthKey: string; borrowed: number; returned: number; added: number }[];
  recentActivities: { id: string; user: string; equipment: string; type: string; timestamp: string }[];
  recentEquipment: { id: string; name: string; category: string; quantity: number; date: string; time: string }[];
  availableMonths: { key: string; label: string }[];
  availableYears: { key: string; label: string }[];
  filterTitle: string;
}

function KpiCard({ title, value, icon: Icon, color, bgColor, trend, trendUp, href, comparisonLabel }: any) {
  const content = (
    <div className="card p-5 flex items-center gap-4 animate-fade-in transition-all h-full min-h-[110px] hover:scale-[1.02] active:scale-[0.98] cursor-pointer hover:shadow-md">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs" style={{ background: bgColor }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <p className="text-[11px] text-slate-900 dark:text-slate-400 font-black uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{value}</p>
        <div className="mt-1">
          {trend ? (
            <div className="flex flex-wrap items-center gap-1">
              <div className="flex items-center gap-1 mr-1">
                {trendUp ? <TrendingUp size={12} className="text-emerald-500" /> : <TrendingDown size={12} className="text-red-500" />}
                <span className={`text-[10px] font-black ${trendUp ? "text-emerald-500" : "text-red-500"}`}>{trend}</span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase leading-none">{comparisonLabel || "เทียบกับเดือนก่อน"}</span>
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-tight">ไม่มีการเปลี่ยนแปลง</div>
          )}
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href} className="h-full block">{content}</Link> : content;
}

function StatCard({ title, value, icon: Icon, color, href }: any) {
  const content = (
    <div className="card p-4 flex items-center gap-3 animate-fade-in transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer hover:shadow-md">
      <Icon size={18} style={{ color }} />
      <div>
        <p className="text-lg font-black text-slate-900 dark:text-white">{value}</p>
        <p className="text-[12px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-tight">{title}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

const QUICK_LINK_STYLES: Record<string, { bg: string, border: string, icon: string, text: string, hover: string }> = {
  indigo: { bg: "bg-indigo-50/50 dark:bg-indigo-900/10", border: "border-indigo-100 dark:border-indigo-500/30", icon: "bg-indigo-100 dark:bg-indigo-500/30 text-indigo-600 dark:text-indigo-400", text: "text-indigo-600 dark:text-indigo-400", hover: "hover:border-indigo-500 hover:shadow-indigo-500/10" },
  emerald: { bg: "bg-emerald-50/50 dark:bg-emerald-900/10", border: "border-emerald-100 dark:border-emerald-500/30", icon: "bg-emerald-100 dark:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400", text: "text-emerald-600 dark:text-emerald-400", hover: "hover:border-emerald-500 hover:shadow-emerald-500/10" },
  purple: { bg: "bg-purple-50/50 dark:bg-purple-900/10", border: "border-purple-100 dark:border-purple-500/30", icon: "bg-purple-100 dark:bg-purple-500/30 text-purple-600 dark:text-purple-400", text: "text-purple-600 dark:text-purple-400", hover: "hover:border-purple-500 hover:shadow-purple-500/10" },
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [filterLevel, setFilterLevel] = useState<"all" | "day" | "month" | "year" | "custom">("all");
  const [selectedDate, setSelectedDate] = useState<string>(getThaiNowDate());
  const [selectedMonth, setSelectedMonth] = useState<string>(getThaiNowDate().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState<string>(getThaiNowDate().slice(0, 4));
  const [startDate, setStartDate] = useState<string>(getThaiNowDate());
  const [endDate, setEndDate] = useState<string>(getThaiNowDate());
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    let url = "/api/dashboard/stats";
    if (filterLevel === "day") url += `?date=${selectedDate}`;
    else if (filterLevel === "month") url += `?month=${selectedMonth}`;
    else if (filterLevel === "year") url += `?year=${selectedYear}`;
    else if (filterLevel === "custom") url += `?startDate=${startDate}&endDate=${endDate}`;

    fetch(url)
      .then(res => res.json())
      .then(res => { 
        if (res.stats) {
          setData(res); 
        }
        setLoading(false); 
      })
      .catch(err => { 
        setLoading(false); 
      });
  }, [filterLevel, selectedDate, selectedMonth, selectedYear, startDate, endDate]);

  const handleExport = async () => {
    const mode = "portrait";
    try {
      setExporting(true);
      let exportUrl = "/api/dashboard/report-pdf";
      const params = new URLSearchParams();
      if (filterLevel === "day") params.append("date", selectedDate);
      else if (filterLevel === "month") params.append("month", selectedMonth);
      else if (filterLevel === "year") params.append("year", selectedYear);
      else if (filterLevel === "custom") {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
      }
      params.append("orientation", mode);
      
      const reportRes = await fetch(`${exportUrl}?${params.toString()}`);
      if (!reportRes.ok) throw new Error("Export failed");

      const blob = await reportRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inventory-report-${getThaiNowDate()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการดาวน์โหลดรายงาน PDF");
    } finally {
      setExporting(false);
    }
  };

  if (loading || !data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen text-slate-400">Loading Dashboard...</div>
      </DashboardLayout>
    );
  }

  const { stats } = data;

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              ยินดีต้อนรับ, {session?.user?.name || "ผู้ใช้งาน"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-black uppercase tracking-wide">ภาพรวมระบบจัดการทรัพย์สินและอุปกรณ์</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <DashboardFilterBar
              filterLevel={filterLevel} setFilterLevel={setFilterLevel}
              selectedDate={selectedDate} setSelectedDate={setSelectedDate}
              selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}
              selectedYear={selectedYear} setSelectedYear={setSelectedYear}
              startDate={startDate} setStartDate={setStartDate}
              endDate={endDate} setEndDate={setEndDate}
              availableMonths={data.availableMonths} availableYears={data.availableYears}
            />
            <button onClick={() => handleExport()} disabled={exporting} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${exporting ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 hover:border-sky-300 hover:shadow-md active:scale-95 dark:bg-sky-500/10 dark:border-sky-500/20 dark:text-sky-400 dark:hover:bg-sky-500/20"}`}>
              {exporting ? <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" /> : <FileText size={18} />}
              {exporting ? "กำลังสร้าง PDF..." : "ส่งออกสรุปผล (PDF)"}
            </button>
          </div>
        </div>

        {stats.overdueReturns > 0 && (
          <div className="card mb-6 px-5 py-3 border-l-4 border-sky-400 flex items-center gap-3 bg-sky-50">
            <AlertTriangle size={16} className="text-sky-600 shrink-0" />
            <p className="text-sm text-slate-700">มีอุปกรณ์ <span className="font-semibold text-sky-700">{stats.overdueReturns} รายการ</span> เกินกำหนดคืน กรุณาติดตามผู้ยืม</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          <KpiCard title="อุปกรณ์ทั้งหมด" value={stats.totalEquipment.toLocaleString()} icon={Monitor} color="#3b82f6" bgColor="#dbeafe" href="/equipment" trend={stats.newItemsThisMonth > 0 ? `+${stats.newItemsThisMonth} รายการใหม่` : undefined} trendUp={true} comparisonLabel={(stats as any).comparisonLabel} />
          <KpiCard title="คำขอรออนุมัติ" value={stats.pendingRequests.toLocaleString()} icon={Clock} color="#f59e0b" bgColor="#fff7ed" href="/borrow?filter=pending" comparisonLabel={(stats as any).comparisonLabel} />
          <KpiCard title="อุปกรณ์ที่ถูกยืม" value={stats.currentlyBorrowed} icon={ArrowDownUp} color="#6366f1" bgColor="#e0e7ff" href="/borrow" comparisonLabel={(stats as any).comparisonLabel} />
          <KpiCard title="รายการเบิก" value={(stats as any).totalRequisitions || 0} icon={FileText} color="#f97316" bgColor="#fff7ed" href="/borrow?filter=requisition" comparisonLabel={(stats as any).comparisonLabel} />
          <KpiCard title="เกินกำหนดคืน" value={stats.overdueReturns} icon={AlertTriangle} color="#ef4444" bgColor="#fee2e2" href="/borrow?filter=overdue" comparisonLabel={(stats as any).comparisonLabel} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <StatCard title="ผู้ใช้ทั้งหมด" value={stats.totalUsers} icon={UsersIcon} color="#8b5cf6" href="/users" />
          <StatCard title={filterLevel === "all" ? "ความเคลื่อนไหววันนี้" : `ความเคลื่อนไหว (${data.filterTitle})`} value={stats.todayActivities} icon={Activity} color="#06b6d4" href="/borrow" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <BorrowReturnChart data={data.monthlyChartData} />

          <div className="card p-5 animate-fade-in flex flex-col bg-white dark:bg-slate-900 border-none shadow-xl shadow-slate-200/50 dark:shadow-none">
            <h2 className="text-base font-black text-[#000000] dark:text-slate-200 mb-5">ทางลัดจัดการ (Quick Actions)</h2>
            <div className="space-y-4 flex-1">
              {[
                { href: "/users?tab=department", label: "แผนก", value: stats.totalDepartments, icon: Building, color: "indigo", desc: "จัดการสายงานและแผนก" },
                { href: "/users", label: "พนักงาน", value: stats.totalUsers, icon: UsersIcon, color: "emerald", desc: "บัญชีผู้ใช้และสิทธิ์คน" },
                { href: "/equipment", label: "หมวดหมู่", value: stats.totalCategories, icon: Layers, color: "purple", desc: "ประเภทสินทรัพย์ทั้งหมด" },
              ].map((item) => {
                const style = QUICK_LINK_STYLES[item.color];
                return (
                  <Link key={item.label} href={item.href} className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all group ${style.bg} ${style.border} ${style.hover}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform ${style.icon}`}>
                      <item.icon size={28} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${style.text}`}>{item.label}</p>
                          <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{item.value}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-black mb-1 truncate">{item.desc}</p>
                          <span className="text-slate-400 dark:text-slate-500 group-hover:translate-x-1 transition-all inline-block">&rarr;</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <CategoryPieChart data={data.categoryDistribution} title="สัดส่วนตามหมวดหมู่ (ทุกแผนก)" />
          <CategoryPieChart data={data.itDistribution} title="สัดส่วนตามหมวดหมู่ (แผนก IT)" />
          <CategoryPieChart data={data.prDistribution} title="สัดส่วนตามหมวดหมู่ (แผนก PR)" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <RecentActivityList activities={data.recentActivities} filterTitle={data.filterTitle} />
          <RecentEquipmentList equipment={data.recentEquipment} filterTitle={data.filterTitle} />
        </div>
      </div>
    </DashboardLayout>
  );
}
