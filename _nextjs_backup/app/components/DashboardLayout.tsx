"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export type SidebarSide = "left" | "right";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { status } = useSession();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [side, setSide] = useState<SidebarSide>("left");

  const sidebarWidth = collapsed ? "72px" : "260px";

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
    };

    const savedSide = localStorage.getItem("sidebar-side") as SidebarSide | null;
    if (savedSide && (savedSide === "left" || savedSide === "right")) {
      setSide(savedSide);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSetSide = (newSide: SidebarSide) => {
    setSide(newSide);
    localStorage.setItem("sidebar-side", newSide);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {isMobile && mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity animate-in fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        side={side}
        setSide={handleSetSide}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <Topbar 
        side={side} 
        sidebarWidth={isMobile ? "0px" : sidebarWidth} 
        toggleMobileMenu={() => setMobileOpen(!mobileOpen)}
      />
      <main
        className="pt-16 transition-all duration-300"
        style={{
          marginLeft: !isMobile && side === "left" ? sidebarWidth : "0",
          marginRight: !isMobile && side === "right" ? sidebarWidth : "0",
        }}
      >
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
