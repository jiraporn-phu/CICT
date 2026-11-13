"use client";

import { BorrowTx } from "@/app/lib/types";
import { Check, Clock, Calendar, CheckSquare, FileText } from "lucide-react";
import { formatThaiDate } from "@/app/lib/utils";

interface BorrowRequestCardProps {
  transaction: BorrowTx;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onCancel: (id: string) => void;
  isHistory?: boolean;
}

export function BorrowRequestCard({
  transaction,
  isSelected,
  onSelect,
  onCancel,
  isHistory = false,
}: Readonly<BorrowRequestCardProps>) {
  const { equipment, status, borrowDate, dueDate, returnDate, borrowQuantity } = transaction;
  const transactionType = (transaction as any).transactionType;
  const isRequisition = transactionType === "REQUISITION";

  const isPending = status === "pending";
  const isBorrowed = status === "borrowed";
  const thTodayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
  const dueDateStr = new Date(dueDate).toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
  const isOverdue = !isRequisition && (status === "overdue" || (status === "borrowed" && dueDateStr < thTodayStr));

  let badgeColor = "bg-slate-100 text-slate-600";
  let statusText = status;
  
  if (isPending) {
    badgeColor = "bg-sky-100 text-sky-600";
    statusText = "รอดำเนินการ";
  } else if (isBorrowed) {
    badgeColor = "bg-blue-100 text-blue-600";
    statusText = "กำลังยืมอุปกรณ์";
  } else if (status === "returned") {
    badgeColor = "bg-emerald-100 text-emerald-600";
    statusText = "คืนอุปกรณ์แล้ว";
  } else if (isOverdue) {
    badgeColor = "bg-red-100 text-red-600";
    statusText = "เกินกำหนดคืนอุปกรณ์";
  } else if (status === "rejected") {
      badgeColor = "bg-red-100 text-red-600";
      statusText = "ถูกปฏิเสธ";
  } else if (status === "requisitioned") {
      badgeColor = "bg-orange-100 text-orange-600";
      statusText = "เบิกอุปกรณ์แล้ว";
  }

  return (
    <div 
        className={`bg-white rounded-2xl p-4 overflow-hidden transition-all duration-300 group border border-slate-200 ${
            isSelected ? "ring-2 ring-sky-500 bg-sky-50/20 shadow-lg shadow-sky-500/10" : "hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-200 hover:-translate-y-1"
        } ${isHistory ? '' : 'cursor-pointer'}`}
        role={isHistory ? undefined : "button"}
        tabIndex={isHistory ? undefined : 0}
        onClick={() => { if (!isHistory) onSelect(transaction.id); }}
        onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !isHistory) {
                e.preventDefault();
                onSelect(transaction.id);
            }
        }}
    >
      {!isHistory && (
          <div className="absolute top-6 right-6 z-10">
            <button 
                tabIndex={-1}
                className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                    isSelected ? "bg-sky-500 text-white" : "bg-white/80 backdrop-blur-sm border border-slate-300 text-transparent hover:border-sky-400 shadow-sm"
                }`}
            >
                <Check size={14} strokeWidth={3} />
            </button>
          </div>
      )}

      <div className="flex flex-col h-full">
        <div className="aspect-video w-full bg-slate-100 relative rounded-xl overflow-hidden mb-4">
            {equipment.imageUrl ? (
                <img src={equipment.imageUrl} alt={equipment.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                    No Image
                </div>
            )}
            <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold ${badgeColor} backdrop-blur-md border border-white/20 shadow-sm`}>
                {statusText}
            </div>
            {isRequisition && (
                 <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-500 text-white shadow-sm flex items-center gap-1">
                    <FileText size={10} /> เบิกอุปกรณ์
                 </div>
            )}
        </div>

        <div className="flex-1 flex flex-col">
            <h3 className="font-bold text-slate-800 line-clamp-1 mb-1 text-lg group-hover:text-sky-600 transition-colors">{equipment.name}</h3>
            <p className="text-xs text-slate-500 mb-3">{equipment.category} • จำนวน {borrowQuantity} ชิ้น</p>
            
            <div className="mt-auto space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Calendar size={13} className="text-slate-400" />
                    <span>{isRequisition ? "เบิกเมื่อ:" : "ยืมเมื่อ:"} {formatThaiDate(borrowDate)}</span>
                </div>
                {!isHistory && !isRequisition && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Clock size={13} className={`text-slate-400 ${isOverdue ? "text-red-500" : ""}`} />
                        <span className={isOverdue ? "text-red-500 font-medium" : ""}>
                            กำหนดคืน: {formatThaiDate(dueDate)}
                        </span>
                    </div>
                )}
                {isHistory && returnDate && !isRequisition && (
                    <div className="flex items-center gap-2 text-xs text-emerald-600">
                        <CheckSquare size={13} />
                        <span>คืนเมื่อ: {formatThaiDate(returnDate)}</span>
                    </div>
                )}
            </div>

            {isPending && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onCancel(transaction.id);
                    }}
                    className="mt-3 w-full py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50 transition-colors"
                >
                    ยกเลิกคำขอ
                </button>
            )}
        </div>
      </div>
    </div>
  );
}
