import { VFXEmitter } from './VFXEmitter';
import { VFXParticles } from './VFXParticles';

export class VFXManager {
  private particleSystems: Map<string, VFXParticles> = new Map();
  private emitters: VFXEmitter[] = [];
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  createParticleSystem(name: string, particles: VFXParticles): void {
    this.particleSystems.set(name, particles);
    this.scene.add(particles.mesh);
  }

  getParticleSystem(name: string): VFXParticles | undefined {
    return this.particleSystems.get(name);
  }

  addEmitter(emitter: VFXEmitter): void {
    this.emitters.push(emitter);
    this.scene.add(emitter.object3D);
  }

  removeEmitter(emitter: VFXEmitter): void {
    const index = this.emitters.indexOf(emitter);
    if (index > -1) {
      this.emitters.splice(index, 1);
      this.scene.remove(emitter.object3D);
    }
  }

  update(deltaTime: number, elapsedTime: number): void {
    // Update all particle systems
    this.particleSystems.forEach(particles => {
      particles.update(elapsedTime);
    });

    // Update all emitters
    this.emitters.forEach(emitter => {
      emitter.update(deltaTime, elapsedTime);
    });
  }

  dispose(): void {
    this.particleSystems.forEach(particles => {
      particles.dispose();
      if (particles.mesh.parent) {
        particles.mesh.parent.remove(particles.mesh);
      }
    });
    this.particleSystems.clear();

    this.emitters.forEach(emitter => {
      if (emitter.object3D.parent) {
        emitter.object3D.parent.remove(emitter.object3D);
      }
    });
    this.emitters.length = 0;
  }
}