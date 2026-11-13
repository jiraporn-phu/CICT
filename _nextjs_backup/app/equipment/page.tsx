"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "../components/DashboardLayout";
import { Search, Trash2, CheckSquare, Square, Plus, Monitor, Package, CheckCircle, Clock, FolderPlus, X } from "lucide-react";
import CreateCategoryModal from "@/app/components/manage/CreateCategoryModal";

import { EquipmentForm } from "@/app/components/manage/EquipmentForm";
import { EquipmentList } from "@/app/components/manage/EquipmentList";
import { BorrowModal } from "@/app/components/manage/BorrowModal";

import { EquipmentItem } from "@/app/lib/types";
import { DEPARTMENTS } from "@/app/lib/constants";

export default function ManagePage() {
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string })?.id || "";
  const userRole = (session?.user as any)?.role || "user";
  const userName = session?.user?.name || "";
  const userPhone = "";

  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dbCategories, setDbCategories] = useState<Record<string, string[]>>({});

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [borrowModal, setBorrowModal] = useState<EquipmentItem | null>(null);
  const [isEditing, setIsEditing] = useState<EquipmentItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const eqRes = await fetch("/api/equipment");
      const eqData = await eqRes.json();
      setEquipment(Array.isArray(eqData) ? eqData : []);
      
      const catRes = await fetch("/api/equipment/categories");
      if (catRes.ok) {
        setDbCategories(await catRes.json());
      }
    } catch {  }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      const term = search.toLowerCase();
      const matchSearch = search === "" || 
        item.name.toLowerCase().includes(term) || 
        (item.serialNumber ? item.serialNumber.toLowerCase().includes(term) : false);
        
      const matchDepartment = selectedDepartment === "all" || item.department === selectedDepartment;
      const matchCategory = selectedCategory === "all" || item.category === selectedCategory;
  
      let matchStatus = false;
      if (statusFilter === "all") {
        matchStatus = true;
      } else if (statusFilter === "available") {
        matchStatus = item.availableQuantity > 0;
      } else if (statusFilter === "borrowed") {
        matchStatus = item.availableQuantity === 0 && item.status !== "maintenance";
      } else if (statusFilter === "maintenance") {
        matchStatus = item.status === "maintenance";
      }
      
      return matchSearch && matchDepartment && matchCategory && matchStatus;
    });
  }, [equipment, search, selectedDepartment, selectedCategory, statusFilter]);

  const currentCategoryOptions = useMemo(() => {
    let opts: string[] = [];
    if (selectedDepartment === "all") {
      const allDbs = Object.values(dbCategories).flat();
      opts = Array.from(new Set(allDbs));
    } else {
      const dbs = dbCategories[selectedDepartment] || [];
      opts = Array.from(new Set(dbs));
    }
    return opts.filter(c => c !== "อื่นๆ" && c !== "OTHER").sort((a, b) => a.localeCompare(b, 'th'));
  }, [selectedDepartment, dbCategories]);

  const stats = useMemo(() => {
    const total = equipment.length;
    const available = equipment.filter(e => e.availableQuantity > 0).length;
    const borrowed = equipment.filter(e => e.availableQuantity === 0 && e.status !== 'maintenance').length;
    const maintenance = equipment.filter(e => e.status === 'maintenance').length;
    return { total, available, borrowed, maintenance };
  }, [equipment]);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredEquipment.length && filteredEquipment.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEquipment.map(e => e.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`ยืนยันลบ ${selectedIds.size} รายการที่เลือก?`)) return;
    
    setLoading(true);
    await Promise.all(Array.from(selectedIds).map(id => 
        fetch(`/api/equipment/${id}`, { method: "DELETE" })
    ));
    
    setSelectedIds(new Set());
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบอุปกรณ์นี้?")) return;
    await fetch(`/api/equipment/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleEdit = (item: EquipmentItem) => {
    setIsEditing(item);
  };

  const handleDeleteCategoryFromManage = async (cat: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ "${cat}"?\n*อุปกรณ์ทั้งหมดในหมวดหมู่นี้จะถูกเปลี่ยนเป็น "อื่นๆ"`)) return;
    
    try {
      const departments = selectedDepartment === "all" 
        ? DEPARTMENTS 
        : [selectedDepartment];
      
      await Promise.all(departments.map(dept =>
        fetch("/api/equipment/categories/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: cat, department: dept }),
        })
      ));

      setDbCategories(prev => {
        const updated = { ...prev };
        for (const dept of Object.keys(updated)) {
          updated[dept] = updated[dept].filter(c => c !== cat);
        }
        return updated;
      });
      
      if (selectedCategory === cat) setSelectedCategory("all");
      fetchData();
    } catch (err) {
      console.error("Delete category error:", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        
        <div className="rounded-3xl overflow-hidden relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] dark:opacity-10 pointer-events-none"></div>
            <div className="relative p-7 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 z-10">
                <div className="space-y-3 text-center lg:text-left">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center justify-center lg:justify-start gap-4 tracking-tight">
                        <div className="p-3 bg-sky-500/10 rounded-2xl">
                           <Monitor className="text-sky-500" size={32} />
                        </div>
                        จัดการอุปกรณ์
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-semibold max-w-md">จัดการรายการอุปกรณ์ ตรวจสอบสถานะ และแก้ไขข้อมูลแบบครบวงจร</p>
                </div>
                
                {userRole === "admin" && (
                    <div className="flex flex-wrap items-center justify-center gap-4">
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="group flex items-center gap-3 px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-black shadow-xl shadow-sky-500/25 transition-all hover:scale-105 active:scale-95"
                    >
                        <div className="bg-white/20 p-1.5 rounded-full group-hover:rotate-90 transition-transform">
                             <Plus size={20} strokeWidth={3} />
                        </div>
                        <span>เพิ่มอุปกรณ์ใหม่</span>
                    </button>
                    <button 
                        onClick={() => setIsAddingCategory(true)}
                        className="group flex items-center gap-3 px-6 py-4 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-2xl font-black border border-slate-200 dark:border-slate-600 transition-all hover:scale-105 active:scale-95"
                    >
                        <FolderPlus size={20} className="text-sky-500" />
                        <span>สร้างหมวดหมู่</span>
                    </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 relative z-10">
                <button onClick={() => setStatusFilter('all')} 
                    className={`p-6 text-center hover:bg-white dark:hover:bg-slate-800 transition-all group relative border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-700 ${statusFilter === 'all' ? 'bg-white dark:bg-slate-800 shadow-inner' : ''}`}>
                    <div className={`text-3xl font-black mb-1 transition-colors ${statusFilter === 'all' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'}`}>{stats.total}</div>
                    <div className="text-[12px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2"><Package size={14} className="text-sky-500" /> ทั้งหมด (รายการ)</div>
                    {statusFilter === 'all' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-sky-500"></div>}
                </button>
                <button onClick={() => setStatusFilter('available')} 
                    className={`p-6 text-center hover:bg-white dark:hover:bg-slate-800 transition-all group relative border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-700 ${statusFilter === 'available' ? 'bg-white dark:bg-slate-800 shadow-inner' : ''}`}>
                    <div className={`text-3xl font-black mb-1 transition-colors ${statusFilter === 'available' ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-emerald-500'}`}>{stats.available}</div>
                    <div className="text-[12px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> มีในสต็อก (รายการ)</div>
                    {statusFilter === 'available' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>}
                </button>
                <button onClick={() => setStatusFilter('borrowed')} 
                    className={`p-6 text-center hover:bg-white dark:hover:bg-slate-800 transition-all group relative ${statusFilter === 'borrowed' ? 'bg-white dark:bg-slate-800 shadow-inner' : ''}`}>
                    <div className={`text-3xl font-black mb-1 transition-colors ${statusFilter === 'borrowed' ? 'text-red-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-red-500'}`}>{stats.borrowed}</div>
                    <div className="text-[12px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2"><Clock size={14} className="text-red-500" /> หมดสต็อก (รายการ)</div>
                    {statusFilter === 'borrowed' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500"></div>}
                </button>
            </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
             
             <div className="flex items-center gap-2 w-full xl:w-96 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus-within:ring-2 focus-within:ring-sky-500/30 focus-within:border-sky-500 transition-all">
                <Search size={20} className="text-sky-500" />
                <input 
                  type="text" 
                  placeholder="ค้นหาชื่อ, รหัส..." 
                  className="bg-transparent outline-none text-sm w-full dark:text-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>

             <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto items-center">
             <div className="flex gap-3 items-center flex-wrap">
                    <div className="relative shrink-0">
                      <select 
                        value={selectedDepartment} 
                        onChange={(e) => {
                          setSelectedDepartment(e.target.value);
                          setSelectedCategory("all");
                        }}
                        className="appearance-none pl-4 pr-10 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-600 outline-none cursor-pointer focus:ring-2 focus:ring-sky-500/50"
                      >
                        <option value="all">ทุกแผนก</option>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>แผนก {d}</option>)}
                      </select>
                      <div className="absolute right-3 top-2.5 pointer-events-none text-slate-500">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>

                    <div className="relative shrink-0">
                      <button 
                        type="button"
                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                        className="flex items-center gap-2 pl-4 pr-10 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-600 outline-none cursor-pointer focus:ring-2 focus:ring-sky-500/50 bg-white dark:bg-slate-800 dark:text-white min-w-[140px]"
                      >
                        {selectedCategory === "all" ? "ทุกหมวดหมู่" : selectedCategory}
                      </button>
                      <div className="absolute right-3 top-2.5 pointer-events-none text-slate-500">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                      
                      {isCategoryDropdownOpen && (
                        <div className="absolute z-50 w-72 md:w-80 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 right-0 max-sm:fixed max-sm:top-1/2 max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:-translate-y-1/2 max-sm:w-[90vw] max-sm:max-h-[80vh]">
                          <div className="bg-sky-500 text-white px-4 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-between">
                            <span>จัดการหมวดหมู่</span>
                            <button onClick={() => setIsCategoryDropdownOpen(false)} className="sm:hidden text-white/80 hover:text-white p-1">
                               <X size={16} />
                            </button>
                          </div>
                          <div className="max-h-[50vh] sm:max-h-60 overflow-y-auto">
                            <button 
                              type="button"
                              onClick={() => { setSelectedCategory("all"); setIsCategoryDropdownOpen(false); }}
                              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors outline-none ${selectedCategory === "all" ? "text-sky-500 font-bold" : "text-slate-700 dark:text-slate-200"}`}
                            >
                              ทุกหมวดหมู่
                            </button>
                            {currentCategoryOptions.map(cat => (
                              <div key={cat} className="group flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <button 
                                  type="button"
                                  onClick={() => { setSelectedCategory(cat); setIsCategoryDropdownOpen(false); }}
                                  className={`flex-1 text-left text-sm outline-none ${selectedCategory === cat ? "text-sky-500 font-bold" : "text-slate-700 dark:text-slate-200"}`}
                                >
                                  {cat}
                                </button>
                                {userRole === "admin" && (
                                  <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteCategoryFromManage(cat); }}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                    title="ลบหมวดหมู่"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                 </div>

                 <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-700 mx-2"></div>

                 {userRole === "admin" && (
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-sky-600 transition-colors whitespace-nowrap">
                            {selectedIds.size === filteredEquipment.length && filteredEquipment.length > 0 ? <CheckSquare size={18} className="text-sky-500" /> : <Square size={18} />}
                            เลือกทั้งหมด
                        </button>
                        
                        {selectedIds.size > 0 && (
                            <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors animate-in fade-in slide-in-from-right-5 whitespace-nowrap shadow-sm border border-red-100 dark:border-red-900/30">
                                <Trash2 size={16} /> ลบ {selectedIds.size} รายการ
                            </button>
                        )}
                    </div>
                 )}
              </div>
        </div>

        <EquipmentList 
            equipment={filteredEquipment} 
            loading={loading} 
            userRole={userRole} 
            onBorrow={setBorrowModal} 
            onDelete={handleDelete}
            onEdit={handleEdit}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            showCheckbox={userRole === "admin"}
        />

        {(isAdding || isEditing) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div 
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
                  onClick={() => { setIsAdding(false); setIsEditing(null); }}
                  aria-hidden="true"
              />
                <div className="w-full max-w-lg relative animate-in slide-in-from-bottom-5 zoom-in-95 duration-200 cursor-auto" onClick={e => e.stopPropagation()}>
                    <EquipmentForm 
                        mode={isEditing ? "edit" : "create"}
                        initialData={isEditing || undefined} 
                        onSuccess={() => { 
                            setIsAdding(false); 
                            setIsEditing(null); 
                            fetchData(); 
                        }} 
                        onCancel={() => {
                            setIsAdding(false);
                            setIsEditing(null);
                        }}
                    />
                </div>
            </div>
        )}

        {borrowModal && (
          <BorrowModal 
            item={borrowModal} 
            onClose={() => setBorrowModal(null)} 
            onSuccess={fetchData} 
            userId={userId} 
            userName={userName} 
            userPhone={userPhone} 
          />
        )}
        <CreateCategoryModal isOpen={isAddingCategory} onClose={() => setIsAddingCategory(false)} onCreated={fetchData} />

      </div>
    </DashboardLayout>
  );
}
