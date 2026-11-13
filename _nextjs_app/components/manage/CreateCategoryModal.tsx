"use client";

import { useState } from "react";
import { FolderPlus, Plus, X } from "lucide-react";
import { DEPARTMENTS } from "@/app/lib/constants";

interface CreateCategoryModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onCreated: () => void;
}

export default function CreateCategoryModal({ isOpen, onClose, onCreated }: CreateCategoryModalProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDept, setNewCategoryDept] = useState(DEPARTMENTS[0]);
  const [categoryMsg, setCategoryMsg] = useState({ type: "", text: "" });

  const handleClose = () => {
    onClose();
    setCategoryMsg({ type: "", text: "" });
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setCategoryMsg({ type: "error", text: "กรุณากรอกชื่อหมวดหมู่" });
      return;
    }
    try {
      const res = await fetch("/api/equipment/categories/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim(), department: newCategoryDept }),
      });
      const data = await res.json();
      if (res.ok) {
        setCategoryMsg({ type: "success", text: `สร้างหมวดหมู่ "${newCategoryName.trim()}" สำเร็จ!` });
        setNewCategoryName("");
        onCreated();
        setTimeout(() => { handleClose(); }, 1500);
      } else {
        setCategoryMsg({ type: "error", text: data.error || "สร้างไม่สำเร็จ" });
      }
    } catch {
      setCategoryMsg({ type: "error", text: "เกิดข้อผิดพลาด" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FolderPlus className="text-sky-500" size={20} /> สร้างหมวดหมู่ใหม่
          </h2>
          <button onClick={handleClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="newCatDept" className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-widest">แผนก (Department)</label>
            <select id="newCatDept" value={newCategoryDept} onChange={e => setNewCategoryDept(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500/50 dark:bg-slate-900 dark:text-white">
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="newCatName" className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-widest">ชื่อหมวดหมู่</label>
            <input id="newCatName" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCreateCategory()} placeholder="เช่น อุปกรณ์เสียง" className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500/50 dark:bg-slate-900 dark:text-white" autoFocus />
          </div>
        </div>

        {categoryMsg.text && (
          <div className={`text-sm font-medium px-3 py-2 rounded-lg ${categoryMsg.type === "success" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"}`}>
            {categoryMsg.text}
          </div>
        )}

        <button onClick={handleCreateCategory} className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2">
          <Plus size={18} /> สร้างหมวดหมู่
        </button>
      </div>
    </div>
  );
}
