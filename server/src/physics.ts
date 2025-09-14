import RAPIER from "npm:@dimforge/rapier3d-compat";
import { PlayerInput, RaycastHitResult } from "./helpers/types.ts";
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

  public getPlayerController(playerId: string): PlayerController | undefined {
    return this.playerControllers.get(playerId);
  }

  public addPlayer(playerId: string) {
    const initialPos = { x: 1.0, y: 1.5, z: 0.0 };
    const controller = new PlayerController(this.world, initialPos);
    this.playerControllers.set(playerId, controller);
  }

  public teleportPlayer(playerId: string, position: { x: number; y: number; z: number }) {
    const controller = this.playerControllers.get(playerId);
    if (controller) {
      controller.forceTeleport(position);
    }
  }


  public castRayForSpell(casterId: string, direction: number[], maxDistance: number): RaycastHitResult {
    const casterController = this.playerControllers.get(casterId);
    if (!casterController) return { type: "miss" };

    const origin = casterController.getState().position;
    const rayOrigin = new RAPIER.Vector3(origin.x, origin.y + 0.03, origin.z);
    const rayDirection = new RAPIER.Vector3(direction[0], direction[1], direction[2]);

    const ray = new RAPIER.Ray(rayOrigin, rayDirection);
    const solid = true;

    const casterCollider = casterController.getBody().collider(0);
    const filterPredicate = (collider: RAPIER.Collider) => {
      return collider.handle !== casterCollider.handle;
    };

    const hit = this.world.castRay(
      ray,
      maxDistance,
      solid,
      undefined,
      undefined,
      undefined,
      undefined,
      filterPredicate
    );

    if (!hit) {
      return { type: "miss" };
    }

    const hitPoint = ray.pointAt(hit.timeOfImpact);
    const hitCollider = hit.collider;

    for (const [playerId, controller] of this.playerControllers.entries()) {
      if (controller.getBody().collider(0).handle === hitCollider.handle) {
        return { type: "player", playerId, point: hitPoint };
      }
    }

    return { type: "world", point: hitPoint };
  }

  public removePlayer(playerId: string) {
    this.playerControllers.get(playerId)?.cleanup();
    this.playerControllers.delete(playerId);
  }

  public findPlayersInRadius(casterId: string, radius: number): string[] {
    const casterController = this.playerControllers.get(casterId);
    if (!casterController) return [];

    const casterPosition = casterController.getBody().translation();
    const hitPlayerIds: string[] = [];

    for (const [targetId, targetController] of this.playerControllers.entries()) {
      if (targetId === casterId) continue; 

      const targetPosition = targetController.getBody().translation();

      const distance = Math.sqrt(
        Math.pow(casterPosition.x - targetPosition.x, 2) +
        Math.pow(casterPosition.y - targetPosition.y, 2) +
        Math.pow(casterPosition.z - targetPosition.z, 2)
      );

      if (distance <= radius) {
        hitPlayerIds.push(targetId);
      }
    }

    return hitPlayerIds;
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