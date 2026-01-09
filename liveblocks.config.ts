import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
});

type Presence = {
  cursor: { x: number; y: number } | null;
  name: string;
  color: string;
};

type Storage = {
  // Define the structure of your storage here
};

type UserMeta = {
  // Define the structure of your user metadata here
};

type RoomEvent = {
  // Define the structure of your room events here
};

export const {
  RoomProvider,
  useMyPresence,
  useOthers,
  useSelf,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client);
