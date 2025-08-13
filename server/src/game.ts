import { PlayerInput } from "./helpers/types.ts";
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

  public update(inputs: Map<string, PlayerInput>, deltaTime: number) {
    this.physics.update(inputs, deltaTime);
  }

  public getState() {
    return this.physics.getState();
  }
}