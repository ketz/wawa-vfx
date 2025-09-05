import * as THREE from 'three';
import { VFXManager } from '../VFXManager';
import { VFXParticles } from '../VFXParticles';
import { VFXEmitter } from '../VFXEmitter';
import { RenderMode } from '../types';

export class EmitterExample {
  private vfxManager: VFXManager;
  private emitter: VFXEmitter;
  private emitterMesh: THREE.Mesh;
  private tmpVector = new THREE.Vector3();

  constructor(scene: THREE.Scene) {
    this.vfxManager = new VFXManager(scene);
    this.setupParticles();
    this.setupEmitterMesh(scene);
  }

  private setupParticles(): void {
    // Create particle system
    const particles = new VFXParticles({
      nbParticles: 100000,
      gravity: [0, -9.8, 0],
      fadeSize: [0, 0],
      fadeAlpha: [0, 0],
      renderMode: RenderMode.Billboard,
      intensity: 2,
    });

    this.vfxManager.createParticleSystem('particles', particles);

    // Create emitter
    this.emitter = new VFXEmitter(particles, {
      loop: true,
      duration: 1,
      nbParticles: 1000,
      startPositionMin: [-0.1, -0.1, -0.1],
      startPositionMax: [0.1, 0.1, 0.1],
      directionMin: [-0.5, 0, -0.5],
      directionMax: [0.5, 1, 0.5],
      size: [0.01, 0.35],
      speed: [1, 12],
      colorStart: ["#ffc0cb", "#87ceeb"],
      colorEnd: ["#ffc0cb", "#0000ff"],
    });

    this.vfxManager.addEmitter(this.emitter);
  }

  private setupEmitterMesh(scene: THREE.Scene): void {
    // Create visual representation of the emitter
    const geometry = new THREE.SphereGeometry(0.2, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 'white',
      emissive: new THREE.Color('pink'),
      emissiveIntensity: 3,
    });
    
    this.emitterMesh = new THREE.Mesh(geometry, material);
    scene.add(this.emitterMesh);
  }

  public update(deltaTime: number, elapsedTime: number): void {
    // Animate emitter position
    this.tmpVector.set(
      Math.sin(elapsedTime) * 4,
      Math.cos(elapsedTime * 2) * 6,
      Math.sin(elapsedTime * 4) * 8
    );
    
    this.emitterMesh.position.lerp(this.tmpVector, deltaTime * 2);
    this.emitter.object3D.position.copy(this.emitterMesh.position);

    this.vfxManager.update(deltaTime, elapsedTime);
  }

  public dispose(): void {
    this.vfxManager.dispose();
  }
}