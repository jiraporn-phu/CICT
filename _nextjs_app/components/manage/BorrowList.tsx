"use client";

import { ArrowLeftRight, ImageIcon } from "lucide-react";
import { BorrowTx } from "@/app/lib/types";
import { useState } from "react";
import { BorrowDetailModal } from "../DetailModals";
import { ImageLightbox } from "../ImageLightbox";

interface BorrowListProps {
  borrows: BorrowTx[];
  onReturn: (tx: BorrowTx) => void;
}

export function BorrowList({ borrows, onReturn }: Readonly<BorrowListProps>) {
  const [selectedTx, setSelectedTx] = useState<BorrowTx | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [lightbox, setLightbox] = useState({ isOpen: false, url: '', alt: '' });

  const handleOpenDetail = (tx: BorrowTx) => {
    setSelectedTx(tx);
    setShowDetail(true);
  };

  const handleOpenLightbox = (url: string, alt: string) => {
    setLightbox({ isOpen: true, url, alt });
  };

  if (borrows.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <ArrowLeftRight size={48} className="mx-auto mb-3 opacity-50" />
        <p>ยังไม่มีรายการยืม</p>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-3">
      {borrows.map(tx => (
        <article 
            key={tx.id} 
            className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 hover:border-sky-200 hover:shadow-lg transition-all relative overflow-hidden outline-none focus-within:ring-2 focus-within:ring-sky-500/50 group"
        >
          <button 
              type="button"
              className="absolute inset-0 z-0 bg-transparent border-none w-full h-full cursor-pointer"
              onClick={() => handleOpenDetail(tx)}
              aria-label={`View details for ${tx.equipment.name}`}
          />

          <button 
            type="button"
            className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0 relative z-10 hover:ring-2 hover:ring-sky-500/30 transition-all"
            onClick={(e) => {
                if (tx.equipment.imageUrl) {
                    e.stopPropagation();
                    handleOpenLightbox(tx.equipment.imageUrl, tx.equipment.name);
                } else {
                    handleOpenDetail(tx);
                }
            }}
            aria-label={`View ${tx.equipment.name} image`}
          >
            {tx.equipment.imageUrl ? (
              <img src={tx.equipment.imageUrl} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><ImageIcon size={20} className="text-slate-300" /></div>
            )}
          </button>
          
          <div className="flex-1 min-w-0 relative z-10 pointer-events-none">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{tx.equipment.name}</h4>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="block">จำนวน {tx.borrowQuantity} ชิ้น · ยืมเมื่อ {new Date(tx.borrowDate).toLocaleDateString("th-TH-u-ca-buddhist")}{tx.borrower && (
                <span className="text-slate-600 dark:text-slate-300 font-medium"> · โดย {tx.borrower.fullName} {tx.borrower.department && <span className="text-slate-500 dark:text-slate-400">({tx.borrower.department})</span>}</span>
              )}</span>
            </div>
            <p className="text-xs text-sky-500 mt-0.5 font-medium">กำหนดคืน {new Date(tx.dueDate).toLocaleDateString("th-TH-u-ca-buddhist")}</p>
          </div>

          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onReturn(tx); }}
            className="px-4 py-2 bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm font-bold rounded-xl shadow shadow-green-500/25 transition-all shrink-0 relative z-10 active:scale-95">
            คืนอุปกรณ์
          </button>
        </article>
      ))}
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
    </>
  );
}
