import * as THREE from 'three';
import { VFXManager } from '../VFXManager';
import { VFXParticles } from '../VFXParticles';
import { VFXEmitter } from '../VFXEmitter';
import { AppearanceMode, RenderMode } from '../types';

export class FireworksExample {
  private vfxManager: VFXManager;
  private emitter: VFXEmitter;
  private lastShotTime: number = 0;
  private target = new THREE.Vector3();

  constructor(scene: THREE.Scene) {
    this.vfxManager = new VFXManager(scene);
    this.setupParticles();
    this.generateNewTarget();
  }

  private setupParticles(): void {
    // Create particle system
    const particles = new VFXParticles({
      nbParticles: 100000,
      intensity: 0.5,
      renderMode: RenderMode.StretchBillboard,
      stretchScale: 2,
      fadeSize: [0, 0],
      fadeAlpha: [0, 1],
      gravity: [0, 0, 0],
      appearance: AppearanceMode.Circular,
      easeFunction: "easeOutQuint",
    });

    this.vfxManager.createParticleSystem('fireworks', particles);

    // Create emitter
    this.emitter = new VFXEmitter(particles, {
      duration: 4,
      delay: 0,
      nbParticles: 10000,
      spawnMode: "burst",
      loop: true,
      startPositionMin: [0, 0, 0],
      startPositionMax: [0, 0, 0],
      startRotationMin: [0, 0, 0],
      startRotationMax: [0, 0, 0],
      particlesLifetime: [5, 10],
      speed: [0.1, 0.5],
      directionMin: [-1, -1, -1],
      directionMax: [1, 1, 1],
      rotationSpeedMin: [0, 0, 0],
      rotationSpeedMax: [0, 0, 0],
      colorStart: ["#FF003C", "#FFA500", "#FF69B4"],
      colorEnd: ["#000000"],
      size: [0.1, 0.3],
      useLocalDirection: true,
    });

    this.vfxManager.addEmitter(this.emitter);
  }

  private generateNewTarget(): void {
    this.target.set(
      (Math.random() - 0.5) * 6,
      Math.random() * 2 + 1,
      (Math.random() - 0.5) * 6
    );
  }

  public update(deltaTime: number, elapsedTime: number): void {
    this.lastShotTime += deltaTime;
    
    if (this.lastShotTime > Math.random() * 2 + 0.5) {
      this.emitter.emitAtPos(this.target, true);
      this.lastShotTime = 0;
      this.generateNewTarget();
    }

    this.vfxManager.update(deltaTime, elapsedTime);
  }

  public dispose(): void {
    this.vfxManager.dispose();
  }
}