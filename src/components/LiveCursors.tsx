"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useMyPresence, useOthers, useBroadcastEvent, useEventListener } from "../../liveblocks.config";
import { MousePointer2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Reaction = {
  value: string;
  timestamp: number;
  point: { x: number; y: number };
  dx: number;
  dy: number;
};

export function LiveCursors() {
  const [{ cursor, message }, updateMyPresence] = useMyPresence();
  const others = useOthers();
  const broadcast = useBroadcastEvent();
  const { data: session } = useSession();
  const [ping, setPing] = useState<{ x: number; y: number } | null>(null);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isChatActive, setIsChatActive] = useState(false);

  // Remove reações após 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setReactions((reactions) =>
        reactions.filter((r) => r.timestamp > Date.now() - 4000)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEventListener(({ event }) => {
    if (event.type === "REACTION") {
      // Cria várias partículas para a explosão
      const newReactions = Array.from({ length: 8 }).map(() => ({
        value: event.emoji,
        timestamp: Date.now() + Math.random() * 100,
        point: { x: event.x, y: event.y },
        dx: (Math.random() - 0.5) * 100,
        dy: (Math.random() - 0.5) * 100,
      }));
      setReactions((reactions) => [...reactions, ...newReactions]);
    }
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "/") {
        if (!isChatActive) {
          e.preventDefault();
          setIsChatActive(true);
        }
      } else if (e.key === "Escape") {
        updateMyPresence({ message: "" });
        setIsChatActive(false);
      } else if (e.key === "e" || e.key === "E") {
        if (!isChatActive && cursor) {
          broadcast({
            type: "REACTION",
            emoji: "👋",
            x: cursor.x,
            y: cursor.y,
          });
          // Também adiciona localmente para feedback instantâneo
          const newReactions = Array.from({ length: 8 }).map(() => ({
            value: "👋",
            timestamp: Date.now() + Math.random() * 100,
            point: { x: cursor.x, y: cursor.y },
            dx: (Math.random() - 0.5) * 100,
            dy: (Math.random() - 0.5) * 100,
          }));
          setReactions((reactions) => [...reactions, ...newReactions]);
        }
      }
    },
    [broadcast, cursor, isChatActive, updateMyPresence]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const handlePing = (e: any) => {
      setPing({ x: e.detail.x, y: e.detail.y });
      setTimeout(() => setPing(null), 2000); // Remove o ping após 2 segundos
    };

    window.addEventListener("cursor-ping", handlePing);
    return () => window.removeEventListener("cursor-ping", handlePing);
  }, []);

  useEffect(() => {
    const fetchUserData = () => {
      fetch("/api/users/me")
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            updateMyPresence({ 
              name: data.nickname || data.name || "Usuário",
              avatar: data.image || session?.user?.image 
            });
          } else if (session?.user?.name) {
            updateMyPresence({ 
              name: session.user.name,
              avatar: session.user.image
            });
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
          x: Math.round(e.pageX),
          y: Math.round(e.pageY),
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
      className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-[9999]"
    >
      {reactions.map((reaction) => (
        <div
          key={`${reaction.timestamp}-${reaction.point.x}-${reaction.point.y}`}
          className="absolute pointer-events-none select-none emoji-explosion"
          style={{
            transform: `translate(${reaction.point.x}px, ${reaction.point.y}px)`,
            ["--tw-translate-x"]: `${reaction.dx}px`,
            ["--tw-translate-y"]: `${reaction.dy}px`,
          } as React.CSSProperties}
        >
          <div className="text-2xl">{reaction.value}</div>
        </div>
      ))}

      {cursor && isChatActive && (
        <div
          className="absolute top-0 left-0 z-50"
          style={{
            transform: `translate(${cursor.x}px, ${cursor.y}px)`,
          }}
        >
          <div 
            className="ml-5 mt-2 px-3 py-2 bg-blue-500 text-white text-sm rounded-xl rounded-tl-none shadow-lg pointer-events-auto"
            onKeyDown={(e) => e.stopPropagation()}
          >
            {isChatActive && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] opacity-70 uppercase font-bold">Chat</span>
                <input
                  autoFocus
                  className="bg-transparent border-none outline-none text-white placeholder:text-blue-200 w-[200px]"
                  placeholder="Escreva algo..."
                  onChange={(e) => updateMyPresence({ message: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsChatActive(false);
                    }
                  }}
                  value={message || ""}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {ping && (
        <div
          className="absolute top-0 left-0 w-20 h-20 -ml-10 -mt-10 rounded-full border-2 border-blue-500 animate-ping opacity-75"
          style={{
            transform: `translate(${ping.x}px, ${ping.y}px)`,
          }}
        />
      )}
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
              className="ml-3 px-1 py-1 text-white text-[10px] font-semibold rounded-full rounded-tl-none whitespace-nowrap shadow-sm flex items-center gap-1.5 pr-2"
              style={{ backgroundColor: presence.color || "#3b82f6" }}
            >
              <Avatar className="h-4 w-4 border-none">
                <AvatarImage src={(presence as { avatar?: string | null }).avatar || undefined} />
                <AvatarFallback className="text-[8px] bg-transparent text-white">
                  {presence.name?.substring(0, 1).toUpperCase() || "C"}
                </AvatarFallback>
              </Avatar>
              {presence.name || "Convidado"}
            </div>
            {presence.message && (
              <div 
                className="ml-3 mt-1 px-3 py-1.5 bg-white text-black text-xs rounded-xl rounded-tl-none shadow-md border border-slate-100 max-w-[200px] break-words"
              >
                {presence.message}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
