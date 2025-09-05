import * as THREE from 'three';
import { VFXManager } from '../VFXManager';
import { VFXParticles } from '../VFXParticles';
import { VFXEmitter } from '../VFXEmitter';
import { AppearanceMode, RenderMode } from '../types';

export class ReverseExample {
  private vfxManager: VFXManager;
  private emitter: VFXEmitter;
  private particles: VFXParticles;

  constructor(scene: THREE.Scene) {
    this.vfxManager = new VFXManager(scene);
    this.setupParticles();
  }

  private setupParticles(): void {
    // Create particle system
    this.particles = new VFXParticles({
      nbParticles: 100000,
      gravity: [0, -6, 0],
      fadeSize: [0, 0],
      fadeAlpha: [0, 0],
      renderMode: RenderMode.Billboard,
      intensity: 2,
      appearance: AppearanceMode.Circular,
    });

    this.vfxManager.createParticleSystem('particles', this.particles);

    // Create emitter with purple and yellow colors
    this.emitter = new VFXEmitter(this.particles, {
      loop: true,
      duration: 1,
      nbParticles: 1000,
      startPositionMin: [-0.1, -0.1, -0.1],
      startPositionMax: [0.1, 0.1, 0.1],
      directionMin: [-1, -1, -1],
      directionMax: [1, 1, 1],
      size: [0.01, 0.35],
      speed: [-1, -18],
      colorStart: ["#bc7eff", "#ffce26"], // Purple and yellow
      colorEnd: ["#bc7eff", "#ffce26"],   // Same colors for end
    });

    this.vfxManager.addEmitter(this.emitter);
  }

  public getSettings() {
    return {
      renderMode: this.particles.settings.renderMode,
      nbParticles: this.emitter.settings.nbParticles,
      intensity: this.particles.settings.intensity,
      gravity: this.particles.settings.gravity,
      speed: this.emitter.settings.speed,
      size: this.emitter.settings.size,
    };
  }

  public updateSettings(newSettings: any) {
    // Update particle system settings
    if (newSettings.renderMode !== undefined) {
      this.particles.settings.renderMode = newSettings.renderMode;
    }
    if (newSettings.intensity !== undefined) {
      this.particles.settings.intensity = newSettings.intensity;
    }
    if (newSettings.gravity !== undefined) {
      this.particles.settings.gravity = newSettings.gravity;
    }
    
    // Update emitter settings
    if (newSettings.nbParticles !== undefined) {
      this.emitter.settings.nbParticles = newSettings.nbParticles;
    }
    if (newSettings.speed !== undefined) {
      this.emitter.settings.speed = newSettings.speed;
    }
    if (newSettings.size !== undefined) {
      this.emitter.settings.size = newSettings.size;
    }
  }

  public startEmitting() {
    this.emitter.startEmitting();
  }

  public stopEmitting() {
    this.emitter.stopEmitting();
  }

  public reset() {
    this.emitter.startEmitting(true);
  }

  public update(deltaTime: number, elapsedTime: number): void {
    this.vfxManager.update(deltaTime, elapsedTime);
  }

  public dispose(): void {
    this.vfxManager.dispose();
  }
}