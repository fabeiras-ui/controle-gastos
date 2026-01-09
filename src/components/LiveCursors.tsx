"use client";

import React, { useEffect } from "react";
import { useMyPresence, useOthers } from "../../liveblocks.config";
import { MousePointer2 } from "lucide-react";
import { useSession } from "next-auth/react";

export function LiveCursors() {
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const others = useOthers();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchUserData = () => {
      fetch("/api/users/me")
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            updateMyPresence({ name: data.nickname || data.name || "Usuário" });
          } else if (session?.user?.name) {
            updateMyPresence({ name: session.user.name });
          }
        })
        .catch((err) => {
          console.error("Error fetching user data for presence:", err);
          if (session?.user?.name) {
            updateMyPresence({ name: session.user.name });
          }
        });
    };

    fetchUserData();
    window.addEventListener("user-updated", fetchUserData);
    return () => window.removeEventListener("user-updated", fetchUserData);
  }, [session, updateMyPresence]);

  useEffect(() => {
    const moveMouse = (e: PointerEvent) => {
      updateMyPresence({
        cursor: {
          x: Math.round(e.clientX),
          y: Math.round(e.clientY),
        },
      });
    };

    const leaveMouse = () => {
      updateMyPresence({ cursor: null });
    };

    // Escuta o movimento na janela inteira
    window.addEventListener("pointermove", moveMouse);
    window.addEventListener("pointerleave", leaveMouse);

    return () => {
      window.removeEventListener("pointermove", moveMouse);
      window.removeEventListener("pointerleave", leaveMouse);
    };
  }, [updateMyPresence]);

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none"
    >
      {others.map(({ connectionId, presence }) => {
        if (!presence?.cursor) return null;

        return (
          <div
            key={connectionId}
            className="absolute top-0 left-0 transition-transform duration-100 ease-out"
            style={{
              transform: `translate(${presence.cursor.x}px, ${presence.cursor.y}px)`,
              color: presence.color || "#3b82f6",
            }}
          >
            <MousePointer2 
              className="w-5 h-5 fill-current" 
              style={{ 
                filter: "drop-shadow(0 0 2px rgba(0,0,0,0.1))" 
              }}
            />
            <div 
              className="ml-3 px-2 py-0.5 text-white text-[10px] font-semibold rounded-full rounded-tl-none whitespace-nowrap shadow-sm"
              style={{ backgroundColor: presence.color || "#3b82f6" }}
            >
              {presence.name || "Convidado"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
