import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const publicApiKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || "pk_build_placeholder";

const client = createClient({
  publicApiKey,
});

type Presence = {
  cursor: { x: number; y: number } | null;
  name: string;
  color: string;
  avatar?: string | null;
  message?: string;
};

type Storage = Record<string, any>;

type UserMeta = Record<string, any>;

type RoomEvent = {
  type: "REACTION";
  emoji: string;
  x: number;
  y: number;
};

export const {
  RoomProvider,
  useMyPresence,
  useOthers,
  useSelf,
  useBroadcastEvent,
  useEventListener,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client);
