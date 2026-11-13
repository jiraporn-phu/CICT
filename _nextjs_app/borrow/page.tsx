"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import { Search, Filter, Clock, Check, X, Package, Calendar, User, Phone, Building, Trash2, MapPin, FileText } from "lucide-react";
import { BorrowTx } from "../lib/types";
import { statusLabel } from "../lib/constants";
import { UserAvatar } from "../components/UserAvatar";
import { BorrowDetailModal } from "../components/DetailModals";
import { ImageLightbox } from "../components/ImageLightbox";

// Reusable Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { bg: string, text: string, label: string }> = {
        pending: { bg: "bg-amber-50 text-amber-600 border-amber-100", text: "text-amber-600", label: "รออนุมัติ" },
        borrowed: { bg: "bg-blue-50 text-blue-600 border-blue-100", text: "text-blue-600", label: "กำลังยืม" },
        returned: { bg: "bg-emerald-50 text-emerald-600 border-emerald-100", text: "text-emerald-600", label: "คืนแล้ว" },
        rejected: { bg: "bg-red-50 text-red-600 border-red-100", text: "text-red-600", label: "ปฏิเสธ" },
        overdue: { bg: "bg-rose-50 text-rose-600 border-rose-100", text: "text-rose-600", label: "เกินกำหนดคืน" },
        requisitioned: { bg: "bg-orange-50 text-orange-600 border-orange-100", text: "text-orange-600", label: "เบิกอุปกรณ์" },
    };

    const style = config[status] || config.pending;

    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${style.bg}`}>
            {style.label}
        </span>
    );
};

function BorrowTrackingContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<BorrowTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedTx, setSelectedTx] = useState<BorrowTx | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [lightbox, setLightbox] = useState({ isOpen: false, url: "", alt: "" });
  
  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter) setFilterStatus(filter);
  }, [searchParams]);

  const isAdmin = session?.user?.role?.toUpperCase() === "ADMIN" || session?.user?.role?.toUpperCase() === "SUPERADMIN";

  useEffect(() => {
    if (session === null) {
      router.push("/login");
    } else if (session?.user && !isAdmin) {
      router.push("/");
    } else if (isAdmin) {
      const uId = searchParams.get("userId");
      fetchTransactions(uId);
    }
  }, [session, router, isAdmin, searchParams]);

  const fetchTransactions = async (uId?: string | null) => {
    setLoading(true);
    try {
      const url = uId ? `/api/borrow?userId=${uId}` : "/api/borrow";
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setTransactions(data);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const confirmMsg = status === 'borrowed' ? 'ยืนยันการอนุมัติการยืม?' : 
                       status === 'requisitioned' ? 'ยืนยันการอนุมัติการเบิกอุปกรณ์ (จะทำการตัดสต็อกถาวร)?' :
                       status === 'rejected' ? 'ยืนยันการปฏิเสธคำขอ?' : 
                       'ยืนยันการคืนอุปกรณ์?';
    
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/borrow/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchTransactions();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update status");
      }
    } catch (error) {
        console.error(error);
        alert("Error updating status");
    }
  };

  const handleDelete = async (id: string) => {
      if (!confirm("ยืนยันการลบรายการนี้? (ไม่สามารถย้อนกลับได้)")) return;
      try {
          const res = await fetch(`/api/borrow/${id}`, { method: "DELETE" });
          if (res.ok) {
              setTransactions(prev => prev.filter(t => t.id !== id));
          } else {
              alert("ลบไม่สำเร็จ");
          }
      } catch (error) {
          console.error(error);
          alert("Error deleting transaction");
      }
  };

  const handleOpenDetail = (txn: BorrowTx) => {
    setSelectedTx(txn);
    setShowDetail(true);
  };

  const handleOpenLightbox = (url: string, alt: string) => {
    setLightbox({ isOpen: true, url, alt });
  };

  const thTodayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });

  const statusCounts = {
    all: transactions.length,
    pending: transactions.filter(t => t.status === "pending").length,
    borrowed: transactions.filter(t => t.status === "borrowed").length,
    returned: transactions.filter(t => t.status === "returned").length,
    overdue: transactions.filter(t => 
      (t.status === "borrowed" || t.status === "overdue") && 
      new Date(t.dueDate).toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }) < thTodayStr
    ).length,
    requisition: transactions.filter(t => (t as any).transactionType === "REQUISITION" || t.status === "requisitioned").length
  };

  const filteredTransactions = transactions.filter((txn) => {
    const term = searchTerm.toLowerCase();
    const bName = txn.borrower?.fullName || txn.borrower?.username || "Unknown";
    const eqName = txn.equipment?.name || "Unknown";
    
    const matchesSearch = 
      bName.toLowerCase().includes(term) ||
      eqName.toLowerCase().includes(term);
      
    const matchesStatus = 
      filterStatus === "all" || 
      txn.status === filterStatus ||
      (filterStatus === "overdue" && (txn.status === "borrowed" || txn.status === "overdue") && new Date(txn.dueDate).toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }) < thTodayStr) ||
      (filterStatus === "requisition" && ((txn as any).transactionType === "REQUISITION" || txn.status === "requisitioned"));
    
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              สถานะการยืม-เบิกอุปกรณ์
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              จัดการและติดตามสถานะการ ยืม-เบิก อุปกรณ์
            </p>
          </div>
          {searchParams.get("userId") && transactions.length > 0 && (
            <div className="flex items-center gap-3 bg-sky-50 dark:bg-sky-900/20 px-4 py-2 rounded-2xl border border-sky-100 dark:border-sky-800">
               <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-800 flex items-center justify-center shrink-0">
                  <User size={14} className="text-sky-600" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">กำลังแสดงประวัติของ</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{transactions[0].borrower?.fullName || transactions[0].borrower?.username}</p>
               </div>
               <button 
                onClick={() => router.push('/borrow')}
                className="ml-2 p-1.5 hover:bg-sky-100 dark:hover:bg-sky-800 rounded-lg text-sky-400 hover:text-sky-600 transition-colors"
                title="ล้างการกรอง"
               >
                  <X size={16} />
               </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          {[
            { id: "all", label: "ทั้งหมด", count: statusCounts.all, color: "sky", icon: Package },
            { id: "pending", label: "รออนุมัติ", count: statusCounts.pending, color: "amber", icon: Clock },
            { id: "borrowed", label: "กำลังยืม", count: statusCounts.borrowed, color: "blue", icon: User },
            { id: "requisition", label: "การเบิกอุปกรณ์", count: statusCounts.requisition, color: "orange", icon: FileText },
            { id: "overdue", label: "อุปกรณ์ที่เกินกำหนดการยืม", count: statusCounts.overdue, color: "rose", icon: Clock },
            { id: "returned", label: "คืนแล้ว", count: statusCounts.returned, countColor: "emerald", color: "emerald", icon: Check },
          ].map((item) => {
            const isSelected = filterStatus === item.id;
            const colorMap: Record<string, { bg: string, ring: string, border: string, iconBg: string, iconText: string }> = {
              sky: { bg: "bg-sky-50", ring: "ring-sky-500", border: "border-sky-200", iconBg: "bg-sky-100", iconText: "text-sky-600" },
              amber: { bg: "bg-amber-50", ring: "ring-amber-500", border: "border-amber-200", iconBg: "bg-amber-100", iconText: "text-amber-600" },
              blue: { bg: "bg-blue-50", ring: "ring-blue-500", border: "border-blue-200", iconBg: "bg-blue-100", iconText: "text-blue-600" },
              orange: { bg: "bg-orange-50", ring: "ring-orange-500", border: "border-orange-200", iconBg: "bg-orange-100", iconText: "text-orange-600" },
              rose: { bg: "bg-rose-50", ring: "ring-rose-500", border: "border-rose-200", iconBg: "bg-rose-100", iconText: "text-rose-600" },
              emerald: { bg: "bg-emerald-50", ring: "ring-emerald-500", border: "border-emerald-200", iconBg: "bg-emerald-100", iconText: "text-emerald-600" },
            };
            const style = colorMap[item.color] || colorMap.sky;

            return (
              <button 
                key={item.id}
                onClick={() => setFilterStatus(item.id)}
                className={`card p-4 flex flex-col gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] text-left border ${
                  isSelected 
                    ? `ring-2 ${style.ring} ${style.bg} ${style.border}` 
                    : 'hover:shadow-md bg-white border-slate-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.iconBg} ${style.iconText}`}>
                  <item.icon size={20} />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-800">{item.count}</p>
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{item.label}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500" size={18} />
                <input 
                    type="text"
                    placeholder="ค้นหาชื่อผู้ยืม หรือ ชื่ออุปกรณ์..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {loading && (
             <div className="text-center py-20">
                 <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                 <p className="text-slate-400 text-sm">กำลังโหลดข้อมูล...</p>
             </div>
        )}

        {!loading && filteredTransactions.length === 0 && (
             <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Package size={24} className="text-slate-400" />
                 </div>
                 <p className="text-slate-500 font-medium">ไม่พบรายการที่ตรงกับเงื่อนไข</p>
             </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-20">
              {filteredTransactions.map((txn, i) => {
                const isOverdue = (txn.status === "borrowed" || txn.status === "overdue") && 
                                  new Date(txn.dueDate).toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }) < thTodayStr;
                const isRequisition = (txn as any).transactionType === "REQUISITION";

                return (
                  <article 
                    key={txn.id} 
                    className={`group bg-white rounded-2xl p-5 border transition-all duration-300 flex flex-col relative overflow-hidden animate-fade-in outline-none focus-within:ring-2 focus-within:ring-sky-500/50 ${
                        isOverdue 
                        ? "border-red-200 shadow-red-50 hover:shadow-red-100 hover:border-red-300 ring-1 ring-red-50" 
                        : isRequisition
                        ? "border-orange-200 shadow-orange-50 hover:shadow-orange-100 hover:border-orange-300"
                        : "border-slate-200 shadow-sm hover:shadow-md hover:border-sky-200"
                    }`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <button 
                        type="button"
                        className="absolute inset-0 z-0 bg-transparent border-none w-full h-full cursor-pointer"
                        onClick={() => handleOpenDetail(txn)}
                        aria-label={`View details for ${txn.equipment?.name}`}
                    />

                     <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-50 relative z-10 pointer-events-none">
                        <UserAvatar 
                            image={txn.borrower?.image} 
                            name={txn.borrower?.fullName || txn.borrower?.username} 
                            size="sm" 
                        />
                        <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-slate-800 truncate">{txn.borrower?.fullName || txn.borrower?.username}</h3>
                            <div className="flex flex-col gap-0.5 text-xs text-slate-400">
                                <div className="flex items-center gap-2"><Phone size={10} /> {txn.borrower?.phone || "-"}</div>
                                {txn.borrower?.department && <div className="flex items-center gap-2"><Building size={10} /> {txn.borrower.department}</div>}
                            </div>
                        </div>
                        <StatusBadge status={txn.status} />
                     </div>

                     {isRequisition && (
                         <div className="mb-3 px-3 py-1 bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 text-[10px] font-bold rounded-full w-fit flex items-center gap-1 border border-orange-200 dark:border-orange-500/30 relative z-10">
                             <FileText size={10} /> การเบิกอุปกรณ์ (ถาวร)
                         </div>
                     )}

                     <div className="flex-1 space-y-3 mb-4 relative z-10">
                         <div className="flex items-start gap-3">
                             <button 
                              type="button"
                              className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden relative"
                              onClick={(e) => {
                                  if (txn.equipment.imageUrl) {
                                      e.stopPropagation();
                                      handleOpenLightbox(txn.equipment.imageUrl, txn.equipment.name);
                                  }
                              }}
                              aria-label={`View ${txn.equipment.name} image`}
                           >
                              {txn.equipment.imageUrl ? (
                                  <img src={txn.equipment.imageUrl} alt="" className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform" />
                              ) : (
                                  <Package size={20} className="text-slate-400" />
                              )}
                          </button>
                             <div className="pointer-events-none">
                                 <p className="text-sm font-bold text-slate-700 line-clamp-1">{txn.equipment.name}</p>
                                 <p className="text-xs text-slate-500 mt-0.5">จำนวน: {txn.borrowQuantity} ชิ้น</p>
                             </div>
                         </div>
                         
                         <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs pointer-events-none">
                             <div>
                                 <p className="text-slate-400 mb-0.5 flex items-center gap-1"><Calendar size={10} /> {isRequisition ? 'เบิกเมื่อ' : 'ยืมเมื่อ'}</p>
                                 <p className="font-semibold text-slate-700">{new Date(txn.borrowDate).toLocaleDateString("th-TH-u-ca-buddhist")}</p>
                             </div>
                             <div>
                                 <p className="text-slate-400 mb-0.5 flex items-center gap-1"><Clock size={10} /> {isRequisition ? 'กำหนดการรับ' : 'กำหนดคืน'}</p>
                                 <p className={`font-semibold ${isOverdue ? 'text-red-600 underline decoration-red-200 underline-offset-4' : 'text-slate-700'}`}>
                                      {new Date(txn.dueDate).toLocaleDateString("th-TH-u-ca-buddhist")}
                                  </p>
                                  {isOverdue && (
                                      <p className="text-[10px] text-red-500 font-bold mt-1 animate-pulse flex items-center gap-1">
                                          <Clock size={10} /> เกินกำหนดการคืน!
                                      </p>
                                  )}
                             </div>
                         </div>
                     </div>

                     <div className="flex items-center gap-2 mt-auto pt-2 relative z-10">
                        {txn.status === 'pending' && isAdmin ? (
                            <div className="flex gap-2 flex-1">
                                <button 
                                    onClick={() => handleUpdateStatus(txn.id, txn.transactionType === "REQUISITION" ? "requisitioned" : "borrowed")}
                                    className={`flex-1 py-2 ${isRequisition ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'} rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm`}
                                >
                                    <Check size={14} strokeWidth={2.5} /> อนุมัติ
                                </button>
                                <button 
                                    onClick={() => handleUpdateStatus(txn.id, 'rejected')}
                                    className="flex-1 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                    <X size={14} strokeWidth={2.5} /> ปฏิเสธ
                                </button>
                            </div>
                        ) : (txn.status === 'borrowed' || txn.status === 'overdue') && !isRequisition ? (
                            <button 
                                onClick={() => handleUpdateStatus(txn.id, 'returned')}
                                className="flex-1 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                            >
                                <Check size={14} strokeWidth={2.5} /> แจ้งคืนอุปกรณ์
                            </button>
                        ) : (
                            <div className="flex-1"></div>
                        )}
                        
                        <button 
                            onClick={() => handleDelete(txn.id)}
                            className="p-2 rounded-xl border shadow-sm transition-all duration-200 bg-white border-slate-200 text-red-500 dark:bg-slate-700 dark:border-slate-600 dark:text-red-500 hover:bg-red-50 hover:border-red-500 hover:text-red-600 hover:scale-105 hover:shadow-md hover:shadow-red-500/20 dark:hover:bg-red-900/20 dark:hover:border-red-500/50 dark:hover:text-red-400 group"
                            title="ลบรายการ"
                        >
                            <Trash2 size={16} className="transition-colors fill-transparent group-hover:fill-red-600" />
                        </button>
                     </div>
                  </article>
                );
              })}
          </div>
      </div>

       <BorrowDetailModal 
         isOpen={showDetail} 
         onClose={() => setShowDetail(false)} 
         tx={selectedTx} 
       />

       <ImageLightbox 
         isOpen={lightbox.isOpen}
         onClose={() => setLightbox({ ...lightbox, isOpen: false })}
         imageUrl={lightbox.url}
         altText={lightbox.alt}
       />
    </DashboardLayout>
  );
}

export default function BorrowTrackingPage() {
    return (
        <Suspense fallback={
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                </div>
            </DashboardLayout>
        }>
            <BorrowTrackingContent />
        </Suspense>
    );
}
