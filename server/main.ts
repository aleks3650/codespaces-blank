import RAPIER from 'npm:@dimforge/rapier3d-compat';
import { Game } from "./src/game.ts";
import {  MAX_TICKS, TICK_RATE } from "./src/helpers/constants.ts";
import { io } from "./src/helpers/IO_Server.ts";

await RAPIER.init();

const game = new Game();
await game.initialize(); 

let tick = 0;

function gameLoop() {
  tick = (tick + 1) % MAX_TICKS;
  const liveGameState = game.update(tick);

  io.emit("gameState", liveGameState);

  setTimeout(gameLoop, TICK_RATE);
}

io.on("connection", (socket) => {
  console.log(`socket ${socket.id} connected`);
  game.addNewPlayer(socket.id); 
  socket.on("disconnect", (reason) => {
    console.log(`socket ${socket.id} disconnected due to ${reason}`);
    game.removePlayer(socket.id);
  });
});

Deno.serve({
  handler: io.handler(),
  port: 8000,
});

gameLoop();
console.log("Server Socket.IO is listening on port 8000...");