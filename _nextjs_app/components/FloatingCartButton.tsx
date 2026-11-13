"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function FloatingCartButton() {
  const { data: session } = useSession();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (session?.user) {
      fetch(`/api/borrow?userId=${(session.user as any).id}&status=borrowed`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setCount(data.length);
          }
        })
        .catch((err) => console.error("Failed to fetch borrow count", err));
    }
  }, [session]);

  if (!session) return null;

  return (
    <Link
      href="/my-requests"
      className="fixed bottom-6 right-6 z-40 bg-sky-500 hover:bg-sky-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center group"
      title="รายการยืมของฉัน"
    >
      <ShoppingBag size={24} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
          {count}
        </span>
      )}
      <span className="absolute right-full mr-3 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        รายการยืมของฉัน
      </span>
    </Link>
  );
}
