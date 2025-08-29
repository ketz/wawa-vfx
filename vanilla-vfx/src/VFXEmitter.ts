import * as THREE from 'three';
import { VFXEmitterSettings } from './types';
import { VFXParticles, EmitCallbackSettingsFn } from './VFXParticles';

export class VFXEmitter {
  public object3D: THREE.Object3D;
  private settings: Required<VFXEmitterSettings>;
  private particleSystem: VFXParticles | null = null;
  private emitted: number = 0;
  private elapsedTime: number = 0;
  private currentTime: number = 0;
  private shouldEmit: boolean = true;

  constructor(particleSystem: VFXParticles, settings: VFXEmitterSettings = {}) {
    this.particleSystem = particleSystem;
    this.object3D = new THREE.Object3D();
    
    this.settings = {
      duration: 1,
      nbParticles: 1000,
      spawnMode: "time",
      loop: false,
      delay: 0,
      colorStart: ["white", "skyblue"],
      colorEnd: [],
      particlesLifetime: [0.1, 1],
      speed: [5, 20],
      size: [0.1, 1],
      startPositionMin: [-1, -1, -1],
      startPositionMax: [1, 1, 1],
      startRotationMin: [0, 0, 0],
      startRotationMax: [0, 0, 0],
      rotationSpeedMin: [0, 0, 0],
      rotationSpeedMax: [0, 0, 0],
      directionMin: [0, 0, 0],
      directionMax: [0, 0, 0],
      useLocalDirection: false,
      ...settings
    };
  }

  public startEmitting(reset: boolean = false): void {
    if (reset) {
      this.emitted = 0;
      this.elapsedTime = 0;
    }
    this.shouldEmit = true;
  }

  public stopEmitting(): void {
    this.shouldEmit = false;
  }

  public emitAtPos(position: THREE.Vector3 | null, reset: boolean = false): void {
    if (this.settings.spawnMode !== "burst") {
      console.error("This function is meant to be used with burst spawn mode only.");
      return;
    }

    const rate = this.settings.nbParticles - this.emitted;
    if (reset) {
      this.emitted = 0;
      this.elapsedTime = 0;
    }

    if (position) {
      this.object3D.position.copy(position);
    }

    this.object3D.updateWorldMatrix(true, true);
    const worldMatrix = this.object3D.matrixWorld;
    const worldPosition = new THREE.Vector3();
    const worldQuaternion = new THREE.Quaternion();
    const worldScale = new THREE.Vector3();
    worldMatrix.decompose(worldPosition, worldQuaternion, worldScale);

    this.particleSystem?.emit(rate, () => this.createParticle(worldPosition, worldQuaternion));
  }

  private randFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private createParticle(worldPosition: THREE.Vector3, worldQuaternion: THREE.Quaternion): any {
    const randSize = this.randFloat(this.settings.size[0], this.settings.size[1]);
    const color = this.settings.colorStart[this.randInt(0, this.settings.colorStart.length - 1)];
    
    const direction = new THREE.Vector3(
      this.randFloat(this.settings.directionMin[0], this.settings.directionMax[0]),
      this.randFloat(this.settings.directionMin[1], this.settings.directionMax[1]),
      this.randFloat(this.settings.directionMin[2], this.settings.directionMax[2])
    );

    if (this.settings.useLocalDirection) {
      direction.applyQuaternion(worldQuaternion);
    }

    return {
      position: [
        worldPosition.x + this.randFloat(this.settings.startPositionMin[0], this.settings.startPositionMax[0]),
        worldPosition.y + this.randFloat(this.settings.startPositionMin[1], this.settings.startPositionMax[1]),
        worldPosition.z + this.randFloat(this.settings.startPositionMin[2], this.settings.startPositionMax[2]),
      ],
      direction: [direction.x, direction.y, direction.z],
      scale: [randSize, randSize, randSize],
      rotation: [
        this.randFloat(this.settings.startRotationMin[0], this.settings.startRotationMax[0]),
        this.randFloat(this.settings.startRotationMin[1], this.settings.startRotationMax[1]),
        this.randFloat(this.settings.startRotationMin[2], this.settings.startRotationMax[2]),
      ],
      rotationSpeed: [
        this.randFloat(this.settings.rotationSpeedMin[0], this.settings.rotationSpeedMax[0]),
        this.randFloat(this.settings.rotationSpeedMin[1], this.settings.rotationSpeedMax[1]),
        this.randFloat(this.settings.rotationSpeedMin[2], this.settings.rotationSpeedMax[2]),
      ],
      lifetime: [
        this.currentTime,
        this.randFloat(this.settings.particlesLifetime[0], this.settings.particlesLifetime[1]),
      ],
      colorStart: color,
      colorEnd: this.settings.colorEnd?.length
        ? this.settings.colorEnd[this.randInt(0, this.settings.colorEnd.length - 1)]
        : color,
      speed: [this.randFloat(this.settings.speed[0], this.settings.speed[1])],
    };
  }

  public update(deltaTime: number, elapsedTime: number): void {
    this.currentTime = elapsedTime;
    
    if (!this.shouldEmit || !this.particleSystem) {
      return;
    }

    if (this.emitted < this.settings.nbParticles || this.settings.loop) {
      const particlesToEmit = this.settings.spawnMode === "burst"
        ? this.settings.nbParticles
        : Math.max(0, Math.floor(((this.elapsedTime - this.settings.delay) / this.settings.duration) * this.settings.nbParticles));

      const rate = particlesToEmit - this.emitted;
      
      if (rate > 0 && this.elapsedTime >= this.settings.delay) {
        this.object3D.updateWorldMatrix(true, true);
        const worldMatrix = this.object3D.matrixWorld;
        const worldPosition = new THREE.Vector3();
        const worldQuaternion = new THREE.Quaternion();
        const worldScale = new THREE.Vector3();
        worldMatrix.decompose(worldPosition, worldQuaternion, worldScale);

        this.particleSystem.emit(rate, () => this.createParticle(worldPosition, worldQuaternion));
        this.emitted += rate;
      }
    }
    
    this.elapsedTime += deltaTime;
  }

  public updateSettings(newSettings: Partial<VFXEmitterSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }
}