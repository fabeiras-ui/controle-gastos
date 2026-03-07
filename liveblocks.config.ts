import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
});

type Presence = {
  cursor: { x: number; y: number } | null;
  name: string;
  color: string;
  avatar?: string | null;
  message?: string;
};

type Storage = {
  // Define the structure of your storage here
};

type UserMeta = {
  // Define the structure of your user metadata here
};

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
