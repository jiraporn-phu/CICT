import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Home,
  LayoutDashboard,
  Monitor,
  ArrowRightLeft,
  Users,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelRightClose,
  ShoppingBag,
} from "lucide-react";
import type { SidebarSide } from "./DashboardLayout";
import { APP_CONFIG } from "@/app/lib/constants";

const menuItems = [
  { label: "หน้าหลัก", href: "/", icon: Home },
  { label: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard },
  { label: "สถานะการยืม-เบิกอุปกรณ์", href: "/borrow", icon: ArrowRightLeft },
  { label: "จัดการอุปกรณ์", href: "/equipment", icon: Monitor },
  { label: "รายการของฉัน", href: "/my-requests", icon: ShoppingBag },
  { label: "ผู้ใช้งาน", href: "/users", icon: Users },
];

interface SidebarProps {
  readonly collapsed: boolean;
  readonly setCollapsed: (v: boolean) => void;
  readonly side: SidebarSide;
  readonly setSide: (v: SidebarSide) => void;
  readonly isMobile?: boolean;
  readonly mobileOpen?: boolean;
  readonly setMobileOpen?: (v: boolean) => void;
}

export default function Sidebar({ 
  collapsed, 
  setCollapsed, 
  side, 
  setSide,
  isMobile = false,
  mobileOpen = false,
  setMobileOpen
}: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const rawRole = session?.user?.role || "user";
  const userRole = rawRole.toUpperCase();
  const isAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN";

  useEffect(() => {
    if (isMobile && setMobileOpen) {
      setMobileOpen(false);
    }
  }, [pathname, isMobile, setMobileOpen]);

  const positionStyle = side === "left"
    ? { left: isMobile ? (mobileOpen ? 0 : "-260px") : 0 }
    : { right: isMobile ? (mobileOpen ? 0 : "-260px") : 0 };
    
  let CollapseIcon;
  if (collapsed) {
      CollapseIcon = side === "left" ? ChevronRight : ChevronLeft;
  } else {
      CollapseIcon = side === "left" ? ChevronLeft : ChevronRight;
  }

  return (
    <aside
      className={`fixed top-0 z-50 h-screen transition-all duration-300 shadow-xl lg:shadow-none ${
        isMobile ? "w-[260px]" : (collapsed ? "w-[72px]" : "w-[260px]")
      }`}
      style={{ background: "var(--sidebar-bg)", ...positionStyle }}
    >
      <Link href="/" className={`flex items-center gap-3 h-16 border-b border-white/10 cursor-pointer ${collapsed && !isMobile ? "px-4 justify-center" : "px-5"}`}>
        <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 overflow-hidden bg-white/10 p-1">
          <img src="/logo_ictc.png" alt="ICTC Logo" className="w-full h-full object-contain" />
        </div>
        {(!collapsed || isMobile) && (
          <span className="text-white font-bold text-lg tracking-tight whitespace-nowrap">
            {APP_CONFIG.orgName}
          </span>
        )}
      </Link>

      <nav className="mt-4 px-3 flex flex-col gap-1">
        {(!collapsed || isMobile) && (
          <span className="text-[11px] uppercase tracking-wider text-[#64748b] font-semibold px-3 mb-2">
            เมนูหลัก
          </span>
        )}
        {menuItems.map((item) => {
          if (!isAdmin) {
             if (["/dashboard", "/equipment", "/borrow", "/users"].includes(item.href)) {
               return null;
             }
          }

          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                collapsed && !isMobile ? "justify-center" : ""
              } ${
                isActive
                  ? "bg-sky-500/15 text-sky-400"
                  : "text-[#94a3b8] hover:bg-white/5 hover:text-[#e2e8f0]"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                size={20}
                className={`shrink-0 transition-colors ${
                  isActive ? "text-sky-400" : "text-[#64748b] group-hover:text-[#cbd5e1]"
                }`}
              />
              {(!collapsed || isMobile) && <span>{item.label}</span>}
              {isActive && (!collapsed || isMobile) && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400" />
              )}
            </Link>
          );
        })}

      </nav>

      <div className="px-3 mt-1 flex flex-col gap-1 pb-4">
        <div className="mb-2 border-t border-white/10" />

        <button
          onClick={() => setSide(side === "left" ? "right" : "left")}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer text-[#94a3b8] hover:bg-white/5 hover:text-[#e2e8f0] ${collapsed && !isMobile ? "justify-center" : ""}`}
          title={side === "left" ? "ย้าย Sidebar ไปขวา" : "ย้าย Sidebar ไปซ้าย"}
        >
          {side === "left" ? <PanelRightClose size={20} className="shrink-0 text-[#64748b]" /> : <PanelLeftClose size={20} className="shrink-0 text-[#64748b]" />}
          {(!collapsed || isMobile) && (
            <span>ย้ายฝั่งเมนู</span>
          )}
        </button>

        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer text-[#94a3b8] hover:bg-white/5 hover:text-[#e2e8f0] ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "ขยาย Sidebar" : "ย่อ Sidebar"}
          >
            <CollapseIcon size={20} className="shrink-0 text-[#64748b]" />
            {!collapsed && <span>ย่อเมนู</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
