"use client";

import React from "react";
import { useOthers, RoomProvider } from "../../liveblocks.config";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
} from "@/components/ui/avatar";

export function PresenceBar() {
  return (
    <RoomProvider id="vault-family-room" initialPresence={{ cursor: null, name: "Usuário", color: "#3b82f6" }}>
      <PresenceBarContent />
    </RoomProvider>
  );
}

function PresenceBarContent() {
  const others = useOthers();
  const authenticatedOthers = others;

  if (authenticatedOthers.length === 0) {
    return null;
  }

  const handleAvatarClick = (e: React.MouseEvent, presence: { cursor?: { x: number; y: number } | null }) => {
    e.preventDefault();
    e.stopPropagation();
    if (presence?.cursor) {
      // Faz o scroll suave até a posição do cursor
      window.scrollTo({
        top: presence.cursor.y - (window.innerHeight / 2), // Centraliza o cursor na tela
        left: presence.cursor.x - (window.innerWidth / 2),
        behavior: 'smooth' // Faz o scroll ser suave
      });

      // Dispara um evento customizado para animação no cursor
      const event = new CustomEvent("cursor-ping", {
        detail: { x: presence.cursor.x, y: presence.cursor.y },
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <AvatarGroup>
        {authenticatedOthers.map(({ connectionId, presence }) => (
          <Avatar
            key={connectionId}
            className="border-2 border-white cursor-pointer hover:scale-110 transition-transform h-8 w-8"
            onClick={(e) => handleAvatarClick(e, presence)}
          >
            {presence?.avatar && (
              <AvatarImage src={presence.avatar} alt={presence.name || undefined} />
            )}
            <AvatarFallback
              className="text-white text-[10px] font-medium"
              style={{ backgroundColor: presence?.color || "#3b82f6" }}
            >
              {presence?.name ? presence.name.substring(0, 2).toUpperCase() : "C"}
            </AvatarFallback>
          </Avatar>
        ))}
      </AvatarGroup>
    </div>
  );
}
