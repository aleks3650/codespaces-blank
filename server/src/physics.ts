import RAPIER from "npm:@dimforge/rapier3d-compat";
import { PlayerInput } from "./helpers/types.ts";
import { PlayerController } from "./playerController.ts";

interface MapCollisionData {
  vertices: number[];
  indices: number[];
}

export class PhysicsWorld {
  private world: RAPIER.World;
  private playerControllers: Map<string, PlayerController> = new Map();

  constructor() {
    this.world = new RAPIER.World({ x: 0, y: 0, z: 0 }); 
  }

  public async initializeMapCollider(path: string) {
    const fileContent = await Deno.readTextFile(path);
    const data: MapCollisionData = JSON.parse(fileContent);

    const vertices = new Float32Array(data.vertices);
    const indices = new Uint32Array(data.indices);

    const rigidBodyDesc = RAPIER.RigidBodyDesc.fixed();
    const mapBody = this.world.createRigidBody(rigidBodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.trimesh(vertices, indices);
    this.world.createCollider(colliderDesc, mapBody);

    console.log("Map collider initialized.");
  }

  public addPlayer(playerId: string) {
    const initialPos = { x: 1.5, y: 1.5, z: 0.0 };
    const controller = new PlayerController(this.world, initialPos);
    this.playerControllers.set(playerId, controller);
  }

  public removePlayer(playerId: string) {
    this.playerControllers.get(playerId)?.cleanup();
    this.playerControllers.delete(playerId);
  }
  
  public update(inputs: Map<string, PlayerInput>, deltaTime: number) {
    for (const [playerId, controller] of this.playerControllers.entries()) {
      const playerInput = inputs.get(playerId);
      if (playerInput) {
        controller.update(playerInput, deltaTime);
      }
    }
    this.world.step();
  }

  public getState() {
    const playersState: { [id: string]: { position: RAPIER.Vector; rotation: RAPIER.Quaternion } } = {};
    for (const [id, controller] of this.playerControllers.entries()) {
      playersState[id] = controller.getState();
    }
    return { players: playersState };
  }
}