import * as THREE from 'three';
import { VFXManager } from '../VFXManager';
import { VFXParticles } from '../VFXParticles';
import { VFXEmitter } from '../VFXEmitter';
import { AppearanceMode, RenderMode } from '../types';

export class StretchedBillboardExample {
  private vfxManager: VFXManager;
  private emitter: VFXEmitter;
  private particles: VFXParticles;
  private rotatingGroup: THREE.Group;

  constructor(scene: THREE.Scene) {
    this.vfxManager = new VFXManager(scene);
    this.setupRotatingGroup(scene);
    this.setupParticles();
  }

  private setupRotatingGroup(scene: THREE.Scene): void {
    this.rotatingGroup = new THREE.Group();
    scene.add(this.rotatingGroup);
  }

  private setupParticles(): void {
    // Create particle system with exact original settings
    this.particles = new VFXParticles({
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

    this.vfxManager.createParticleSystem('stretched', this.particles);

    // Create emitter with exact original settings
    this.emitter = new VFXEmitter(this.particles, {
      duration: 1,
      delay: 0,
      nbParticles: 1,
      spawnMode: "time",
      loop: true,
      startPositionMin: [0, 0, -0.2],
      startPositionMax: [0, 0, 0.2],
      startRotationMin: [0, 0, 0],
      startRotationMax: [0, 0, 0],
      particlesLifetime: [2, 4],
      speed: [3, 5],
      directionMin: [0, 0.5, 0],
      directionMax: [0.5, 1, 0],
      rotationSpeedMin: [0, 0, 0],
      rotationSpeedMax: [0, 0, 0],
      colorStart: ["#ffa600"],
      colorEnd: ["#555"],
      size: [0.1, 0.5],
      useLocalDirection: true,
    });
      
    this.vfxManager.addEmitter(this.emitter);
    
    // Position the emitter in the rotating group
    this.emitter.object3D.position.set(2, 0, 0);
    this.rotatingGroup.add(this.emitter.object3D);
    
    // Add emitter to rotating group for the spinning effect
    //this.emitter.object3D.position.set(3, 0, 0);
    //this.rotatingGroup.add(this.emitter.object3D);
  }

  public update(deltaTime: number, elapsedTime: number): void {
    // Rotate around Z axis like the original (was delta * 10)
    this.rotatingGroup.rotation.z += deltaTime * 10;
    this.vfxManager.update(deltaTime, elapsedTime);
  }

  public dispose(): void {
    this.vfxManager.dispose();
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
      this.emitter.updateSettings({ nbParticles: newSettings.nbParticles });
    }
    if (newSettings.speed !== undefined) {
      this.emitter.updateSettings({ speed: newSettings.speed });
    }
    if (newSettings.size !== undefined) {
      this.emitter.updateSettings({ size: newSettings.size });
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
}