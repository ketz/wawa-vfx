import * as THREE from 'three';
import { VFXManager } from '../VFXManager';
import { VFXParticles } from '../VFXParticles';
import { VFXEmitter } from '../VFXEmitter';
import { RenderMode } from '../types';

export class MultipleEmittersExample {
  private vfxManager: VFXManager;
  private emitters: VFXEmitter[] = [];
  private emitterMeshes: THREE.Mesh[] = [];
  private tmpVector = new THREE.Vector3();

  constructor(scene: THREE.Scene) {
    this.vfxManager = new VFXManager(scene);
    this.setupParticles();
    this.setupEmitters(scene);
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
  }

  private setupEmitters(scene: THREE.Scene): void {
    const sharedSettings = {
      loop: true,
      duration: 1,
      nbParticles: 2000,
      startPositionMin: [0, 0, 0] as [number, number, number],
      startPositionMax: [0, 0, 0] as [number, number, number],
      directionMin: [-0.5, 0, -0.5] as [number, number, number],
      directionMax: [0.5, 0.5, 0.5] as [number, number, number],
      size: [0.01, 0.15] as [number, number],
      speed: [1, 3] as [number, number],
    };

    const emitterConfigs = [
      {
        color: '#ff69b4',
        colorStart: ['#ff41ad', '#ffaedc'],
        colorEnd: ['#ffc0cb', '#ff39a9'],
      },
      {
        color: '#87ceeb',
        colorStart: ['#416bff', '#87ceeb'],
        colorEnd: ['#87ceeb', '#94bfff'],
      },
      {
        color: '#90ee90',
        colorStart: ['#76ffb0', '#94ffc1'],
        colorEnd: ['#94fff9', '#ffffff'],
      },
      {
        color: '#ffffff',
        colorStart: ['#ffffff', '#ffff00'],
        colorEnd: ['#ffffff', '#ffa500'],
      },
    ];

    emitterConfigs.forEach((config, index) => {
      // Create visual mesh
      const geometry = new THREE.SphereGeometry(0.1, 16, 16);
      const material = new THREE.MeshStandardMaterial({
        color: config.color,
        emissive: new THREE.Color(config.color),
        emissiveIntensity: 2,
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      this.emitterMeshes.push(mesh);

      // Create emitter
      const particles = this.vfxManager.getParticleSystem('particles');
      if (particles) {
        const emitter = new VFXEmitter(particles, {
          ...sharedSettings,
          colorStart: config.colorStart,
          colorEnd: config.colorEnd,
        });

        this.emitters.push(emitter);
        this.vfxManager.addEmitter(emitter);
      }
    });
  }

  public update(deltaTime: number, elapsedTime: number): void {
    const distance = 6;
    const time = elapsedTime;

    // Animate each emitter in a circular pattern with different phases
    this.emitterMeshes.forEach((mesh, index) => {
      const phase = index * 50; // Different phase for each emitter
      this.tmpVector.set(
        index % 2 === 0 ? Math.sin(time * 8) * distance : Math.cos(time * 8) * distance,
        Math.sin(time * 2 + phase) * 8,
        index % 2 === 0 ? Math.cos(time * 8) * distance : Math.sin(time * 8) * distance
      );
      
      mesh.position.lerp(this.tmpVector, deltaTime * 2);
      this.emitters[index].object3D.position.copy(mesh.position);
    });

    this.vfxManager.update(deltaTime, elapsedTime);
  }

  public dispose(): void {
    this.vfxManager.dispose();
  }
}