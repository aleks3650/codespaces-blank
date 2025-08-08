import { Server } from "https://deno.land/x/socket_io@0.2.1/mod.ts";

const io = new Server({
  cors: {
    origin: true,
    allowedHeaders: ["my-header"],
    credentials: true,
  },
});

const TICK_RATE = 1000 / 60;
const MAX_TICKS = 60;
let tick = 0;

const gameState = {
  time: new Date().toISOString(),
  tick: tick,
};

function gameLoop() {
  tick = (tick + 1) % MAX_TICKS;
  gameState.tick = tick;
  gameState.time = new Date().toISOString();

  io.emit("gameState", gameState);

  setTimeout(gameLoop, TICK_RATE);
}

io.on("connection", (socket) => {
  console.log(`socket ${socket.id} connected`);

  socket.on("disconnect", (reason) => {
    console.log(`socket ${socket.id} disconnected due to ${reason}`);
  });
});

Deno.serve({
  handler: io.handler(),
  port: 8000,
});

gameLoop();
console.log("Server Socket.IO is listening on port 8000...");
