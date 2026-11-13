"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Modal from "../../components/Modal";
import { ArrowLeft, MapPin, Calendar, Tag, Hash, Cpu, Shield, Phone, User, Edit2, Trash2, Loader2, ImageIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Borrower {
  fullName: string;
  phone: string;
}

interface BorrowTx {
  id: string;
  status: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  borrower: Borrower;
}

interface EquipmentDetail {
  id: string;
  name: string;
  category: string;
  description: string | null;
  status: string;
  imageUrl: string | null;
  location: string | null;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  borrows: BorrowTx[];
}

export default function EquipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<EquipmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (!params?.id) return;
      
      const res = await fetch(`/api/equipment/${params.id}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("ไม่พบอุปกรณ์");
        throw new Error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
      
      const data = await res.json();
      setItem(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!item) return;
    try {
      const res = await fetch(`/api/equipment/${item.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/equipment");
      } else {
        alert("ลบอุปกรณ์ไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการลบ");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 size={32} className="animate-spin text-sky-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !item) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-600">{error || "ไม่พบอุปกรณ์"}</p>
            <Link href="/equipment" className="text-sky-500 text-sm hover:underline mt-2 inline-block">← กลับไปหน้าจัดการอุปกรณ์</Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const activeBorrow = item.borrows.find(b => b.status === 'borrowed');
  
  const fields = [
    { icon: Hash, label: "รหัสอ้างอิง", value: item.id.slice(0, 8) },
    { icon: Tag, label: "หมวดหมู่", value: item.category },
    { icon: Shield, label: "สถานะ", value: item.status === 'available' ? 'มีในสต็อก' : 'ถูกยืม/ไม่ว่าง' },
    { icon: MapPin, label: "สถานที่", value: item.location || "—" },
    { icon: Calendar, label: "วันที่เพิ่ม", value: new Date(item.createdAt).toLocaleDateString("th-TH-u-ca-buddhist") },
    { icon: Phone, label: "เบอร์โทรผู้ยืม", value: activeBorrow ? activeBorrow.borrower.phone : "—" },
    { icon: Cpu, label: "รายละเอียด", value: item.description || "—" },
    { icon: User, label: "ผู้ยืมปัจจุบัน", value: activeBorrow ? activeBorrow.borrower.fullName : "—" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-[1000px] mx-auto">
        <Link href="/equipment" className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-4">
          <ArrowLeft size={16} /> กลับไปหน้าจัดการอุปกรณ์
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 animate-fade-in">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={32} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{item.name}</h1>
                  <p className="text-slate-600 whitespace-pre-wrap wrap-break-word">{item.category}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.status === 'available' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-sky-50 text-sky-600 border-sky-200'}`}>
                      {item.status === 'available' ? 'มีในสต็อก' : 'ไม่ว่าง'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      จำนวน: {item.quantity}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((f) => (
                  <div key={f.label} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                    <f.icon size={16} className="text-slate-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">{f.label}</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5 wrap-break-word">{f.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 animate-fade-in">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">การดำเนินการ</h2>
              <div className="space-y-2">
                <button className="w-full py-2.5 px-4 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-600 flex items-center justify-center gap-2">
                  <Edit2 size={14} /> แก้ไขอุปกรณ์
                </button>
                <button className="w-full py-2.5 px-4 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-600">ส่งซ่อมบำรุง</button>
                <button onClick={() => setShowDelete(true)} className="w-full py-2.5 px-4 bg-white dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg text-sm font-medium transition-colors border border-red-200 dark:border-red-900/30 flex items-center justify-center gap-2">
                  <Trash2 size={14} /> ลบอุปกรณ์
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 animate-fade-in">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">ประวัติการยืม</h2>
              {item.borrows.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">ยังไม่มีประวัติการยืม</p>
              ) : (
                <div className="space-y-3">
                  {item.borrows.map((txn) => (
                    <div key={txn.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 dark:border-slate-700 last:border-0">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${txn.status === 'borrowed' ? 'bg-sky-400' : 'bg-green-400'}`} />
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{txn.borrower?.fullName || "ผู้ใช้ทั่วไป"}</p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(txn.borrowDate).toLocaleDateString("th-TH-u-ca-buddhist")} → {txn.returnDate ? new Date(txn.returnDate).toLocaleDateString("th-TH-u-ca-buddhist") : new Date(txn.dueDate).toLocaleDateString("th-TH-u-ca-buddhist")}
                        </p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${txn.status === 'borrowed' ? 'bg-sky-50 border-sky-100 text-sky-600' : 'bg-green-50 border-green-100 text-green-600'} mt-1 inline-block`}>
                          {txn.status === 'borrowed' ? 'กำลังยืม' : 'คืนอุปกรณ์แล้ว'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="แก้ไขอุปกรณ์" size="md">
          <div className="p-6 text-center text-slate-500">
            <p>ฟีเจอร์แก้ไขข้อมูลจะเปิดให้ใช้งานในเร็วๆ นี้</p>
            <button onClick={() => setShowEdit(false)} className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700">ปิด</button>
          </div>
        </Modal>

        <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="ลบอุปกรณ์" size="sm">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">คุณต้องการลบอุปกรณ์นี้หรือไม่</p>
            <p className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">{item.name}</p>
            <p className="text-xs text-slate-400 mb-6">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowDelete(false)} className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">ยกเลิก</button>
              <button onClick={handleDelete} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors">ลบ</button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
