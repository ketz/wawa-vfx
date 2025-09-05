import * as THREE from 'three';
import { VFXManager } from '../VFXManager';
import { VFXParticles } from '../VFXParticles';
import { VFXEmitter } from '../VFXEmitter';
import { AppearanceMode, RenderMode } from '../types';

export class StretchedBillboardExample {
  private vfxManager: VFXManager;
  private emitter: VFXEmitter;
  private rotatingGroup: THREE.Group;

  constructor(scene: THREE.Scene) {
    this.vfxManager = new VFXManager(scene);
    this.setupParticles();
    this.setupRotatingGroup(scene);
  }

  private setupParticles(): void {
    // Create particle system
    const particles = new VFXParticles({
      nbParticles: 500000,
      intensity: 1,
      renderMode: RenderMode.StretchBillboard,
      stretchScale: 4,
      fadeSize: [0, 0],
      fadeAlpha: [0, 0],
      gravity: [0, -6, 0],
      appearance: AppearanceMode.Circular,
      easeFunction: "easeLinear",
    });

    this.vfxManager.createParticleSystem('sparks', particles);

    // Create emitter
    this.emitter = new VFXEmitter(particles, {
      duration: 0.0001,
      delay: 0,
      nbParticles: 1,
      spawnMode: "time",
      loop: true,
      startPositionMin: [0, 0, -0.2],
      startPositionMax: [0, 0, 0.2],
      startRotationMin: [0, 0, 0],
      startRotationMax: [0, 0, 0],
      particlesLifetime: [2, 4],
      speed: [4, 5],
      directionMin: [0, 1, 0],
      directionMax: [0.5, 1, 0],
      rotationSpeedMin: [0, 0, 0],
      rotationSpeedMax: [0, 0, 0],
      colorStart: ["#ffa600"],
      colorEnd: ["#000000"],
      size: [0.04, 0.1],
      useLocalDirection: true,
    });

    this.vfxManager.addEmitter(this.emitter);
  }

  private setupRotatingGroup(scene: THREE.Scene): void {
    this.rotatingGroup = new THREE.Group();
    scene.add(this.rotatingGroup);

    // Position the emitter within the rotating group
    this.emitter.object3D.position.set(2, 0, 0);
    this.rotatingGroup.add(this.emitter.object3D);
  }

  public update(deltaTime: number, elapsedTime: number): void {
    // Rotate the group
    this.rotatingGroup.rotation.z += deltaTime * 10;

    this.vfxManager.update(deltaTime, elapsedTime);
  }

  public dispose(): void {
    this.vfxManager.dispose();
  }
}