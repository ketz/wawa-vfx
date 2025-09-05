import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer, RenderPass, BloomEffect, EffectPass } from 'postprocessing';
import { GradientSky } from './GradientSky';
import { BasicExample } from './examples/BasicExample';
import { ReverseExample } from './examples/ReverseExample';
import { EmitterExample } from './examples/EmitterExample';
import { MultipleEmittersExample } from './examples/MultipleEmittersExample';
import { AlphaMapExample } from './examples/AlphaMapExample';
import { StretchedBillboardExample } from './examples/StretchedBillboardExample';
import { FireworksExample } from './examples/FireworksExample';
import { CustomGeometryExample } from './examples/CustomGeometryExample';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// Camera controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Post-processing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Add bloom effect
const bloomEffect = new BloomEffect({
  intensity: 2,
  luminanceThreshold: 0.2,
  mipmapBlur: true,
});
const effectPass = new EffectPass(camera, bloomEffect);
composer.addPass(effectPass);

// Camera position
camera.position.set(12, 8, 26);
camera.lookAt(0, 0, 0);

// Lighting
const directionalLight = new THREE.DirectionalLight(0xffe7ba, 2);
directionalLight.position.set(1, 0.5, -10);
scene.add(directionalLight);

// Add gradient sky background
const gradientSky = new GradientSky();
scene.add(gradientSky.mesh);

// Add stars background
const starsGeometry = new THREE.BufferGeometry();
const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });

const starsVertices = [];
for (let i = 0; i < 2000; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = (Math.random() - 0.5) * 2000;
  starsVertices.push(x, y, z);
}

starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Control panel elements
const renderModeSelect = document.getElementById('renderMode') as HTMLSelectElement;
const nbParticlesInput = document.getElementById('nbParticles') as HTMLInputElement;
const intensityInput = document.getElementById('intensity') as HTMLInputElement;
const gravityInput = document.getElementById('gravity') as HTMLInputElement;
const speedMinInput = document.getElementById('speedMin') as HTMLInputElement;
const speedMaxInput = document.getElementById('speedMax') as HTMLInputElement;
const sizeMinInput = document.getElementById('sizeMin') as HTMLInputElement;
const sizeMaxInput = document.getElementById('sizeMax') as HTMLInputElement;
const resetButton = document.getElementById('resetEmitter') as HTMLButtonElement;
const toggleButton = document.getElementById('toggleEmission') as HTMLButtonElement;

// Control panel state
let isEmitting = true;
let controlsInitialized = false;

// Update control panel with current example settings
function updateControlPanel() {
  if (!currentExample || controlsInitialized) return;
  
  const settings = currentExample.getSettings?.();
  if (settings) {
    if (settings.renderMode) renderModeSelect.value = settings.renderMode;
    if (settings.nbParticles) nbParticlesInput.value = settings.nbParticles.toString();
    if (settings.intensity) intensityInput.value = settings.intensity.toString();
    if (settings.gravity) gravityInput.value = settings.gravity[1].toString(); // Y gravity
    if (settings.speed) {
      speedMinInput.value = settings.speed[0].toString();
      speedMaxInput.value = settings.speed[1].toString();
    }
    if (settings.size) {
      sizeMinInput.value = settings.size[0].toString();
      sizeMaxInput.value = settings.size[1].toString();
    }
  }
  controlsInitialized = true;
}

// Apply control panel changes to current example
function applyControlChanges() {
  if (!currentExample || !currentExample.updateSettings) return;
  
  const newSettings = {
    renderMode: renderModeSelect.value,
    nbParticles: parseInt(nbParticlesInput.value),
    intensity: parseFloat(intensityInput.value),
    gravity: [0, parseFloat(gravityInput.value), 0] as [number, number, number],
    speed: [parseFloat(speedMinInput.value), parseFloat(speedMaxInput.value)] as [number, number],
    size: [parseFloat(sizeMinInput.value), parseFloat(sizeMaxInput.value)] as [number, number],
  };
  
  currentExample.updateSettings(newSettings);
}

// Example management
let currentExample: any = null;
const examples = {
  basic: () => new BasicExample(scene),
  reverse: () => new ReverseExample(scene),
  emitter: () => new EmitterExample(scene),
  multiple: () => new MultipleEmittersExample(scene),
  alphaMap: () => new AlphaMapExample(scene),
  stretched: () => new StretchedBillboardExample(scene),
  fireworks: () => new FireworksExample(scene),
  customGeometry: () => new CustomGeometryExample(scene),
};

// Initialize with basic example
let currentExampleKey = 'basic';
currentExample = examples[currentExampleKey]();
controlsInitialized = false;
setTimeout(updateControlPanel, 100); // Allow example to initialize

// Animation loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  
  const deltaTime = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();
  
  // Update controls
  controls.update();
    
  // Update current example
  if (currentExample) {
    currentExample.update(deltaTime, elapsedTime);
  }
  
  // Update control panel if not initialized
  if (!controlsInitialized) {
    updateControlPanel();
  }
  
  // Render with post-processing
  composer.render(deltaTime);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// Example switching
const exampleSelect = document.getElementById('exampleSelect') as HTMLSelectElement;
exampleSelect.addEventListener('change', (event) => {
  const target = event.target as HTMLSelectElement;
  const newExample = target.value as keyof typeof examples;
  
  if (currentExample) {
    currentExample.dispose();
    // Clear any remaining objects from the scene
    const objectsToRemove = [];
    scene.traverse((child) => {
      if (child !== gradientSky.mesh && child !== stars && child !== directionalLight) {
        objectsToRemove.push(child);
      }
    });
    objectsToRemove.forEach(obj => {
      if (obj.parent) {
        obj.parent.remove(obj);
      }
    });
  }
  
  currentExampleKey = newExample;
  currentExample = examples[newExample]();
  controlsInitialized = false;
  setTimeout(updateControlPanel, 100); // Allow new example to initialize
});

// Control event listeners
renderModeSelect.addEventListener('change', applyControlChanges);
nbParticlesInput.addEventListener('input', applyControlChanges);
intensityInput.addEventListener('input', applyControlChanges);
gravityInput.addEventListener('input', applyControlChanges);
speedMinInput.addEventListener('input', applyControlChanges);
speedMaxInput.addEventListener('input', applyControlChanges);
sizeMinInput.addEventListener('input', applyControlChanges);
sizeMaxInput.addEventListener('input', applyControlChanges);

resetButton.addEventListener('click', () => {
  if (currentExample) {
    if (currentExample.reset) {
      currentExample.reset();
    } else {
      // Fallback: recreate the example
      currentExample.dispose();
      currentExample = examples[currentExampleKey]();
      controlsInitialized = false;
      setTimeout(updateControlPanel, 100);
    }
  }
});

toggleButton.addEventListener('click', () => {
  isEmitting = !isEmitting;
  toggleButton.textContent = isEmitting ? 'Stop Emission' : 'Start Emission';
  
  if (currentExample) {
    if (isEmitting && currentExample.startEmitting) {
      currentExample.startEmitting();
    } else if (!isEmitting && currentExample.stopEmitting) {
      currentExample.stopEmitting();
    }
  }
});

// Start animation
animate();

// Export for external use
(window as any).scene = scene;
(window as any).camera = camera;
(window as any).renderer = renderer;
(window as any).currentExample = () => currentExample;