import * as THREE from 'three';
import { VFXManager } from './VFXManager';
import { VFXParticles } from './VFXParticles';
import { VFXEmitter } from './VFXEmitter';
import { AppearanceMode, RenderMode } from './types';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x110511);
document.body.appendChild(renderer.domElement);

// VFX Manager
const vfxManager = new VFXManager(scene);

// Create particle system
const particles = new VFXParticles({
  nbParticles: 100000,
  gravity: [0, -9.8, 0],
  fadeSize: [0, 0],
  fadeOpacity: [0, 0],
  renderMode: RenderMode.Billboard,
  intensity: 3,
  appearance: AppearanceMode.Circular,
});

vfxManager.createParticleSystem('particles', particles);

// Create emitter
const emitter = new VFXEmitter(particles, {
  loop: true,
  duration: 1,
  nbParticles: 100,
  startPositionMin: [-0.1, -0.1, -0.1],
  startPositionMax: [0.1, 0.1, 0.1],
  directionMin: [-1, 0, -1],
  directionMax: [1, 1, 1],
  size: [0.01, 0.25],
  speed: [1, 12],
  colorStart: ["white", "skyblue"],
  colorEnd: ["white", "pink"],
});

vfxManager.addEmitter(emitter);

// Camera position
camera.position.set(0, 0, 8);

// Lighting
const directionalLight = new THREE.DirectionalLight(0xffe7ba, 2);
directionalLight.position.set(1, 0.5, -10);
scene.add(directionalLight);

// Animation loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  
  const deltaTime = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();
  
  // Update VFX
  vfxManager.update(deltaTime, elapsedTime);
  
  // Render
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();

// Export for external use
(window as any).vfxManager = vfxManager;
(window as any).scene = scene;
(window as any).camera = camera;
(window as any).renderer = renderer;