import * as THREE from 'three';

export class GradientSky {
  public mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;

  constructor() {
    const geometry = new THREE.SphereGeometry(40);
    
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        colorTop: { value: new THREE.Color('#000000') },
        colorMiddle: { value: new THREE.Color('#221341') },
        colorBottom: { value: new THREE.Color('#0a0a0a') },
        blendMiddle: { value: 0.24 },
        blendIntensity: { value: 0.29 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 colorTop;
        uniform vec3 colorBottom;
        uniform vec3 colorMiddle;
        uniform float blendMiddle;
        uniform float blendIntensity;
        varying vec2 vUv;
        
        void main() {
          vec3 mixedTop = mix(colorMiddle, colorTop, smoothstep(0.498, 0.502, vUv.y));
          vec3 mixedBottom = mix(colorMiddle, colorBottom, smoothstep(0.502, 0.498, vUv.y));

          vec3 mixedColor = mix(colorBottom, colorTop, smoothstep(0.45, 0.55, vUv.y));
          float blendMiddle = smoothstep(0.5-blendMiddle, 0.5, vUv.y) * smoothstep(0.5 + blendMiddle, 0.5, vUv.y) * blendIntensity;
          vec3 finalColor = mix(mixedColor, colorMiddle, blendMiddle);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.rotation.x = THREE.MathUtils.degToRad(-5);
  }

  public dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}