/* eslint-disable @next/next/no-img-element */
import { SyntheticEvent, useState } from "react";
import { Plus, X } from "lucide-react";

interface CreateUserModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onCreated: () => void;
}

export default function CreateUserModal({ isOpen, onClose, onCreated }: CreateUserModalProps) {
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "", password: "", fullName: "", phone: "", department: "", role: "user"
  });

  const handleCreateUser = async (e: SyntheticEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });

      if (res.ok) {
        alert("สร้างผู้ใช้สำเร็จ! สามารถเข้าสู่ระบบได้ทันที");
        onClose();
        setNewUser({ username: "", password: "", fullName: "", phone: "", department: "", role: "user" });
        onCreated();
      } else {
        const data = await res.json();
        alert(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect");
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 isolate">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      <dialog
        className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 m-0 p-0 border-none"
        open
        aria-modal="true"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">เพิ่มผู้ใช้งานใหม่</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors" type="button">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="username" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Username</label>
              <input id="username" type="text" required className="w-full pl-3 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-all font-medium text-slate-700" placeholder="สำหรับเข้าสู่ระบบ" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <input id="password" type="text" required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-all font-medium text-slate-700" placeholder="รหัสผ่านเริ่มต้น" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="fullName" className="text-xs font-bold text-slate-500 uppercase tracking-wider">ชื่อ-นามสกุล</label>
            <input id="fullName" type="text" required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-all font-medium text-slate-700" placeholder="ชื่อจริง นามสกุลจริง" value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="phone" className="text-xs font-bold text-slate-500 uppercase tracking-wider">เบอร์โทรศัพท์</label>
              <input id="phone" type="tel" required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-all font-medium text-slate-700" placeholder="0XXXXXXXXX" value={newUser.phone} maxLength={10} onChange={e => { const val = e.target.value.replaceAll(/\D/g, ""); if (val.length <= 10) setNewUser({ ...newUser, phone: val }); }} />
            </div>
            <div className="space-y-1">
              <label htmlFor="department" className="text-xs font-bold text-slate-600 uppercase tracking-wider">แผนก</label>
              <input id="department" type="text" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-all font-medium text-slate-700" placeholder="เช่น IT, HR, Sales" value={newUser.department} onChange={e => setNewUser({ ...newUser, department: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">สิทธิ์การใช้งาน</span>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setNewUser({ ...newUser, role: "user" })} className={`relative p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${newUser.role === 'user' ? 'border-sky-500 bg-sky-50/50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${newUser.role === 'user' ? 'border-sky-500' : 'border-slate-300'}`}>
                  {newUser.role === 'user' && <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />}
                </div>
                <div className="text-left">
                  <div className={`font-bold text-sm ${newUser.role === 'user' ? 'text-sky-700' : 'text-slate-700'}`}>User</div>
                  <div className="text-[10px] text-slate-400">ผู้ใช้งานทั่วไป</div>
                </div>
              </button>
              <button type="button" onClick={() => setNewUser({ ...newUser, role: "admin" })} className={`relative p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${newUser.role === 'admin' ? 'border-purple-500 bg-purple-50/50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${newUser.role === 'admin' ? 'border-purple-500' : 'border-slate-300'}`}>
                  {newUser.role === 'admin' && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                </div>
                <div className="text-left">
                  <div className={`font-bold text-sm ${newUser.role === 'admin' ? 'text-purple-700' : 'text-slate-700'}`}>Admin</div>
                  <div className="text-[10px] text-slate-400">ผู้ดูแลระบบ</div>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 mt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-colors">ยกเลิก</button>
            <button type="submit" disabled={creating} className="px-6 py-2.5 text-sm font-bold text-white bg-linear-to-r from-sky-500 to-sky-500 hover:from-sky-600 hover:to-sky-600 rounded-xl shadow-lg shadow-sky-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {creating ? <span className="animate-spin text-xl">⏳</span> : <Plus size={18} strokeWidth={2.5} />}
              {creating ? "กำลังสร้าง..." : "สร้างผู้ใช้ทันที"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
