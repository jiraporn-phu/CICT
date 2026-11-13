/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import { Search, Plus, Users as UsersIcon, Shield, AtSign } from "lucide-react";
import { UserDetailModal } from "../components/DetailModals";
import { UserData } from "../lib/types";
import CreateUserModal from "../components/users/CreateUserModal";
import UserCard from "../components/users/UserCard";

const STAT_STYLES = {
    blue: {
        active: "ring-2 ring-blue-500 bg-blue-50 dark:!bg-blue-500/10 dark:ring-blue-400",
        iconContainer: "bg-white dark:!bg-blue-500/20 shadow-sm",
        icon: "text-blue-500 dark:text-blue-400",
        value: "text-blue-700 dark:text-blue-400",
        label: "text-blue-600 dark:text-blue-300",
        inactiveIconContainer: "bg-blue-50 dark:bg-blue-500/20",
        inactiveIcon: "text-blue-500 dark:text-blue-400"
    },
    amber: {
        active: "ring-2 ring-sky-500 bg-sky-50 dark:!bg-sky-500/10 dark:ring-sky-400",
        iconContainer: "bg-white dark:!bg-sky-500/20 shadow-sm",
        icon: "text-sky-500 dark:text-sky-400",
        value: "text-sky-700 dark:text-sky-400",
        label: "text-sky-600 dark:text-sky-300",
        inactiveIconContainer: "bg-sky-50 dark:bg-sky-500/20",
        inactiveIcon: "text-sky-500 dark:text-sky-400"
    },
    purple: {
        active: "ring-2 ring-purple-500 bg-purple-50 dark:!bg-purple-500/10 dark:ring-purple-400",
        iconContainer: "bg-white dark:!bg-purple-500/20 shadow-sm",
        icon: "text-purple-500 dark:text-purple-400",
        value: "text-purple-700 dark:text-purple-400",
        label: "text-purple-600 dark:text-purple-300",
        inactiveIconContainer: "bg-purple-50 dark:bg-purple-500/20",
        inactiveIcon: "text-purple-500 dark:text-purple-400"
    },
    emerald: {
        active: "ring-2 ring-emerald-500 bg-emerald-50 dark:!bg-emerald-500/10 dark:ring-emerald-400",
        iconContainer: "bg-white dark:!bg-emerald-500/20 shadow-sm",
        icon: "text-emerald-500 dark:text-emerald-400",
        value: "text-emerald-700 dark:text-emerald-400",
        label: "text-emerald-600 dark:text-emerald-300",
        inactiveIconContainer: "bg-emerald-50 dark:bg-emerald-500/20",
        inactiveIcon: "text-emerald-500 dark:text-emerald-400"
    }
};

interface StatProp {
  label: string;
  value: number;
  color: string;
  action: () => void;
  active: boolean;
}

const StatsCard = ({ stat }: { stat: StatProp }) => {
    const styles = STAT_STYLES[stat.color as keyof typeof STAT_STYLES] || STAT_STYLES.blue;
    const activeClass = stat.active ? styles.active : "hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-md";
    const iconContainerClass = stat.active ? styles.iconContainer : styles.inactiveIconContainer;
    const iconClass = stat.active ? styles.icon : styles.inactiveIcon;
    const valueClass = stat.active ? styles.value : "text-slate-700 dark:text-slate-200";
    const labelClass = stat.active ? styles.label : "text-slate-400";

    return (
        <button key={stat.label} onClick={stat.action} className={`card p-4 flex items-center gap-3 animate-fade-in transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-left w-full ${activeClass}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconContainerClass}`}>
            <UsersIcon size={18} className={iconClass} />
          </div>
          <div>
            <p className={`text-xl font-bold ${valueClass}`}>{stat.value}</p>
            <p className={`text-[11px] font-medium ${labelClass}`}>{stat.label}</p>
          </div>
        </button>
    );
};

