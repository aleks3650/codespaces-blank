import { Server } from "https://deno.land/x/socket_io@0.2.1/mod.ts";

export const io = new Server({
  cors: {
    origin: true,
    allowedHeaders: ["my-header"],
    credentials: true,
  },
});