import { io } from "./helpers/IO_Server.ts";
import { PlayerAction, PlayerInput, PlayerState } from "./helpers/types.ts";
import { PhysicsWorld } from "./physics.ts";

export type AnimationState = 'idle' | 'walk' | 'sprint';

export class Game {
  public physics: PhysicsWorld;
  private players: Map<string, PlayerState> = new Map();

  constructor() {
    this.physics = new PhysicsWorld();
  }

  public addNewPlayer(id: string) {
    const newPlayer: PlayerState = {
      id,
      class: "Mage",
      health: 100,
      mana: 100,
    };
    this.players.set(id, newPlayer);
    this.physics.addPlayer(id);
  }

  public removePlayer(id: string) {
    this.players.delete(id);
    this.physics.removePlayer(id);
  }

public applyDamage(targetId: string, damage: number) {
    const targetPlayer = this.players.get(targetId);
    if (!targetPlayer) return;

    targetPlayer.health -= damage;

    if (targetPlayer.health <= 0) {
      // TODO: Logika śmierci gracza (respawn, wiadomość o śmierci itp.)
      // Na razie resetujemy HP dla testów
      targetPlayer.health = 100;
      io.emit("player-death", { playerId: targetId });
    }
  }

  // ZMIENIONA METODA: Pełna logika obsługi akcji
  public handlePlayerAction(playerId: string, actionData: PlayerAction) {
    const playerState = this.players.get(playerId);
    if (!playerState) return;

    if (actionData.actionType === "castSpell") {
      // Krok 1: Walidacja i zasady gry (np. mana, cooldown)
      if (playerState.mana < 10) {
        // Opcjonalnie: wyślij wiadomość do gracza "Brak many!"
        return; 
      }
      playerState.mana -= 10;
      // TODO: Implementacja cooldownu

      // Krok 2: Zapytaj świat fizyki o wynik
      const result = this.physics.castRayForSpell(playerId, actionData.payload.direction);

      // Krok 3: Przetwórz wynik i poinformuj klientów
      switch (result.type) {
        case "player":
          this.applyDamage(result.playerId, 20);
          io.emit("spell-impact", { casterId: playerId, hitPlayerId: result.playerId, hitPoint: result.point });
          break;

        case "world":
          io.emit("spell-impact", { casterId: playerId, hitPoint: result.point });
          break;

        case "miss":
          io.emit("spell-miss", { casterId: playerId, direction: actionData.payload.direction });
          break;
      }
    }
  }

  public async initialize() {
    await this.physics.initializeMapCollider("./map_collider.json");
  }

  public update(inputs: Map<string, PlayerInput>, deltaTime: number) {
    this.physics.update(inputs, deltaTime);
  }

public getState() { // Usunąłem argument `inputs`, jest już dostępny wewnątrz
    const playersPhysicsState = this.physics.getState();
    const liveGameState: { [id:string]: any } = {}; // Użyjemy `any` tymczasowo dla zwięzłości

    for (const id in playersPhysicsState.players) {
        const physicsState = playersPhysicsState.players[id];
        const logicalState = this.players.get(id); // Pobieramy stan z HP/Maną
        
        // Łączymy oba stany w jeden obiekt
        liveGameState[id] = {
            ...physicsState,
            health: logicalState?.health,
            mana: logicalState?.mana,
            // ... w przyszłości można dodać więcej danych
        };
    }
    
    // Zwracamy pełny, połączony stan
    return { players: liveGameState };
  }
}