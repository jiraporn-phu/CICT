/* eslint-disable @next/next/no-img-element */
import { Phone, Shield, Users as UsersIcon, Check, Trash2, X, AtSign, Key } from "lucide-react";
import { UserData } from "@/app/lib/types";

const avatarColors = [
  "from-blue-500 to-indigo-500", "from-purple-500 to-violet-500",
  "from-emerald-500 to-teal-500", "from-sky-500 to-sky-500",
  "from-red-500 to-rose-500", "from-cyan-500 to-sky-500",
  "from-pink-500 to-fuchsia-500", "from-sky-500 to-sky-500",
];

interface UserCardProps {
  readonly user: UserData;
  readonly index: number;
  readonly onOpenDetail: (user: UserData) => void;
  readonly onApprove: (id: string) => void;
  readonly onPromote: (id: string, currentRole: string) => void;
  readonly onResetPassword: (id: string) => void;
  readonly onDelete: (id: string) => void;
}

const getStatusBadgeStyles = (status?: string) => {
  if (status === 'active') return 'bg-emerald-100 text-emerald-600';
  if (status === 'pending') return 'bg-sky-100 text-sky-600';
  return 'bg-slate-100 text-slate-500';
};

export default function UserCard({ user, index, onOpenDetail, onApprove, onPromote, onResetPassword, onDelete }: UserCardProps) {
  const isAdmin = user.role === 'admin';
  const roleConfig = isAdmin
    ? { badge: "bg-sky-100 text-sky-700", border: "border-sky-100", label: "ADMIN", Icon: Shield }
    : { badge: "bg-slate-100 text-slate-500", border: "border-slate-100", label: "USER", Icon: UsersIcon };

  return (
    <article
      className={`card p-5 group animate-fade-in hover:-translate-y-0.5 transition-all relative outline-none focus-within:ring-2 focus-within:ring-sky-500/50 ${user.status === 'pending' ? 'ring-2 ring-sky-400 bg-sky-50/30' : `border-l-4 ${isAdmin ? 'border-l-sky-500' : 'border-l-slate-300'}`}`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <button
        type="button"
        className="absolute inset-0 z-0 bg-transparent border-none w-full h-full cursor-pointer"
        onClick={() => onOpenDetail(user)}
        aria-label={`View details for ${user.name}`}
      />

      {user.status === 'pending' && (
        <div className="absolute top-3 left-3 bg-sky-100 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full z-10 pointer-events-none">
          รออนุมัติ
        </div>
      )}

      <div className="absolute top-3 right-3 flex gap-2 z-20">
        {user.status === 'pending' ? (
          <>
            <button onClick={() => onApprove(user.id)} className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:scale-105 transition-transform shadow-sm" title="อนุมัติ">
              <Check size={18} strokeWidth={2.5} />
            </button>
            <button onClick={() => onDelete(user.id)} className="p-2 bg-red-100 text-red-600 rounded-xl hover:scale-105 transition-transform shadow-sm hover:shadow-lg hover:shadow-red-500/30" title="ปฏิเสธ/ลบ">
              <X size={18} strokeWidth={2.5} />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => onPromote(user.id, user.role)} className={`p-2 rounded-xl hover:scale-105 transition-transform shadow-sm ${isAdmin ? 'bg-sky-50 text-sky-600 hover:bg-sky-100' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`} title={isAdmin ? "ลดระดับเป็น User" : "แต่งตั้งเป็น Admin"}>
              <Shield size={18} />
            </button>
            <button onClick={() => onResetPassword(user.id)} className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100 hover:scale-105 transition-transform shadow-sm" title="รีเซ็ตรหัสผ่าน">
              <Key size={18} />
            </button>
            <button onClick={() => onDelete(user.id)} className="p-2 rounded-xl border shadow-sm transition-all duration-200 bg-white border-slate-200 text-red-500 dark:bg-slate-700 dark:border-slate-600 dark:text-red-500 hover:bg-red-50 hover:border-red-500 hover:text-red-600 hover:scale-105 hover:shadow-md hover:shadow-red-500/20 dark:hover:bg-red-900/20 dark:hover:border-red-500/50 dark:hover:text-red-400 group/delete" title="ลบผู้ใช้">
              <Trash2 size={18} className="transition-colors fill-transparent group-hover/delete:fill-red-600" />
            </button>
          </>
        )}
      </div>

      <div className="flex items-start justify-between mb-4 mt-2 relative z-10 pointer-events-none">
        {user.image ? (
          <div className="relative">
            <img src={user.image} alt={user.name} className={`w-12 h-12 rounded-full object-cover border-2 shadow-md ${isAdmin ? 'border-sky-400 ring-4 ring-sky-500/10' : 'border-white dark:border-slate-700'}`} />
            {isAdmin && <div className="absolute -bottom-1 -right-1 bg-sky-500 text-white p-0.5 rounded-full ring-2 ring-white dark:ring-slate-800"><Shield size={10} /></div>}
          </div>
        ) : (
          <div className="relative">
            <div className={`w-12 h-12 rounded-full bg-linear-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-white font-bold text-lg shadow-md border-2 ${isAdmin ? 'border-sky-400 ring-4 ring-sky-500/10' : 'border-white dark:border-slate-700'}`}>
              {user.name.charAt(0)}
            </div>
            {isAdmin && <div className="absolute -bottom-1 -right-1 bg-sky-500 text-white p-0.5 rounded-full ring-2 ring-white dark:ring-slate-800"><Shield size={10} /></div>}
          </div>
        )}
      </div>

      <h3 className={`text-base font-black mb-0.5 relative z-10 pointer-events-none drop-shadow-sm ${isAdmin ? 'text-sky-600 dark:text-sky-400' : 'text-slate-800 dark:text-slate-100'}`}>{user.name}</h3>

      <div className="relative z-10 pointer-events-none flex items-center gap-1.5 mb-3">
        <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg tracking-wider ${roleConfig.badge}`}>
          <roleConfig.Icon size={12} strokeWidth={3} />
          {roleConfig.label}
        </div>
      </div>

      <div className="space-y-2 mb-4 relative z-10 pointer-events-none text-slate-600 dark:text-slate-400">
        <div className={`flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800/50 border ${isAdmin ? 'border-sky-100 dark:border-sky-500/20 bg-sky-50/20' : 'border-slate-100 dark:border-slate-700 bg-slate-50/30'}`}>
          <AtSign size={13} className={isAdmin ? 'text-sky-400' : 'text-slate-400'} />
          <span className="truncate text-xs font-semibold">{user.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex-1 flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800/50 border ${isAdmin ? 'border-sky-100 dark:border-sky-500/20 bg-sky-50/20' : 'border-slate-100 dark:border-slate-700 bg-slate-50/30'}`}>
            <Phone size={13} className={isAdmin ? 'text-sky-400' : 'text-slate-400'} />
            <span className="text-xs font-semibold">{user.phone}</span>
          </div>
          {user.department && user.department !== "General" && (
            <div className="px-3 py-2 rounded-lg bg-purple-50 border border-purple-100 text-xs font-bold text-purple-600">
              {user.department}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 relative z-20">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${getStatusBadgeStyles(user.status)}`}>
          {user.status || 'active'}
        </span>
        <span className={`text-xs font-bold ${user.borrowedCount > 0 ? "text-sky-600 bg-sky-100 px-2 py-1 rounded-full" : "text-slate-400"}`}>
          {user.borrowedCount} ยืม
        </span>
      </div>
    </article>
  );
}
