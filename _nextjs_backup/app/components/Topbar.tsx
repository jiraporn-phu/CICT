"use client";

import { Search, ChevronDown, Moon, Sun, Menu } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { UserAvatar } from "./UserAvatar";
import type { SidebarSide } from "./DashboardLayout";
import { useTheme } from "./ThemeProvider";

interface TopbarProps {
  readonly side: SidebarSide;
  readonly sidebarWidth: string;
  readonly toggleMobileMenu?: () => void;
}

export default function Topbar({ side, sidebarWidth, toggleMobileMenu }: TopbarProps) {
  const { data: session } = useSession();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<{ image?: string | null } | null>(null);

  useEffect(() => {
    fetch("/api/users/myprofile")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setUserProfile(data);
        }
      })
      .catch((err) => console.error("Failed to fetch profile in topbar", err));
  }, [session, pathname]);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [searchFocused, setSearchFocused] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
     if (pathname === "/") {
        setSearchQuery(searchParams.get("search") || "");
     }
  }, [searchParams, pathname]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (query) {
        router.push(`/?search=${encodeURIComponent(query)}`);
      } else if (pathname === "/") {
         router.push("/");
      }
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          if (searchQuery) {
             router.push(`/?search=${encodeURIComponent(searchQuery)}`);
          } else if (pathname === "/") {
             router.push("/");
          }
      }
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString("th-TH-u-ca-buddhist", {
    timeZone: 'Asia/Bangkok',
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const userMenuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    
    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <header
      className="fixed top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 backdrop-blur-md border-b"
      style={{
        left: side === "left" ? sidebarWidth : "0",
        right: side === "right" ? sidebarWidth : "0",
        background: "var(--topbar-bg)",
        borderColor: "var(--border-color)",
        transition: "left 0.3s, right 0.3s",
      }}
    >
      <div className={`flex items-center gap-3 md:gap-4 flex-1 ${side === "right" ? "order-1 flex-row-reverse" : ""}`}>
        <button 
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu size={20} />
        </button>

        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
            searchFocused
              ? "border-sky-400 shadow-sm ring-2 ring-sky-100"
              : ""
          }`}
          style={{
            width: "100%",
            maxWidth: "320px",
            background: searchFocused ? "var(--card-bg)" : "var(--input-bg)",
            borderColor: searchFocused ? undefined : "var(--input-border)",
          }}
        >
          <Search size={16} className="text-sky-500" />
          <input
            type="text"
            placeholder="ค้นหา..."
            className="bg-transparent outline-none text-sm w-full transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        <span className="text-xs hidden lg:block whitespace-nowrap" style={{ color: "var(--text-secondary)" }} suppressHydrationWarning>
          {dateStr}
        </span>
      </div>

      <div className={`flex items-center gap-2 ${side === "right" ? "order-0" : ""}`}>
        <button
          onClick={toggleTheme}
          className="relative p-2 rounded-lg transition-colors cursor-pointer"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-bg)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          title={theme === "light" ? "เปลี่ยนเป็น Dark Mode" : "เปลี่ยนเป็น Light Mode"}
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div className="w-px h-8 mx-1 hidden sm:block" style={{ background: "var(--border-color)" }} />

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-bg)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >

            <UserAvatar 
              image={userProfile?.image || session?.user?.image} 
              name={session?.user?.name} 
              size="sm" 
            />
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold leading-tight truncate max-w-[100px]" style={{ color: "var(--text-primary)" }}>
                {session?.user?.name || "ผู้ใช้งาน"}
              </p>
              <p className="text-[11px] leading-tight capitalize" style={{ color: "var(--text-muted)" }}>
                 {session?.user?.role || "user"}
              </p>
            </div>
            <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
          </button>

          {showUserMenu && (
            <div className={`absolute ${side === "right" ? "left-0" : "right-0"} top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-20`}>
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{session?.user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">@{session?.user?.email}</p>
              </div>
              <a href="/profile" className="block px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-sky-500 transition-colors relative z-20">
                  แก้ไขข้อมูลส่วนตัว
              </a>
              <a href="/my-requests" className="block px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-sky-500 transition-colors relative z-20">
                  รายการยืมของฉัน
              </a>
              <button 
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors relative z-20"
              >
                  ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
