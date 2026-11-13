"use client";

import React from 'react';
import Modal from "./Modal";
import { EquipmentItem, UserData, BorrowTx } from "@/app/lib/types";
import { 
  Package, MapPin, AtSign, 
  Calendar, Phone, 
  Tag, Info,
  ArrowRightLeft, FileText
} from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import { StatusBadge } from "./StatusBadge";
import { APP_CONFIG } from "@/app/lib/constants";
import { formatThaiDate } from "@/app/lib/utils";
import { useRouter } from 'next/navigation';

export function EquipmentDetailModal({ 
  isOpen, 
  onClose, 
  equipment, 
  onImageClick, 
  onBorrow,
  onRequisition,
  userRole
}: Readonly<{
  isOpen: boolean;
  onClose: () => void;
  equipment: EquipmentItem | null;
  onImageClick?: (url: string) => void;
  onBorrow?: (equipment: EquipmentItem) => void;
  onRequisition?: (equipment: EquipmentItem) => void;
  userRole?: string;
}>) {
  if (!equipment) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="รายละเอียดอุปกรณ์" size="lg">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-5/12">
          <button 
            type="button"
            className="w-full aspect-square rounded-2xl bg-slate-100 dark:bg-slate-700 overflow-hidden relative cursor-zoom-in group shadow-inner border-none outline-none focus:ring-2 focus:ring-sky-500/50"
            onClick={() => equipment.imageUrl && onImageClick?.(equipment.imageUrl)}
            aria-label={`View ${equipment.name} image`}
          >
            {equipment.imageUrl ? (
              <img 
                src={equipment.imageUrl} 
                alt={equipment.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <Package size={64} className="mb-2 opacity-20" />
                <span className="text-sm font-medium">ไม่มีรูปภาพ</span>
              </div>
            )}
            {equipment.imageUrl && (
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                 <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xl">
                    คลิกเพื่อซูม
                 </div>
              </div>
            )}
          </button>
          
          <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">สถานะ</p>
                {equipment.availableQuantity === 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full font-bold border bg-red-100 text-red-700 border-red-200 px-2 py-0.5 text-[10px] shadow-sm whitespace-nowrap">
                        หมดสต็อก
                    </span>
                ) : (
                    <StatusBadge status={equipment.status} showIcon />
                )}
              </div>
             <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">คงเหลือ</p>
                <div className="flex items-baseline gap-1">
                   <span className={`text-lg font-black ${equipment.availableQuantity === 0 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{equipment.availableQuantity}</span>
                   <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">/ {equipment.quantity} ชิ้น</span>
                </div>
             </div>
          </div>
        </div>

        <div className="w-full md:w-7/12 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-sky-100 text-sky-600 text-[10px] font-black rounded uppercase tracking-widest">
                {equipment.category}
              </span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black rounded uppercase tracking-widest">
                ID: {equipment.id.slice(0, 8)}
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-2">
              {equipment.name}
            </h3>
            {equipment.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 italic">
                "{equipment.description}"
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                <Package size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">จำนวนทั้งหมด</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{equipment.quantity} ชิ้น</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center shrink-0">
                <MapPin size={16} className="text-purple-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">ที่จัดเก็บ / สถานที่</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{equipment.location || APP_CONFIG.defaultLocation}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Info size={16} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">หมายเหตุเพิ่มเติม</p>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {equipment.condition || (equipment.availableQuantity > 0 ? 'อุปกรณ์อยู่ในสภาพดี พร้อมสำหรับการเบิกใช้งาน' : 'อุปกรณ์ถูกยืมเต็มจำนวน หรืออยู่ในระหว่างการซ่อมบำรุง')}
                </p>
              </div>
            </div>

            {userRole === 'admin' && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Calendar size={16} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">วันที่เพิ่มเข้าสู่ระบบ</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatThaiDate(equipment.createdAt)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
             <button 
               onClick={() => onBorrow?.(equipment)}
               disabled={equipment.availableQuantity <= 0 || equipment.status === 'maintenance'}
               className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-black shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
             >
               <ArrowRightLeft size={18} /> ยืมอุปกรณ์
             </button>
             <button 
               onClick={() => onRequisition?.(equipment)}
               disabled={equipment.availableQuantity <= 0 || equipment.status === 'maintenance'}
               className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
             >
               <FileText size={18} /> เบิกอุปกรณ์
             </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function UserDetailModal({ 
  isOpen, 
  onClose, 
  user 
}: Readonly<{
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
}>) {
  const router = useRouter();
  const [history, setHistory] = React.useState<BorrowTx[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && user?.id) {
      setLoading(true);
      fetch(`/api/borrow?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setHistory(data.slice(0, 10)); // Show only top 10 recent
          }
        })
        .catch(err => console.error("Failed to fetch user history", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, user?.id]);

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ข้อมูลผู้ใช้งาน" size="md">
      <div className="flex flex-col items-center mb-6">
         <UserAvatar image={user.image} name={user.name} size="lg" className="mb-4" />
         <h3 className="text-xl font-black text-slate-900 dark:text-white">{user.name}</h3>
         <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{user.role}</p>
      </div>

      <div className="space-y-4">
         <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700">
               <div className="flex items-center gap-2 mb-1 text-sky-500">
                  <AtSign size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Username / Email</span>
               </div>
               <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user.username || user.email}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700">
               <div className="flex items-center gap-2 mb-1 text-blue-500">
                  <Phone size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">เบอร์โทรศัพท์</span>
               </div>
               <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.phone || 'N/A'}</p>
            </div>
         </div>

         <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-1 text-purple-600 dark:text-purple-400">
               <Tag size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">แผนก</span>
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.department || APP_CONFIG.defaultDepartment}</p>
         </div>

         <div className="p-4 bg-sky-50 dark:bg-sky-900/10 rounded-2xl border border-sky-100 dark:border-sky-900/30">
            <div className="flex items-center justify-between mb-4">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-sky-600">สถิติการใช้งาน</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">ประวัติการยืมอุปกรณ์</p>
               </div>
               <div className="text-right">
                  <p className="text-2xl font-black text-sky-600">{user.borrowedCount || 0}</p>
                  <p className="text-[10px] font-bold text-sky-400">รายการ</p>
               </div>
            </div>

            <div className="space-y-2 mt-4 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
               {loading ? (
                  <div className="text-center py-4 text-xs text-slate-400 animate-pulse">กำลังโหลดประวัติ...</div>
               ) : history.length > 0 ? (
                  history.map((tx) => (
                     <div key={tx.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-sky-100 dark:border-sky-800/50 flex items-center justify-between gap-3 group">
                        <div className="flex items-center gap-3 overflow-hidden">
                           <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center shrink-0">
                              {tx.equipment.imageUrl ? (
                                 <img src={tx.equipment.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                 <Package size={14} className="text-slate-300" />
                              )}
                           </div>
                           <div className="overflow-hidden">
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{tx.equipment.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                 <span className={`text-[9px] font-black px-1 rounded uppercase ${tx.transactionType === 'REQUISITION' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {tx.transactionType === 'REQUISITION' ? 'เบิก' : 'ยืม'}
                                 </span>
                                 <span className="text-[9px] text-slate-400 font-bold">{formatThaiDate(tx.borrowDate)}</span>
                              </div>
                           </div>
                        </div>
                        <div className="text-right shrink-0">
                           <p className="text-[10px] font-black text-slate-700 dark:text-slate-300">x{tx.borrowQuantity}</p>
                           <StatusBadge status={tx.status} size="sm" />
                        </div>
                     </div>
                  ))
               ) : (
                  <div className="text-center py-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                     <p className="text-xs text-slate-400 font-medium italic">ไม่พบประวัติการใช้งาน</p>
                  </div>
               )}
            </div>

            {history.length > 0 && (
               <button 
                  onClick={() => router.push(`/borrow?userId=${user.id}`)}
                  className="w-full mt-4 py-2 text-[11px] font-black text-sky-600 bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-xl border border-sky-100 dark:border-sky-800 transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
               >
                  ดูประวัติทั้งหมด <ArrowRightLeft size={12} />
               </button>
            )}
         </div>
      </div>
    </Modal>
  );
}

export function BorrowDetailModal({ 
  isOpen, 
  onClose, 
  tx 
}: Readonly<{
  isOpen: boolean;
  onClose: () => void;
  tx: BorrowTx | null;
}>) {
  if (!tx) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="รายละเอียดการ ยืม-เบิก อุปกรณ์" size="md">
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white dark:bg-slate-700">
            {tx.equipment.imageUrl ? (
              <img src={tx.equipment.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-500">
                <Package size={24} />
              </div>
            )}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{tx.equipment.name}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase font-bold tracking-widest">{tx.equipment.category} · {tx.borrowQuantity} ชิ้น</p>
          </div>
        </div>

        {tx.borrower && (
          <div className="space-y-3">
             <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">ผู้ทำรายการ</p>
              <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                <UserAvatar image={tx.borrower.image} name={tx.borrower.fullName} size="sm" />
                <div>
                   <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{tx.borrower.fullName}</p>
                   <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">{tx.borrower.department || APP_CONFIG.defaultDepartment}</p>
                </div>
              </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700">
            <div className="space-y-1">
               <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                   <Calendar size={12} />
                   <span className="text-[10px] font-black uppercase tracking-widest">ยืมเมื่อ</span>
               </div>
               <p className="text-sm font-black text-slate-800 dark:text-slate-200">
                  {formatThaiDate(tx.borrowDate)}
               </p>
            </div>
            <div className="space-y-1">
               <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                   <Calendar size={12} />
                   <span className="text-[10px] font-black uppercase tracking-widest">กำหนดคืน</span>
               </div>
               <p className="text-sm font-black text-slate-800 dark:text-slate-200">
                  {formatThaiDate(tx.dueDate)}
               </p>
            </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">สถานะปัจจุบัน</span>
              <StatusBadge status={tx.status} size="md" showIcon />
           </div>
        </div>
      </div>
    </Modal>
  );
}
