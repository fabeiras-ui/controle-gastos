"use client";

import React from "react";
import { LiveblocksProvider as Provider } from "@liveblocks/react";
import { RoomProvider } from "../../liveblocks.config";
import { LiveCursors } from "@/components/LiveCursors";
import { PresenceBar } from "@/components/PresenceBar";

const COLORS = [
  "#E57373", "#F06292", "#BA68C8", "#9575CD", "#7986CB", "#64B5F6", "#4FC3F7",
  "#4DD0E1", "#4DB6AC", "#81C784", "#AED581", "#DCE775", "#FFF176", "#FFD54F",
  "#FFB74D", "#FF8A65"
];

export function LiveblocksProvider({ children }: { children: React.ReactNode }) {
  const color = React.useMemo(() => COLORS[Math.floor(Math.random() * COLORS.length)], []);

  return (
    <Provider publicApiKey={process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!}>
      <RoomProvider id="vault-family-room" initialPresence={{ cursor: null, name: "", color }}>
        <PresenceBar />
        <LiveCursors />
        {children}
      </RoomProvider>
    </Provider>
  );
}
