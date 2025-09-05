import * as THREE from 'three';
import { VFXManager } from '../VFXManager';
import { VFXParticles } from '../VFXParticles';
import { VFXEmitter } from '../VFXEmitter';
import { AppearanceMode, RenderMode } from '../types';

export class BasicExample {
  private vfxManager: VFXManager;
  private emitter: VFXEmitter;

  constructor(scene: THREE.Scene) {
    this.vfxManager = new VFXManager(scene);
    this.setupParticles();
  }

  private setupParticles(): void {
    // Create particle system
    const particles = new VFXParticles({
      nbParticles: 100000,
      gravity: [0, -9.8, 0],
      fadeSize: [0, 0],
      fadeAlpha: [0, 0],
      renderMode: RenderMode.Billboard,
      intensity: 1.5,
    });

    this.vfxManager.createParticleSystem('particles', particles);

    // Create emitter
    this.emitter = new VFXEmitter(particles, {
      loop: true,
      duration: 1,
      nbParticles: 100,
      startPositionMin: [-0.1, -0.1, -0.1],
      startPositionMax: [0.1, 0.1, 0.1],
      directionMin: [-1, 0, -1],
      directionMax: [1, 1, 1],
      size: [0.01, 0.25],
      speed: [1, 12],
      colorStart: ["#ffffff", "#87ceeb"],
      colorEnd: ["#ffffff", "#ffc0cb"],
    });

    this.vfxManager.addEmitter(this.emitter);
  }

  public update(deltaTime: number, elapsedTime: number): void {
    this.vfxManager.update(deltaTime, elapsedTime);
  }

  public dispose(): void {
    this.vfxManager.dispose();
  }
}