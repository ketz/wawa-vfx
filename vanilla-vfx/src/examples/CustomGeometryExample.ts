import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { VFXManager } from '../VFXManager';
import { VFXParticles } from '../VFXParticles';
import { VFXEmitter } from '../VFXEmitter';
import { RenderMode } from '../types';

export class CustomGeometryExample {
  private vfxManager: VFXManager;
  private emitter: VFXEmitter;
  private burstTimer: number = 0;
  private shouldBurst: boolean = true;
  private swordGeometry: THREE.BufferGeometry | null = null;
  private isLoaded: boolean = false;

  constructor(scene: THREE.Scene) {
    this.vfxManager = new VFXManager(scene);
    this.loadModel().then(() => {
      this.setupParticles();
    });
  }

  private async loadModel(): Promise<void> {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    
    try {
      const gltf = await loader.loadAsync('./models/sword.glb');
      const swordMesh = gltf.scene.getObjectByName('Sword') as THREE.Mesh;
      if (swordMesh && swordMesh.geometry) {
        this.swordGeometry = swordMesh.geometry;
        this.isLoaded = true;
      } else {
        console.warn('Sword geometry not found in GLTF, using fallback');
        this.swordGeometry = new THREE.BoxGeometry(0.1, 1, 0.02);
        this.isLoaded = true;
      }
    } catch (error) {
      console.warn('Failed to load sword model, using fallback geometry:', error);
      this.swordGeometry = new THREE.BoxGeometry(0.1, 1, 0.02);
      this.isLoaded = true;
    }
  }

  private setupParticles(): void {
    if (!this.swordGeometry) {
      console.error('Sword geometry not loaded');
      return;
    }
    
    // Create particle system with custom geometry
    const particles = new VFXParticles({
      nbParticles: 1000,
      gravity: [0, 0, 0],
      fadeSize: [0.3, 0.95],
      renderMode: RenderMode.Mesh,
      intensity: 1.5,
    }, undefined, this.swordGeometry);

    this.vfxManager.createParticleSystem('swords', particles);

    // Create emitter
    this.emitter = new VFXEmitter(particles, {
      spawnMode: "burst",
      loop: true,
      duration: 1,
      nbParticles: 102,
      startPositionMin: [-5, -5, 0],
      startPositionMax: [5, 5, 0],
      directionMin: [0, 0, 0],
      directionMax: [0, 0, 0],
      size: [0.5, 1],
      particlesLifetime: [1, 1],
      speed: [1, 5],
      colorStart: ["#ffffff", "#87ceeb", "#ffc0cb"],
      startRotationMin: [0, 0, 0],
      startRotationMax: [Math.PI, Math.PI, Math.PI],
    });

    this.vfxManager.addEmitter(this.emitter);
  }

  public update(deltaTime: number, elapsedTime: number): void {
    if (!this.isLoaded) {
      return;
    }

    this.burstTimer += deltaTime;
    
    if (this.burstTimer > 2) {
      this.shouldBurst = !this.shouldBurst;
      this.burstTimer = 0;
      
      if (this.shouldBurst) {
        this.emitter.emitAtPos(null, true);
      }
    }

    this.vfxManager.update(deltaTime, elapsedTime);
  }

  public dispose(): void {
    this.vfxManager.dispose();
  }
}