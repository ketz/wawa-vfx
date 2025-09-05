import * as THREE from 'three';
import { VFXManager } from '../VFXManager';
import { VFXParticles } from '../VFXParticles';
import { VFXEmitter } from '../VFXEmitter';
import { RenderMode } from '../types';

export class AlphaMapExample {
  private vfxManager: VFXManager;
  private heartEmitter: VFXEmitter;
  private starEmitter: VFXEmitter;

  constructor(scene: THREE.Scene) {
    this.vfxManager = new VFXManager(scene);
    this.setupParticles();
  }

  private setupParticles(): void {
    // Load textures
    const textureLoader = new THREE.TextureLoader();
    const heartTexture = textureLoader.load('./textures/symbol_01.png');
    const starTexture = textureLoader.load('./textures/symbol_02.png');

    // Create heart particle system
    const heartParticles = new VFXParticles({
      nbParticles: 100000,
      gravity: [0, 0, 0],
      fadeSize: [0.5, 0.5],
      fadeAlpha: [0.5, 0.5],
      renderMode: RenderMode.Billboard,
      intensity: 2,
    }, heartTexture);

    this.vfxManager.createParticleSystem('hearts', heartParticles);

    // Create star particle system
    const starParticles = new VFXParticles({
      nbParticles: 100000,
      gravity: [0, 0, 0],
      fadeSize: [0.5, 0.5],
      fadeAlpha: [0.5, 0.5],
      renderMode: RenderMode.Billboard,
      intensity: 1.5,
    }, starTexture);

    this.vfxManager.createParticleSystem('stars', starParticles);

    // Create heart emitter
    this.heartEmitter = new VFXEmitter(heartParticles, {
      loop: true,
      duration: 1,
      nbParticles: 1000,
      startPositionMin: [-1, -12, -1],
      startPositionMax: [1, 12, 1],
      directionMin: [0, 1, 0],
      directionMax: [2, 1, 0],
      size: [0.01, 2],
      particlesLifetime: [1, 8],
      speed: [1, 5],
      colorStart: ["#ff0000", "#8b0000"],
      startRotationMin: [0, 0, -1],
      startRotationMax: [0, 0, 1],
      rotationSpeedMin: [0, 0, 0],
      rotationSpeedMax: [0, 0, 5],
    });

    this.vfxManager.addEmitter(this.heartEmitter);

    // Create star emitter
    this.starEmitter = new VFXEmitter(starParticles, {
      loop: true,
      duration: 1,
      nbParticles: 1000,
      startPositionMin: [-1, -12, -1],
      startPositionMax: [1, 12, 1],
      directionMin: [-2, 1, 0],
      directionMax: [0, 1, 0],
      size: [0.01, 2],
      particlesLifetime: [1, 8],
      speed: [1, 5],
      colorStart: ["#ffa500", "#ffff00", "#ffffff"],
      startRotationMin: [0, 0, -1],
      startRotationMax: [0, 0, 1],
      rotationSpeedMin: [0, 0, 0],
      rotationSpeedMax: [0, 0, 5],
    });

    this.vfxManager.addEmitter(this.starEmitter);
  }

  public update(deltaTime: number, elapsedTime: number): void {
    this.vfxManager.update(deltaTime, elapsedTime);
  }

  public dispose(): void {
    this.vfxManager.dispose();
  }
}