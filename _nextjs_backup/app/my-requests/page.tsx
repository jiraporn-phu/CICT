"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import { BorrowRequestCard } from "./BorrowRequestCard";
import { CheckSquare, Square, ShoppingBag, History, Heart, Clock, FileText } from "lucide-react";
import { EquipmentItem, BorrowTx } from "@/app/lib/types";
import { EquipmentGrid } from "../components/homepage/EquipmentGrid";
import { BorrowModal } from "../components/manage/BorrowModal";

export default function MyRequestsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"pending" | "borrowed" | "history" | "wishlist">("pending");
  const [historyFilter, setHistoryFilter] = useState<"all" | "borrow" | "requisition">("all");
  const [transactions, setTransactions] = useState<BorrowTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [wishlistItems, setWishlistItems] = useState<EquipmentItem[]>([]);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [borrowItem, setBorrowItem] = useState<EquipmentItem | null>(null);
  const [borrowMode, setBorrowMode] = useState<"borrow" | "requisition">("borrow");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (session?.user) {
        setCurrentUser(session.user);
        fetch("/api/users/myprofile")
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setCurrentUser((prev: any) => ({ ...prev, phone: data.phone }));
                }
            })
            .catch(err => console.error("Failed to fetch profile", err));
    }
  }, [session]);

  useEffect(() => {
    if (session?.user) {
      loadData();
      loadWishlist();
    } else if (session === null) {
      router.push("/login");
    }
  }, [session, router]);

  const loadWishlist = () => {
      fetch("/api/wishlist")
          .then(res => res.json())
          .then(data => {
              if (Array.isArray(data)) {
                  setWishlistItems(data);
                  setWishlistedIds(new Set(data.map((i: any) => i.id)));
              }
          })
          .catch(err => console.error("Failed to load wishlist", err));
  };

  const loadData = () => {
    setLoading(true);
    const userId = (session?.user as any).id;
    fetch(`/api/borrow?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTransactions(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load requests", err);
        setLoading(false);
      });
  };

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === borrowedTransactions.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = borrowedTransactions.map((t) => t.id);
      setSelectedIds(new Set(allIds));
    }
  };

  const handleReturnSelected = async () => {
    if (!confirm(`ยืนยันคืนอุปกรณ์ ${selectedIds.size} รายการ?`)) return;

    try {
      const promises = Array.from(selectedIds).map((id) =>
        fetch("/api/borrow/return", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId: id }),
        })
      );

      await Promise.all(promises);
      
      setSelectedIds(new Set());
      loadData();
      alert("ทำรายการคืนสำเร็จเรียบร้อย");
    } catch (error) {
      console.error("Bulk return failed", error);
      alert("เกิดข้อผิดพลาดในการคืนบางรายการ");
    }
  };

  const handleCancelRequest = async (id: string) => {
    if (!confirm("ต้องการยกเลิกคำขอนี้ใช่หรือไม่?")) return;

    try {
        const res = await fetch(`/api/borrow/${id}`, { method: "DELETE" });
        if (res.ok) {
            loadData();
        } else {
            alert("ยกเลิกไม่สำเร็จ");
        }
    } catch (error) {
        console.error(error);
        alert("Error cancelling request");
    }
  };

  const handleToggleWishlist = async (item: EquipmentItem) => {
      try {
          const res = await fetch(`/api/wishlist/${item.id}`, { method: 'DELETE' });
          if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              throw new Error(errorData.error || `Server responded with ${res.status}`);
          }
          
          setWishlistItems(prev => prev.filter(i => i.id !== item.id));
          setWishlistedIds(prev => {
              const next = new Set(prev);
              next.delete(item.id);
              return next;
          });
      } catch (error: any) {
          console.error("Failed to remove from wishlist", error);
          alert("ไม่สามารถลบออกจากรายการโปรดได้: " + (error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ"));
      }
  };

  const pendingTransactions = transactions.filter((t) => t.status === "pending");
  
  const borrowedTransactions = transactions.filter((t) => 
    ["borrowed", "overdue", "approved"].includes(t.status) && t.transactionType !== "REQUISITION"
  );
  
  const historyTransactionsRaw = transactions.filter((t) => 
    ["returned", "rejected", "cancelled", "requisitioned"].includes(t.status) || t.transactionType === "REQUISITION"
  );

  const historyTransactions = historyTransactionsRaw.filter(t => {
      if (historyFilter === "all") return true;
      if (historyFilter === "borrow") return t.transactionType !== "REQUISITION" && t.status !== "requisitioned";
      if (historyFilter === "requisition") return t.transactionType === "REQUISITION" || t.status === "requisitioned";
      return true;
  });

  const displayTransactions = 
    activeTab === "pending" ? pendingTransactions :
    activeTab === "borrowed" ? borrowedTransactions :
    activeTab === "history" ? historyTransactions :
    [];

  let content;
  if (loading) {
    content = <div className="text-center py-12 text-slate-400 animate-pulse">กำลังโหลดข้อมูล...</div>;
  } else if (activeTab === "wishlist") {
      if (wishlistItems.length === 0) {
          content = (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="bg-slate-50 dark:bg-slate-700 p-5 rounded-2xl mb-5 relative group">
                    <Heart size={42} className="text-slate-300 dark:text-slate-600 group-hover:scale-110 transition-transform duration-500" />
                    <Heart size={16} className="absolute -top-1 -right-1 text-red-400 fill-red-400 animate-pulse" />
                </div>
                <h3 className="text-slate-900 dark:text-white font-black text-xl mb-2">ยังไม่มีรายการที่บันทึกไว้</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8 text-center px-6">
                    กดไอคอนรูปหัวใจ <Heart size={14} className="inline mx-0.5 text-red-500 fill-red-500" /> ที่การ์ดอุปกรณ์ในหน้าแรกเพื่อบันทึกไว้ที่นี่
                </p>
                <button 
                    onClick={() => router.push("/")}
                    className="px-6 py-2.5 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-xl text-sm font-bold hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-all border border-sky-100 dark:border-sky-900/30 active:scale-95 flex items-center gap-2"
                >
                    <span>ไปที่หน้าแรกเพื่อเลือกดูอุปกรณ์</span>
                    <ShoppingBag size={16} />
                </button>
              </div>
          );
      } else {
          content = (
              <div className="animate-fade-in">
                  <EquipmentGrid 
                      items={wishlistItems} 
                      onBorrow={(item) => {
                          setBorrowMode("borrow");
                          setBorrowItem(item);
                      }} 
                      onReturn={() => {}} 
                      onRequisition={(item) => {
                          setBorrowMode("requisition");
                          setBorrowItem(item);
                      }}
                      wishlistedIds={wishlistedIds} 
                      onToggleWishlist={handleToggleWishlist} 
                  />
              </div>
          );
      }
  } else if (displayTransactions.length === 0) {
    content = (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl mb-5">
            <ShoppingBag size={42} className="text-slate-300 dark:text-slate-600" />
        </div>
        <p className="text-slate-900 dark:text-white font-black text-xl mb-2">ไม่พบรายการ{
            activeTab === 'pending' ? 'ที่รออนุมัติ' : 
            activeTab === 'borrowed' ? 'ที่กำลังยืม' : 
            'ประวัติ'
        }</p>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6">ดูเหมือนว่าคุณจะยังไม่มีรายการในหมวดหมู่นี้</p>
        <button 
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-xl text-sm font-bold hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-all border border-sky-100 dark:border-sky-900/30 active:scale-95"
        >
            ค้นหาอุปกรณ์ที่ต้องการยืม
        </button>
      </div>
    );
  } else {
    content = (
      <>
        {activeTab === "history" && historyTransactionsRaw.length > 0 && (
            <div className="mb-6 flex justify-end">
                <div className="relative inline-block w-64">
                    <select 
                        value={historyFilter}
                        onChange={(e) => setHistoryFilter(e.target.value as any)}
                        className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-4 focus:ring-sky-500/10 appearance-none cursor-pointer shadow-sm hover:border-sky-300 transition-all"
                    >
                        <option value="all">ทั้งหมด</option>
                        <option value="borrow">รายการยืมอุปกรณ์</option>
                        <option value="requisition">รายการเบิกอุปกรณ์</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                         <History size={16} />
                    </div>
                </div>
            </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayTransactions.map((txn) => (
              <BorrowRequestCard
                  key={txn.id}
                  transaction={txn}
                  isSelected={selectedIds.has(txn.id)}
                  onSelect={handleSelect}
                  onCancel={handleCancelRequest}
                  isHistory={activeTab === "history"}
              />
          ))}
        </div>
      </>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto pb-24"> 
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <ShoppingBag className="text-sky-500" /> รายการของฉัน
            </h1>
            <p className="text-sm text-slate-500 mt-1">จัดการรายการที่กำลัง ยืม-เบิก อุปกรณ์ และดูประวัติย้อนหลัง</p>
          </div>
        </div>

        {borrowItem && currentUser && (
            <BorrowModal
                item={borrowItem}
                userId={currentUser.id}
                userName={currentUser.fullName || currentUser.name}
                userPhone={currentUser.phone || ""}
                mode={borrowMode}
                onClose={() => setBorrowItem(null)}
                onSuccess={() => {
                    setBorrowItem(null);
                    router.push("/my-requests");
                    setActiveTab("pending");
                    loadData();
                }} 
            />
        )}

        <div className="flex border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap flex items-center gap-2 ${
              activeTab === "pending" 
                ? "text-sky-600 border-b-2 border-sky-500" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Clock size={16} /> รออนุมัติ ({pendingTransactions.length})
          </button>
          <button
            onClick={() => setActiveTab("borrowed")}
            className={`px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap flex items-center gap-2 ${
              activeTab === "borrowed" 
                ? "text-sky-600 border-b-2 border-sky-500" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <ShoppingBag size={16} /> กำลังยืม ({borrowedTransactions.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 text-sm font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap ${
              activeTab === "history" 
                ? "text-sky-600 border-b-2 border-sky-500" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <History size={16} /> ประวัติ ({historyTransactionsRaw.length})
          </button>
          <button
            onClick={() => setActiveTab("wishlist")}
            className={`px-6 py-3 text-sm font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap ${
              activeTab === "wishlist" 
                ? "text-red-500 border-b-2 border-red-500" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Heart size={16} className={activeTab === "wishlist" ? "fill-red-500" : ""} /> รายการโปรด ({wishlistItems.length})
          </button>
        </div>

        {activeTab === "borrowed" && borrowedTransactions.length > 0 && (
            <div className="mb-4 flex items-center gap-2">
                <button 
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-sky-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-sky-300"
                >
                    {selectedIds.size === borrowedTransactions.length ? (
                        <CheckSquare size={18} className="text-sky-500" />
                    ) : (
                        <Square size={18} className="text-slate-400" />
                    )}
                    เลือกทั้งหมด
                </button>
                <span className="text-xs text-slate-400 hidden sm:inline">
                    (เลือกรายการที่ต้องการคืน)
                </span>
            </div>
        )}

        {content}

      </div>

      {activeTab === "borrowed" && selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white text-slate-800 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 z-50 border border-slate-200 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="flex flex-col">
                <span className="text-xs text-slate-500">เลือกแล้ว</span>
                <span className="font-bold text-lg text-sky-600 leading-none">{selectedIds.size} รายการ</span>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <button 
                onClick={handleReturnSelected}
                className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-sky-200 transition-all hover:scale-105 active:scale-95"
            >
                คืนทันที
            </button>
        </div>
      )}
    </DashboardLayout>
  );
}
