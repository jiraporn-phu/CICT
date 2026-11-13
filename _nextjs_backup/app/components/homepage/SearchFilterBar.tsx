import { Search, ChevronRight, Filter, Package } from "lucide-react";
import { categoryIcons } from "@/app/lib/constants";

interface SearchFilterBarProps {
  readonly search: string;
  readonly onSearchChange: (val: string) => void;
  readonly statusFilter: string;
  readonly setStatusFilter: (v: string) => void;
  readonly showFilters: boolean;
  readonly setShowFilters: (v: boolean) => void;
  readonly selectedCategory: string;
  readonly setSelectedCategory: (v: string) => void;
  readonly categories: { id: string; name: string }[];
  readonly items: { category: string }[];
}

export default function SearchFilterBar({
  search, onSearchChange, statusFilter, setStatusFilter,
  showFilters, setShowFilters,
  selectedCategory, setSelectedCategory,
  categories, items,
}: SearchFilterBarProps) {
  return (
    <>
      <div className="card p-4 mb-4 flex flex-col md:flex-row gap-4 items-center z-20 relative border-none shadow-lg shadow-slate-200/50 dark:shadow-none">
        <div className="flex items-center gap-2 flex-1 w-full px-3 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-within:ring-2 focus-within:ring-sky-500/30 dark:focus-within:ring-sky-500/20 focus-within:border-sky-500 transition-all shadow-sm">
          <Search size={20} className="text-sky-500" />
          <input
            type="text"
            placeholder="ค้นหาอุปกรณ์..."
            className="bg-transparent outline-none text-sm w-full text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="relative w-full md:w-56 z-20">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${showFilters ? 'border-sky-500 ring-2 ring-sky-100 dark:ring-sky-900 bg-white dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'} text-slate-700 dark:text-slate-300`}
          >
            <span className="flex items-center gap-2 truncate">
              <Filter size={16} className={statusFilter === 'all' ? "text-slate-400 dark:text-slate-500" : "text-sky-500"} />
              {statusFilter === 'all' && "สถานะ: ทั้งหมด"}
              {statusFilter === 'available' && "สถานะ: มีในสต็อก"}
              {statusFilter === 'borrowed' && "สถานะ: หมดสต็อก"}
            </span>
            <ChevronRight size={16} className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 ${showFilters ? "rotate-90" : ""}`} />
          </button>

          {showFilters && (
            <>
              <div className="fixed inset-0 bg-black/50 z-20 md:bg-transparent cursor-default" onClick={() => setShowFilters(false)} aria-hidden="true" />
              <div className="absolute top-full right-0 mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                <button onClick={() => { setStatusFilter('all'); setShowFilters(false); }} className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 ${statusFilter === 'all' ? 'text-sky-600 dark:text-sky-400 font-medium bg-sky-50/50 dark:bg-sky-900/20' : 'text-slate-600 dark:text-slate-400'}`}>
                  <span>ทั้งหมด</span>
                  {statusFilter === 'all' && <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />}
                </button>
                <button onClick={() => { setStatusFilter('available'); setShowFilters(false); }} className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 ${statusFilter === 'available' ? 'text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50/50 dark:bg-emerald-900/20' : 'text-slate-600 dark:text-slate-400'}`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>มีในสต็อก</span>
                  </div>
                  {statusFilter === 'available' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                </button>
                <button onClick={() => { setStatusFilter('borrowed'); setShowFilters(false); }} className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 ${statusFilter === 'borrowed' ? 'text-red-600 dark:text-red-400 font-medium bg-red-50/50 dark:bg-red-900/20' : 'text-slate-600 dark:text-slate-400'}`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>หมดสต็อก</span>
                  </div>
                  {statusFilter === 'borrowed' && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-full text-sm font-black transition-all cursor-pointer ${selectedCategory === "all" ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30" : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"}`}
        >
          ทั้งหมด ({items.length})
        </button>
        {categories.map((cat) => {
          const Icon = categoryIcons[cat.name] || Package;
          const count = items.filter((e) => e.category === cat.name).length;
          if (count === 0) return null;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-black transition-all cursor-pointer ${selectedCategory === cat.name ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30" : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"}`}
            >
              <Icon size={14} />
              {cat.name} ({count})
            </button>
          );
        })}
      </div>
    </>
  );
}
