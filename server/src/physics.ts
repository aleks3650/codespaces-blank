import RAPIER from "npm:@dimforge/rapier3d-compat";

interface MapCollisionData {
  vertices: number[];
  indices: number[];
}

export class PhysicsWorld {
  private world: RAPIER.World;
  private playerBodies: Map<string, RAPIER.RigidBody> = new Map();

  constructor() {
    this.world = new RAPIER.World({ x: 0, y: -1, z: 0 });
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
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(1.0, 5.0, 0.0);
    const body = this.world.createRigidBody(bodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.ball(0.05);
    this.world.createCollider(colliderDesc, body);

    this.playerBodies.set(playerId, body);
    console.log(`[Physics] Added player body for ${playerId}`);
  }

  public removePlayer(playerId: string) {
    const body = this.playerBodies.get(playerId);
    if (body) {
      this.world.removeCollider(body.collider(0), false);
      this.world.removeRigidBody(body);
      this.playerBodies.delete(playerId);
      console.log(`[Physics] Removed player body for ${playerId}`);
    }
  }

  public getState() {
    const playersState: {
      [id: string]: { position: RAPIER.Vector; rotation: RAPIER.Quaternion };
    } = {};
    for (const [id, body] of this.playerBodies.entries()) {
      playersState[id] = {
        position: body.translation(),
        rotation: body.rotation(),
      };
    }
    return { players: playersState };
  }

  public setPlayerRotation(
    playerId: string,
    rotation: { x: number; y: number; z: number; w: number },
  ) {
    const body = this.playerBodies.get(playerId);

    if (body) {
      body.setRotation(rotation, true);
    }
  }

  public step() {
    this.world.step();
  }
}
