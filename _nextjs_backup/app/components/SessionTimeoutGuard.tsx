"use client";

import { useEffect, useCallback, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const TIMEOUT_DURATION = 15 * 60 * 1000;

export default function SessionTimeoutGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(() => {
    if (status === "authenticated") {
      signOut({ callbackUrl: "/login?reason=timeout" });
    }
  }, [status]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    if (status === "authenticated") {
      timerRef.current = setTimeout(handleLogout, TIMEOUT_DURATION);
    }
  }, [handleLogout, status]);

  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "visibilitychange"
    ];

    const handleEvent = (e?: Event) => {
      if (e?.type === "visibilitychange" && document.visibilityState === "visible") {
        resetTimer();
      } else {
        resetTimer();
      }
    };

    if (status === "authenticated") {
      resetTimer();

      events.forEach((event) => {
        window.addEventListener(event, handleEvent);
      });
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleEvent);
      });
    };
  }, [status, resetTimer]);

  return <>{children}</>;
}
