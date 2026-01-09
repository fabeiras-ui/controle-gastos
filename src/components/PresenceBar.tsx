"use client";

import React from "react";
import { useOthers, useSelf } from "../../liveblocks.config";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
} from "@/components/ui/avatar";

export function PresenceBar() {
  const others = useOthers();
  const self = useSelf();

  const allUsers = [
    ...(self?.presence?.name ? [{ connectionId: "self", presence: self.presence }] : []),
    ...others
      .filter((other) => other.presence?.name)
      .map((other) => ({
        connectionId: other.connectionId,
        presence: other.presence,
      })),
  ];

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <AvatarGroup>
        {allUsers.map(({ connectionId, presence }) => (
          <Avatar key={connectionId} className="border-2 border-white">
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
