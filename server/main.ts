import RAPIER from "npm:@dimforge/rapier3d-compat";
import { Game } from "./src/game.ts";
import { TICK_RATE } from "./src/helpers/constants.ts";
import { io } from "./src/helpers/IO_Server.ts";
import { PlayerAction, PlayerInput } from "./src/helpers/types.ts";

const ALLOWED_CLASSES = ["Mage", "Warrior"];

await RAPIER.init();

const game = new Game();
await game.initialize();

let lastTickTime = Date.now();
const pendingInputs: Map<string, PlayerInput> = new Map();

function gameLoop() {
  const now = Date.now();
  const deltaTime = (now - lastTickTime) / 1000.0;
  lastTickTime = now;

  game.update(pendingInputs, deltaTime);

  const liveGameState = game.getState();

  io.emit("gameState", liveGameState);

  pendingInputs.clear();

  setTimeout(gameLoop, TICK_RATE);
}

io.on("connection", (socket) => {
  const chosenClass = String(socket.handshake.auth.playerClass);
  const playerClass = ALLOWED_CLASSES.includes(chosenClass) ? chosenClass : "Mage";

  console.log(`socket ${socket.id} connected as a ${playerClass}`);
  game.addNewPlayer(socket.id, playerClass);

  socket.on("player-inputs", (data: PlayerInput) => {
    data.playerId = socket.id;
    pendingInputs.set(socket.id, data);
  });

  socket.on("player-action", (data: PlayerAction) => {
    game.handlePlayerAction(socket.id, data);
  });

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