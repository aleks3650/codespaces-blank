import * as THREE from "npm:three";
import RAPIER from "npm:@dimforge/rapier3d-compat";
import { PlayerInput } from "./helpers/types.ts";

export class PlayerController {
  private body: RAPIER.RigidBody;
  private controller: RAPIER.KinematicCharacterController;
  private world: RAPIER.World;
  private velocity = new THREE.Vector3();

  private readonly walkSpeed = .5;
  private readonly sprintSpeed = 1.25; 
  private readonly jumpStrength = 1.25;
  private readonly gravity = -10.0; 
 
  constructor(world: RAPIER.World, initialPosition: RAPIER.Vector) {
    this.world = world;

    const rigidBodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased()
      .setTranslation(initialPosition.x, initialPosition.y, initialPosition.z);
    this.body = world.createRigidBody(rigidBodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.capsule(0.15, 0.05);
    world.createCollider(colliderDesc, this.body);

    this.controller = world.createCharacterController(0.001);
    this.controller.enableAutostep(0.5, 0.2, true);
    this.controller.enableSnapToGround(0.25);
  }

  public update(input: PlayerInput, deltaTime: number) {
    const [x, y, z, w] = input.rotation;
    this.body.setRotation({ x, y, z, w }, true);
    const playerRotation = new THREE.Quaternion(x, y, z, w);

    const moveDirection = new THREE.Vector3();
    if (input.inputs.forward) moveDirection.z -= 1;
    if (input.inputs.backward) moveDirection.z += 1;
    if (input.inputs.left) moveDirection.x -= 1;
    if (input.inputs.right) moveDirection.x += 1;

    if (moveDirection.lengthSq() > 0) {
      moveDirection.normalize().applyQuaternion(playerRotation);
    }
    
    const isOnGround = this.controller.computedGrounded();
    
    if (isOnGround) {
      this.velocity.y = this.gravity * deltaTime; 
      if (input.inputs.jump) {
        this.velocity.y = this.jumpStrength;
      }
    } else {
      this.velocity.y += this.gravity * deltaTime; 
    }

    const currentSpeed = input.inputs.sprint ? this.sprintSpeed : this.walkSpeed;

    this.velocity.x = moveDirection.x * currentSpeed;
    this.velocity.z = moveDirection.z * currentSpeed;

    const movement = this.velocity.clone().multiplyScalar(deltaTime);
    this.controller.computeColliderMovement(this.body.collider(0), movement);

    const correctedMovement = this.controller.computedMovement();
    const newPos = new THREE.Vector3().copy(this.body.translation()).add(correctedMovement);
    this.body.setNextKinematicTranslation(newPos);
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