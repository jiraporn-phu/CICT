"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, Package, Upload, Camera, MapPin, Loader2, CheckCircle, AlertCircle, X, Save, Trash2, ChevronDown, Calendar } from "lucide-react";
import { uploadFile, getThaiNowISO } from "@/app/lib/utils";
import { EquipmentItem } from "@/app/lib/types";
import { DEPARTMENTS } from "@/app/lib/constants";
import { CustomDateTimePicker } from "../CustomDateTimePicker";

interface EquipmentFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
  initialData?: EquipmentItem;
  mode?: "create" | "edit";
}

export function EquipmentForm({ onSuccess, onCancel, initialData, mode = "create" }: Readonly<EquipmentFormProps>) {
  const [addForm, setAddForm] = useState({ 
    name: initialData?.name || "", 
    department: initialData?.department || DEPARTMENTS[0],
    category: initialData?.category || "", 
    description: initialData?.description || "", 
    quantity: initialData?.quantity || 1, 
    location: initialData?.location || "",
    createdAt: initialData?.createdAt ? new Date(new Date(initialData.createdAt).getTime() + (7 * 3600000)).toISOString().slice(0, 16) : getThaiNowISO(),
  });
  const [isOtherCategory, setIsOtherCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const [addImage, setAddImage] = useState<File | null>(null);
  const [addPreview, setAddPreview] = useState(initialData?.imageUrl || "");
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState({ type: "", text: "" });

  const [dbCategories, setDbCategories] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/equipment/categories");
        if (res.ok) {
          const data = await res.json();
          setDbCategories(data);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  const handleDeleteCategory = async (e: React.MouseEvent, cat: string) => {
    e.stopPropagation();
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ "${cat}"? \n*อุปกรณ์ทั้งหมดในหมวดหมู่นี้จะถูกเปลี่ยนเป็น "อื่นๆ"`)) return;

    try {
      const res = await fetch("/api/equipment/categories/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat, department: addForm.department }),
      });
      if (res.ok) {
        setAddMsg({ type: "success", text: `ลบหมวดหมู่ "${cat}" สำเร็จ` });
        const catRes = await fetch("/api/equipment/categories");
        if (catRes.ok) {
          const newCats = await catRes.json();
          setDbCategories(newCats);
          if (addForm.category === cat) {
            const nextCategory = (newCats[addForm.department] || []).find((c: string) => c !== "อื่นๆ");
            setAddForm(prev => ({ ...prev, category: nextCategory || "" }));
          }
        }
      } else {
        const d = await res.json();
        throw new Error(d.error || "ลบไม่สำเร็จ");
      }
    } catch (err) {
      setAddMsg({ type: "error", text: err instanceof Error ? err.message : "เกิดข้อผิดพลาด" });
    }
  };

  useEffect(() => {
    if (initialData) {
      setAddForm({
        name: initialData.name,
        department: initialData.department || DEPARTMENTS[0],
        category: initialData.category,
        description: initialData.description || "",
        quantity: initialData.quantity,
        location: initialData.location || "",
        createdAt: initialData.createdAt ? new Date(initialData.createdAt).toLocaleString('en-CA', { timeZone: 'Asia/Bangkok', hour12: false }).replace(', ', 'T').slice(0, 16) : getThaiNowISO(),
      });
      setAddPreview(initialData.imageUrl || "");
      const fromDb = dbCategories[initialData.department || DEPARTMENTS[0]] || [];
      if (!fromDb.includes(initialData.category)) {
        setIsOtherCategory(false);
      }
    }
  }, [initialData, dbCategories]);

  const currentCategoryOptions = (dbCategories[addForm.department] || [])
    .filter((c: string) => c !== "อื่นๆ" && c !== "OTHER")
    .sort((a: string, b: string) => a.localeCompare(b, 'th'));

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddMsg({ type: "", text: "" });
    try {
      let imageUrl = addPreview; 
      if (addImage) {
          imageUrl = await uploadFile(addImage);
      }

      const url = mode === "create" ? "/api/equipment" : `/api/equipment/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const finalCategory = isOtherCategory && customCategory.trim() !== "" ? customCategory.trim() : addForm.category;

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...addForm, category: finalCategory, imageUrl }),
      });
      
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      
      setAddMsg({ type: "success", text: mode === "create" ? "เพิ่มอุปกรณ์สำเร็จ ✅" : "แก้ไขข้อมูลสำเร็จ ✅" });
      
      if (mode === "create") {
         setAddForm({ 
            name: "", 
            department: DEPARTMENTS[0], 
            category: (dbCategories[DEPARTMENTS[0]] || [])[0] || "", 
            description: "", 
            quantity: 1, 
            location: "",
            createdAt: getThaiNowISO(),
         });
         setAddImage(null); setAddPreview("");
         setIsOtherCategory(false);
         setCustomCategory("");
      }
      
      setTimeout(() => {
        onSuccess();
      }, 1000);

    } catch (err: unknown) {
      setAddMsg({ type: "error", text: (err instanceof Error ? err.message : "เกิดข้อผิดพลาด") });
    }
    setAddLoading(false);
  };

  const onAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setAddImage(f); setAddPreview(URL.createObjectURL(f));
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 relative">
      {onCancel && (
        <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X size={20} />
        </button>
      )}
      
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
        {mode === "create" ? <Package size={20} className="text-sky-500" /> : <Save size={20} className="text-blue-500" />}
        {mode === "create" ? "เพิ่มอุปกรณ์ใหม่" : "แก้ไขข้อมูลอุปกรณ์"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">ชื่ออุปกรณ์</label>
            <input id="name" type="text" required value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:text-white" placeholder="เช่น MacBook Pro" />
          </div>
          <div>
             <label htmlFor="department" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-widest">
               แผนก (Department)
             </label>
             <div className="relative">
                <select id="department" value={addForm.department} onChange={e => {
                    const newDept = e.target.value;
                    const newOpts = (dbCategories[newDept] || []).sort((a: string, b: string) => a.localeCompare(b, 'th'));
                    setAddForm({ ...addForm, department: newDept, category: newOpts[0] || "" });
                    setIsOtherCategory(false);
                  }}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none transition-all appearance-none pr-10 cursor-pointer bg-slate-50 dark:bg-slate-900 dark:text-white">
                  {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-white dark:bg-slate-800">{d}</option>)}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                   <ChevronDown size={16} />
                </div>
             </div>
          </div>
        </div>

        <div className="relative group">
           <label htmlFor="category" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">หมวดหมู่</label>
           <div className="flex flex-col gap-2">
             <div className="relative">
                <button 
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="w-full flex items-center justify-between px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:text-white text-sm"
                >
                  <span className={isOtherCategory ? "text-sky-500 font-bold" : ""}>
                    {isOtherCategory ? `อื่นๆ: ${customCategory || "(รอกรอก...)"}` : (addForm.category || "เลือกหมวดหมู่")}
                  </span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCategoryOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="bg-sky-500 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest leading-none">
                      ทุกหมวดหมู่
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {currentCategoryOptions.map(c => {
                        return (
                          <div 
                            key={c}
                            className="group flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            <button 
                              type="button"
                              onClick={() => {
                                setAddForm({ ...addForm, category: c });
                                setIsOtherCategory(false);
                                setIsCategoryOpen(false);
                              }}
                              className="flex-1 text-left text-sm text-slate-700 dark:text-slate-200 outline-none"
                            >
                              <span className={addForm.category === c && !isOtherCategory ? "text-sky-500 font-bold" : ""}>{c}</span>
                            </button>
                            <button 
                              type="button"
                              onClick={(e) => handleDeleteCategory(e, c)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                              title="ลบหมวดหมู่"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                      
                      <button 
                        type="button"
                        onClick={() => {
                          setIsOtherCategory(true);
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 hover:bg-sky-50 dark:hover:bg-sky-900/20 cursor-pointer text-sm font-bold text-sky-500 border-t border-slate-100 dark:border-slate-700 outline-none focus:bg-sky-50 dark:focus:bg-sky-900/20 text-left ${isOtherCategory ? "bg-sky-50 dark:bg-sky-900/30" : ""}`}
                      >
                        <Plus size={16} />
                        สร้างหมวดหมู่ใหม่
                      </button>
                    </div>
                  </div>
                )}
             </div>
             
             {isOtherCategory && (
                <input type="text" value={customCategory} onChange={e => setCustomCategory(e.target.value)} required placeholder="พิมพ์หมวดหมู่ใหม่ที่ต้องการ..."
                  className="w-full px-4 py-2 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-500/30 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:text-white animate-in slide-in-from-top-2" />
             )}
           </div>
        </div>

        <div>
           <label htmlFor="description" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">รายละเอียด / สเปค</label>
           <textarea id="description" rows={3} value={addForm.description} onChange={e => setAddForm({ ...addForm, description: e.target.value })}
             className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:text-white" placeholder="รายละเอียดเพิ่มเติม..." />
        </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <label htmlFor="quantity" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">จำนวนทั้งหมด</label>
               <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setAddForm(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                    className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><Minus size={16} /></button>
                  <input id="quantity" type="number" min="1" value={addForm.quantity} onChange={e => setAddForm({ ...addForm, quantity: Math.max(1, Number.parseInt(e.target.value) || 0) })}
                    className="flex-1 w-full text-center bg-transparent border-none outline-none dark:text-white" />
                  <button type="button" aria-label="Increase quantity" onClick={() => setAddForm(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                    className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><Plus size={16} /></button>
               </div>
            </div>
            <div>
               <label htmlFor="location" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">สถานที่เก็บ</label>
               <div className="relative">
                 <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                 <input id="location" type="text" value={addForm.location} onChange={e => setAddForm({ ...addForm, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:text-white" placeholder="เช่น ชั้น 3 ห้อง server" />
               </div>
            </div>
         </div>

         <div>
            <label htmlFor="createdAt" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">วันที่เพิ่มอุปกรณ์เข้าสู่ระบบ</label>
            <div className="relative">
               <CustomDateTimePicker 
                 value={addForm.createdAt} 
                 onChange={val => setAddForm({ ...addForm, createdAt: val })}
               />
            </div>
         </div>

         <div>
            <label htmlFor="image-upload" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 mr-2">รูปภาพอุปกรณ์  <span className="text-slate-400 font-normal">(อัปโหลดใหม่เพื่อเปลี่ยน)</span></label>
           <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden relative group">
                 {addPreview ? <img src={addPreview} className="w-full h-full object-cover" alt="Preview" /> : <Camera className="text-slate-300" />}
              </div>
              <label className="flex-1 cursor-pointer">
                 <div className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                    <Upload size={18} className="text-slate-400 group-hover:text-sky-500 transition-colors" />
                    <span className="text-sm text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300">คลิกเพื่ออัปโหลดรูป</span>
                 </div>
                 <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={onAddImage} />
               </label>
            </div>
         </div>

         {addMsg.text && (
           <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium border ${addMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/40" : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40"}`}>
             {addMsg.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
             {addMsg.text}
           </div>
         )}

         <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
           {onCancel && (
             <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-all">
               ยกเลิก
             </button>
           )}
           <button type="submit" disabled={addLoading} className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold shadow-lg shadow-sky-200 dark:shadow-sky-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
             {addLoading ? <><Loader2 size={18} className="animate-spin" /> กำลังบันทึก...</> : <><Save size={18} /> {mode === "create" ? "เพิ่มอุปกรณ์" : "บันทึกการแก้ไข"}</>}
           </button>
         </div>
      </form>
    </div>
  );
}