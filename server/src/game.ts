import { PhysicsWorld } from "./physics.ts";

export class Game {
  public physics: PhysicsWorld;

  constructor() {
    this.physics = new PhysicsWorld();
  }

  public addNewPlayer(id: string) {
    this.physics.addPlayer(id);
  }

  public removePlayer(id: string) {
    this.physics.removePlayer(id);
  }

  public async initialize() {
    await this.physics.initializeMapCollider("./map_collider.json");
  }

  public update(tick: number) {
    this.physics.step();
    const physicsState = this.physics.getState();

    return {
      players: physicsState.players,
      tick: tick,
      time: new Date().toISOString(),
    };
  }
}
