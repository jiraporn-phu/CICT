"use client";

import { useState, useEffect, Suspense } from "react";
import DashboardLayout from "./components/DashboardLayout";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { EquipmentItem } from "@/app/lib/types";
import { LoadingState } from "@/app/components/homepage/LoadingState";
import { EmptyState } from "@/app/components/homepage/EmptyState";
import { EquipmentGrid } from "@/app/components/homepage/EquipmentGrid";
import HeroBanner from "@/app/components/homepage/HeroBanner";
import SearchFilterBar from "@/app/components/homepage/SearchFilterBar";
import { BorrowModal } from "@/app/components/manage/BorrowModal";
import { FloatingCartButton } from "@/app/components/FloatingCartButton";

export default function HomePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HomeContent />
        </Suspense>
    );
}

function HomeContent() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "admin";

  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [borrowItem, setBorrowItem] = useState<EquipmentItem | null>(null);
  const [borrowMode, setBorrowMode] = useState<"borrow" | "requisition">("borrow");

  useEffect(() => {
     setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearchChange = (val: string) => {
      setSearch(val);
      if (val) {
          router.replace(`/?search=${encodeURIComponent(val)}`);
      } else {
          router.replace("/");
      }
  };

  const loadData = () => {
    setLoading(true);
    fetch("/api/equipment")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
           setItems(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load equipment", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (session?.user) {
        setCurrentUser(session.user);
        
        fetch("/api/users/myprofile")
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                    setCurrentUser((prev: any) => ({ ...prev, phone: data.phone }));
                }
            })
            .catch(err => console.error("Failed to fetch profile", err));
    }
  }, [session]);

  const handleBorrow = (item: EquipmentItem) => {
    if (!session) {
        router.push("/login");
        return;
    }
    setBorrowMode("borrow");
    setBorrowItem(item);
  };

  const handleRequisition = (item: EquipmentItem) => {
    if (!session) {
        router.push("/login");
        return;
    }
    setBorrowMode("requisition");
    setBorrowItem(item);
  };

  const handleReturn = async (item: EquipmentItem) => {
    if (!confirm(`ยืนยันการคืน "${item.name}"?`)) return;

    try {
        const res = await fetch("/api/borrow/return", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactionId: item.myBorrowId }),
        });
        
        if (!res.ok) throw new Error("Return failed");
        
        loadData();
    } catch (error) {
        console.error(error);
        alert("ทำรายการไม่สำเร็จ");
    }
  };

  const filtered = items.filter((item) => {
    const term = search.toLowerCase();
    const matchSearch = search === "" || 
      item.name.toLowerCase().includes(term) || 
      (item.serialNumber ? item.serialNumber.toLowerCase().includes(term) : false);
      
    const matchCategory = selectedCategory === "all" || item.category === selectedCategory;

    let matchStatus = false;
    if (statusFilter === "all") {
      matchStatus = true;
    } else if (statusFilter === "available") {
      matchStatus = item.availableQuantity > 0;
    } else if (statusFilter === "borrowed") {
      matchStatus = (item.quantity - item.availableQuantity) > 0 && item.status !== "maintenance";
    } else if (statusFilter === "maintenance") {
      matchStatus = item.status === "maintenance";
    }
    
    return matchSearch && matchCategory && matchStatus;
  });

  const [stats, setStats] = useState<any>(null);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (session?.user) {
      fetch("/api/wishlist")
        .then(res => res.json())
        .then(data => {
           if (Array.isArray(data)) {
               setWishlistedIds(new Set(data.map((eq: any) => eq.id)));
           }
        })
        .catch(err => console.error("Failed to load wishlist", err));
    }
  }, [session]);

  const handleToggleWishlist = async (item: EquipmentItem) => {
      console.log("Toggle Wishlist initiated for item:", item.name, "ID:", item.id);
      
      if (!session) {
          console.log("No session found, redirecting to login...");
          router.push("/login?callbackUrl=/");
          return;
      }

      const isWishlisted = wishlistedIds.has(item.id);
      
      setWishlistedIds(prev => {
          const next = new Set(prev);
          if (isWishlisted) next.delete(item.id);
          else next.add(item.id);
          return next;
      });

      try {
          let response;
          if (isWishlisted) {
              console.log("Sending DELETE request to /api/wishlist/" + item.id);
              response = await fetch(`/api/wishlist/${item.id}`, { method: 'DELETE' });
          } else {
              console.log("Sending POST request to /api/wishlist");
              response = await fetch('/api/wishlist', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ equipmentId: item.id })
              });
          }
          
          if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.error || `Server responded with ${response.status}`);
          }
          
          console.log("Wishlist toggle successful for:", item.name);
      } catch (error: any) {
          console.error("Failed to toggle wishlist:", error);
          alert("ไม่สามารถบันทึกรายการโปรดได้: " + (error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ"));
          
          setWishlistedIds(prev => {
              const next = new Set(prev);
              if (isWishlisted) next.add(item.id);
              else next.delete(item.id);
              return next;
          });
      }
  };

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then(res => res.json())
      .then(data => setStats(data.stats))
      .catch(err => console.error(err));
  }, []);

  const totalCount = items.length;
  const totalUnits = stats?.totalPhysicalUnits || items.reduce((s, i) => s + i.quantity, 0);
  const availableCount = items.filter((e) => e.availableQuantity > 0).length;
  const borrowedCount = items.filter((e) => (e.quantity - e.availableQuantity) > 0 && e.status !== 'maintenance').length;

  const categories = Array.from(new Set(items.map(i => i.category))).map(name => ({ id: name, name }));

  let content;
  if (loading) {
    content = <LoadingState />;
  } else if (filtered.length === 0) {
    content = <EmptyState />;
  } else {
    content = <EquipmentGrid items={filtered} onBorrow={handleBorrow} onReturn={handleReturn} onRequisition={handleRequisition} wishlistedIds={wishlistedIds} onToggleWishlist={handleToggleWishlist} />;
  }

  return (
    <>
      <DashboardLayout>
        <div className="max-w-[1400px] mx-auto relative">
          
          {borrowItem && currentUser && (
              <BorrowModal
                  item={borrowItem}
                  userId={currentUser.id}
                  userName={currentUser.fullName || currentUser.name}
                  userPhone={currentUser.phone || ""}
                  mode={borrowMode}
                  onClose={() => setBorrowItem(null)}
                  onSuccess={() => {
                      loadData();
                  }} 
              />
          )}
  
          <HeroBanner
            isAdmin={isAdmin}
            totalCount={totalCount}
            totalUnits={totalUnits}
            availableCount={availableCount}
            borrowedCount={borrowedCount}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
  
          <SearchFilterBar
            search={search}
            onSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            items={items}
          />
  
          {content}
  
          <footer className="text-center py-4 border-t border-slate-100 mt-8">
            <p className="text-xs text-slate-400">ICTC-Asset Management System</p>
          </footer>
        </div>
      </DashboardLayout>
      <FloatingCartButton />
    </>
  );
}
