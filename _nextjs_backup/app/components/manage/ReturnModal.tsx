"use client";

import { useState } from "react";
import { X, Camera, MapPin, Loader2, CheckCircle } from "lucide-react";
import { uploadFile } from "@/app/lib/utils";
import { BorrowTx } from "@/app/lib/types";

interface ReturnModalProps {
  transaction: BorrowTx | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReturnModal({ transaction, onClose, onSuccess }: Readonly<ReturnModalProps>) {
  const [returnImage, setReturnImage] = useState<File | null>(null);
  const [returnPreview, setReturnPreview] = useState("");
  const [returnLocation, setReturnLocation] = useState("");
  const [returnNote, setReturnNote] = useState("");
  const [returnLoading, setReturnLoading] = useState(false);

  if (!transaction) return null;

  const handleReturn = async () => {
    setReturnLoading(true);
    try {
      let afterImageUrl = "";
      if (returnImage) afterImageUrl = await uploadFile(returnImage);
      const res = await fetch("/api/borrow/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: transaction.id, afterImageUrl, returnLocation, note: returnNote,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "คืนล้มเหลว");
    }
    setReturnLoading(false);
  };

  const onReturnImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setReturnImage(f); setReturnPreview(URL.createObjectURL(f));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">คืนอุปกรณ์</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"><X size={20} /></button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3">
          <p className="font-semibold text-sm">{transaction.equipment.name}</p>
          <p className="text-xs text-slate-400">จำนวน {transaction.borrowQuantity} ชิ้น</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
            <Camera size={14} className="inline mr-1" /> รูปสภาพอุปกรณ์หลังคืน
          </label>
          <label htmlFor="return-img" className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50/50 transition-all">
            {returnPreview ? (
              <img src={returnPreview} alt="preview" className="max-h-32 rounded-lg object-contain" />
            ) : (
              <>
                <Camera size={24} className="text-slate-400" />
                <span className="text-xs text-slate-400">คลิกเพื่ออัปโหลดรูป</span>
              </>
            )}
            <input id="return-img" type="file" accept="image/*" className="hidden" onChange={onReturnImage} />
          </label>
        </div>
        <div>
          <label htmlFor="return-loc" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
            <MapPin size={14} className="inline mr-1" /> จุดคืนอุปกรณ์
          </label>
          <input id="return-loc" type="text" value={returnLocation} onChange={e => setReturnLocation(e.target.value)}
            placeholder="เช่น ห้อง IT ชั้น 2"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400" />
        </div>

        <div>
          <label htmlFor="return-note" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">หมายเหตุ</label>
          <textarea id="return-note" rows={2} value={returnNote} onChange={e => setReturnNote(e.target.value)}
            placeholder="เช่น สภาพปกติ ไม่มีความเสียหาย"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400" />
        </div>

        <button onClick={handleReturn} disabled={returnLoading}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
          {returnLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
          {returnLoading ? "กำลังดำเนินการ..." : "ยืนยันคืน"}
        </button>
      </div>
    </div>
  );
}
