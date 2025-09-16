import * as THREE from "npm:three";
import RAPIER from "npm:@dimforge/rapier3d-compat";
import { PlayerInput } from "./helpers/types.ts";

export class PlayerController {
  private body: RAPIER.RigidBody;
  private controller: RAPIER.KinematicCharacterController;
  private world: RAPIER.World;
  private velocity = new THREE.Vector3();

  private readonly walkSpeed = .4;
  private readonly sprintSpeed = 1.1;
  private readonly jumpStrength = 1.0;
  private readonly gravity = -10.0;
  private readonly MAX_SLOPE_ANGLE = 25.0;

  constructor(world: RAPIER.World, initialPosition: RAPIER.Vector) {
    this.world = world;

    const rigidBodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased()
      .setTranslation(initialPosition.x, initialPosition.y, initialPosition.z);
    this.body = world.createRigidBody(rigidBodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.capsule(0.02, 0.025);
    world.createCollider(colliderDesc, this.body);

    this.controller = world.createCharacterController(0.001);
    this.controller.enableAutostep(0.5, 0.2, true);
    this.controller.enableSnapToGround(0.25);
  }

  public isOnGround(): boolean {
    if (!this.controller.computedGrounded()) {
      return false;
    }

    const origin = this.body.translation();
    const rayOrigin = new RAPIER.Vector3(origin.x, origin.y, origin.z);
    const rayDirection = new RAPIER.Vector3(0, -1, 0);
    const ray = new RAPIER.Ray(rayOrigin, rayDirection);

    const maxDistance = 0.2;
    const solid = true;

    const filterPredicate = (collider: RAPIER.Collider) => {
      return collider.handle !== this.body.collider(0).handle;
    };

    const hit = this.world.castRayAndGetNormal(
      ray,
      maxDistance,
      solid,
      undefined,
      undefined,
      undefined,
      undefined,
      filterPredicate
    );

    if (hit) {
      const minGroundNormalY = Math.cos(this.MAX_SLOPE_ANGLE * (Math.PI / 180.0));
      if (hit.normal.y >= minGroundNormalY) {
        return true;
      }
    }

    return false;
  }

  public getBody(): RAPIER.RigidBody {
    return this.body;
  }

  public teleport(position: { x: number; y: number; z: number }) {
    this.body.setNextKinematicTranslation(position);
  }

  public update(input: PlayerInput, deltaTime: number) {
    const [x, y, z, w] = input.rotation;
    this.body.setRotation({ x, y, z, w }, true);
    const playerRotation = new THREE.Quaternion(x, y, z, w);

    const rawDir = new THREE.Vector3();
    if (input.inputs.forward) rawDir.z -= 1;
    if (input.inputs.backward) rawDir.z += 1;
    if (input.inputs.left) rawDir.x -= 1;
    if (input.inputs.right) rawDir.x += 1;

    const moveDir = rawDir.clone();
    if (moveDir.lengthSq() > 0) {
      moveDir.normalize().applyQuaternion(playerRotation);
    }

    const onGround = this.isOnGround();
    if (onGround) {
      this.velocity.y = -0.1;
      if (input.inputs.jump) {
        this.velocity.y = this.jumpStrength;
      }
    } else {
      this.velocity.y += this.gravity * deltaTime;
    }

    const isPureForward = rawDir.z < 0 && rawDir.x === 0;
    const canSprint = isPureForward && input.inputs.sprint;
    const currentSpeed = canSprint ? this.sprintSpeed : this.walkSpeed;

    this.velocity.x = moveDir.x * currentSpeed;
    this.velocity.z = moveDir.z * currentSpeed;

    const movement = this.velocity.clone().multiplyScalar(deltaTime);
    this.controller.computeColliderMovement(this.body.collider(0), movement);
    const resolved = this.controller.computedMovement();
    const newPos = new THREE.Vector3().copy(this.body.translation()).add(resolved);
    this.body.setNextKinematicTranslation(newPos);
  }

  public forceTeleport(position: { x: number; y: number; z: number }) {
    this.body.setTranslation(position, true);

    this.velocity.set(0, 0, 0);
  }

  public getState() {
    return {
      position: this.body.translation(),
      rotation: this.body.rotation(),
    };
  }

  public cleanup() {
    this.world.removeCollider(this.body.collider(0), false);
    this.world.removeRigidBody(this.body);
  }
}