function UsersContent() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "active" | "department">("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["all", "pending", "active", "department"].includes(tab)) {
      setActiveTab(tab as "all" | "pending" | "active" | "department");
    }
  }, [searchParams]);

  const handleApprove = async (id: string) => {
    if (!confirm("ยืนยันอนุญาตให้ผู้ใช้นี้เข้าใช้งาน?")) return;
    try {
      const res = await fetch("/api/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "active" }) });
      if (res.ok) fetchUsers();
    } catch (e) { console.error(e); }
  };

  const handlePromote = async (id: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const msg = newRole === "admin" ? "แต่งตั้งเป็นผู้ดูแลระบบ (Admin)?" : "ลดระดับเป็นผู้ใช้ทั่วไป?";
    if (!confirm(`ยืนยัน${msg}`)) return;
    try {
      const res = await fetch("/api/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, role: newRole }) });
      if (res.ok) fetchUsers();
    } catch (e) { console.error(e); }
  };

  const handleResetPassword = async (userId: string) => {
    const newPassword = window.prompt("กรุณาระบุรหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร):");
    if (!newPassword) return;
    if (newPassword.length < 8) { alert("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"); return; }
    if (!window.confirm(`ยืนยันการเปลี่ยนรหัสผ่านสำหรับผู้ใช้นี้?`)) return;
    try {
      const resp = await fetch("/api/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: userId, password: newPassword }) });
      if (resp.ok) { alert("เปลี่ยนรหัสผ่านสำเร็จแล้ว!"); }
      else { const errorData = await resp.json(); alert(`เกิดข้อผิดพลาด: ${errorData.error || "ไม่สามารถเปลี่ยนรหัสผ่านได้"}`); }
    } catch (err) { console.error("Reset password error:", err); alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ยืนยันลบผู้ใช้งานนี้? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchUsers();
      } else {
        const errorData = await res.json();
        alert(`เกิดข้อผิดพลาด: ${errorData.error || "ไม่สามารถลบผู้ใช้งานได้"}`);
      }
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  const departments = [...new Set(users.map((u) => u.department).filter(d => d && d !== "General"))];
  const pendingCount = users.filter(u => u.status === "pending").length;
  const activeCount = users.filter(u => u.status !== 'pending').length;

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.department?.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === "pending") return u.status === "pending" && matchesSearch;
    if (activeTab === "active") return u.status !== "pending" && matchesSearch;
    if (activeTab === "department") return u.department && u.department !== "General" && matchesSearch;
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">ผู้ใช้งาน / พนักงาน</h1>
            <p className="text-sm text-slate-400 mt-0.5">จัดการพนักงานและการ ยืม-เบิก อุปกรณ์</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
            <Plus size={16} /> เพิ่มผู้ใช้งานใหม่
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "ผู้ใช้ทั้งหมด", value: users.length, color: "blue", action: () => setActiveTab("all"), active: activeTab === "all" },
            { label: "รออนุมัติ", value: pendingCount, color: "amber", action: () => setActiveTab("pending"), active: activeTab === "pending" },
            { label: "แผนก", value: departments.length, color: "purple", action: () => setActiveTab("department"), active: activeTab === "department" },
            { label: "Active", value: activeCount, color: "emerald", action: () => setActiveTab("active"), active: activeTab === "active" },
          ].map((s) => <StatsCard key={s.label} stat={s} />)}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-sky-500/30 focus-within:border-sky-500 transition-all">
            <Search size={16} className="text-sky-500" />
            <input type="text" placeholder="ค้นหาตามชื่อ, อีเมล, แผนก..." className="bg-transparent outline-none text-sm w-full text-slate-700 placeholder:text-slate-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/50">
            {[
              { id: "all", label: "แสดงทั้งหมด", icon: UsersIcon },
              { id: "admin", label: "Admin", icon: Shield },
              { id: "user", label: "User", icon: AtSign }
            ].map((role) => (
              <button key={role.id} onClick={() => setRoleFilter(role.id as any)} className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${roleFilter === role.id ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
                <role.icon size={14} />{role.label}
              </button>
            ))}
          </div>
        </div>

        {loading && <div className="text-center py-10 text-slate-400">กำลังโหลด...</div>}
        {!loading && filteredUsers.length === 0 && <div className="text-center py-10 text-slate-400">ไม่พบข้อมูล</div>}
        {!loading && filteredUsers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredUsers.map((user, i) => (
              <UserCard key={user.id} user={user} index={i} onOpenDetail={(u) => { setSelectedUser(u); setShowDetail(true); }} onApprove={handleApprove} onPromote={handlePromote} onResetPassword={handleResetPassword} onDelete={handleDelete} />
            ))}
          </div>
        )}

        <UserDetailModal isOpen={showDetail} onClose={() => setShowDetail(false)} user={selectedUser} />
      </div>

      <CreateUserModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreated={fetchUsers} />
    </DashboardLayout>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading...</div>}>
      <UsersContent />
    </Suspense>
  );
}
