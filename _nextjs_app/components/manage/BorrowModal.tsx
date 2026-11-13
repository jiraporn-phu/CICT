"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, User, Phone, Minus, Plus, Calendar, MapPin, Loader2, ArrowLeftRight, CheckCircle, FileText } from "lucide-react";
import { EquipmentItem } from "@/app/lib/types";
import { APP_CONFIG } from "@/app/lib/constants";
import { getThaiNowDate } from "@/app/lib/utils";
import { CustomDatePicker } from "../CustomDatePicker";

interface BorrowModalProps {
  item: EquipmentItem | null;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  userName: string;
  userPhone: string;
  mode?: "borrow" | "requisition";
}

export function BorrowModal({ item, onClose, onSuccess, userId, userName, userPhone, mode = "borrow" }: Readonly<BorrowModalProps>) {
  const isRequisition = mode === "requisition";
  const [borrowQty, setBorrowQty] = useState(1);
  const [borrowDue, setBorrowDue] = useState("");
  const [borrowPickup, setBorrowPickup] = useState(item?.location || APP_CONFIG.defaultLocation);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const [borrowerName, setBorrowerName] = useState(userName);
  const [borrowerPhone, setBorrowerPhone] = useState(userPhone);

  if (!item) return null;

  const handleBorrow = async () => {
    setBorrowLoading(true);
    try {
      const res = await fetch("/api/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentId: item.id, borrowerId: userId,
          borrowQuantity: borrowQty, dueDate: borrowDue, pickupLocation: borrowPickup,
          contactName: borrowerName,
          contactPhone: borrowerPhone,
          transactionType: isRequisition ? "REQUISITION" : "BORROW"
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setIsSuccess(true);
      onSuccess();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "ยืมอุปกรณ์ล้มเหลว");
    }
    setBorrowLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 cursor-default relative z-10" 
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{isRequisition ? "เบิกอุปกรณ์" : "ยืมอุปกรณ์"}</h3>
          {!isSuccess && <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"><X size={20} /></button>}
        </div>

        {isSuccess ? (
          <div className="py-6 flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={48} />
            </div>
            <div className="space-y-2">
                <h4 className="text-xl font-black text-slate-800 dark:text-white">ส่งคำขอ{isRequisition ? "เบิก" : "ยืม"}เรียบร้อยแล้ว!</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed px-4">
                  คำขอ{isRequisition ? "เบิก" : "ยืม"}ของคุณถูกส่งไปยังระบบแล้ว <br />
                  <span className="font-bold text-sky-600 dark:text-sky-400">กรุณารอ Admin อนุมัติคำขอ{isRequisition ? "เบิก" : "ยืม"}อุปกรณ์</span> <br />
                  คุณสามารถติดตามสถานะได้ในหน้ารายการของฉัน
                </p>
            </div>
            <div className="w-full flex flex-col gap-3 pt-4">
                <button 
                  onClick={() => {
                    router.push("/my-requests");
                    onClose();
                  }}
                  className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-200 transition-all flex items-center justify-center gap-2"
                >
                  ไปที่รายการของฉัน
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-all"
                >
                  กลับหน้าหลัก
                </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3 flex gap-3 items-center border border-slate-100 dark:border-slate-600">
                 {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-white shadow-sm" />
                 )}
                <div>
                  <h4 className="font-bold text-lg text-slate-800 dark:text-white">{item.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                     <span className="bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded textxs font-semibold">{item.category}</span>
                     <span>•</span>
                     <span className="font-medium">คงเหลือ <span className="text-emerald-600 dark:text-emerald-400 font-bold text-base">{item.availableQuantity}</span> ชิ้น</span>
                  </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="borrowerName" className="text-xs text-slate-500 ml-1">ชื่อผู้ยืม</label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl px-3 py-2.5 text-sm border border-slate-100 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <User size={14} className="text-blue-500 shrink-0" />
                    <input 
                        id="borrowerName"
                        value={borrowerName} 
                        onChange={e => {
                          const val = e.target.value.replaceAll(/[^a-zA-Z\u0E00-\u0E7F\s]/g, "");
                          setBorrowerName(val);
                        }}
                        className="bg-transparent outline-none w-full text-slate-700 placeholder:text-slate-400"
                        placeholder="ชื่อผู้ยืม"
                    />
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="borrowerPhone" className="text-xs text-slate-500 ml-1">เบอร์โทร</label>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl px-3 py-2.5 text-sm border border-slate-100 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <Phone size={14} className="text-blue-500 shrink-0" />
                    <input 
                        id="borrowerPhone"
                        type="tel"
                        value={borrowerPhone} 
                        onChange={e => {
                          const val = e.target.value.replaceAll(/\D/g, "");
                          if (val.length <= 10) setBorrowerPhone(val);
                        }}
                        maxLength={10}
                        className="bg-transparent outline-none w-full text-slate-700 placeholder:text-slate-400"
                        placeholder="0XXXXXXXXX"
                    />
                </div>
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">จำนวนที่ต้องการ{isRequisition ? "เบิก" : "ยืม"}</span>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setBorrowQty(Math.max(1, borrowQty - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"><Minus size={16} /></button>
                <span className="text-lg font-bold w-12 text-center">{borrowQty}</span>
                <button type="button" onClick={() => setBorrowQty(Math.min(item.availableQuantity, borrowQty + 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"><Plus size={16} /></button>
              </div>
            </div>

            <div className="relative">
              <label htmlFor="borrow-due" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                {isRequisition ? <FileText size={14} className="inline mr-1" /> : <Calendar size={14} className="inline mr-1" />} {isRequisition ? "กำหนดการรับอุปกรณ์" : "กำหนดคืน"} *
              </label>
              <div className="relative">
                <CustomDatePicker 
                    value={borrowDue} 
                    onChange={setBorrowDue}
                    min={getThaiNowDate()}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })}
                    className={`w-full ${
                      borrowDue && borrowDue < getThaiNowDate()
                      ? 'border-red-500 bg-red-50/50 text-red-700 font-bold' 
                      : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700'
                    }`}
                />
              </div>
              {borrowDue && borrowDue < getThaiNowDate() && (
                <p className="text-[10px] text-red-500 mt-1 font-bold">⚠️ วันที่เลือกต้องไม่เป็นอดีต</p>
              )}
              <p className="text-[10px] text-slate-400 mt-1">* {isRequisition ? "เลือกวันที่สะดวกรับอุปกรณ์" : "กำหนดคืนได้สูงสุด 1 ปีล่วงหน้า"}</p>
            </div>

            <div>
              <label htmlFor="borrow-pickup" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                <MapPin size={14} className="inline mr-1" /> จุดรับอุปกรณ์ *
              </label>
              <input 
                id="borrow-pickup" 
                type="text" 
                required
                value={borrowPickup} 
                onChange={e => setBorrowPickup(e.target.value)}
                placeholder="เช่น ห้อง IT ชั้น 2"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400" 
              />
            </div>

            <button 
              onClick={handleBorrow} 
              className={`w-full py-3 ${isRequisition ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/25' : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/25'} text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]`}>
              {borrowLoading ? <Loader2 size={18} className="animate-spin" /> : (isRequisition ? <FileText size={18} /> : <ArrowLeftRight size={18} />)}
              {borrowLoading ? "กำลังดำเนินการ..." : `ยืนยันการ${isRequisition ? "เบิก" : "ยืม"}อุปกรณ์`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
