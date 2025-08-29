import * as THREE from 'three';
import { AppearanceMode, RenderMode, VFXParticlesSettings, EaseFunction, easeFunctionList } from './types';
import { easings } from './shaders/easings';

export interface EmitCallbackSettings {
  position: [number, number, number];
  direction: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
  rotationSpeed: [number, number, number];
  lifetime: [number, number];
  colorStart: string;
  colorEnd: string;
  speed: [number];
}

export type EmitCallbackSettingsFn = () => EmitCallbackSettings;

export class VFXParticles {
  public mesh: THREE.InstancedMesh;
  private cursor: number = 0;
  private lastCursor: number = 0;
  private needsUpdate: boolean = false;
  private settings: Required<VFXParticlesSettings>;
  private attributeArrays: {
    instanceColor: Float32Array;
    instanceColorEnd: Float32Array;
    instanceDirection: Float32Array;
    instanceLifetime: Float32Array;
    instanceSpeed: Float32Array;
    instanceRotationSpeed: Float32Array;
  };

  constructor(settings: VFXParticlesSettings = {}, alphaMap?: THREE.Texture, geometry?: THREE.BufferGeometry) {
    this.settings = {
      nbParticles: 1000,
      intensity: 1,
      renderMode: RenderMode.Mesh,
      stretchScale: 1.0,
      fadeSize: [0.1, 0.9],
      fadeAlpha: [0, 1.0],
      gravity: [0, 0, 0],
      frustumCulled: true,
      appearance: AppearanceMode.Square,
      easeFunction: "easeLinear",
      blendingMode: THREE.AdditiveBlending,
      ...settings
    };

    // Create attribute arrays
    this.attributeArrays = {
      instanceColor: new Float32Array(this.settings.nbParticles * 3),
      instanceColorEnd: new Float32Array(this.settings.nbParticles * 3),
      instanceDirection: new Float32Array(this.settings.nbParticles * 3),
      instanceLifetime: new Float32Array(this.settings.nbParticles * 2),
      instanceSpeed: new Float32Array(this.settings.nbParticles * 1),
      instanceRotationSpeed: new Float32Array(this.settings.nbParticles * 3),
    };

    // Create geometry
    const particleGeometry = geometry || new THREE.PlaneGeometry(0.5, 0.5);
    
    // Add instance attributes
    particleGeometry.setAttribute('instanceColor', 
      new THREE.InstancedBufferAttribute(this.attributeArrays.instanceColor, 3));
    particleGeometry.setAttribute('instanceColorEnd', 
      new THREE.InstancedBufferAttribute(this.attributeArrays.instanceColorEnd, 3));
    particleGeometry.setAttribute('instanceDirection', 
      new THREE.InstancedBufferAttribute(this.attributeArrays.instanceDirection, 3));
    particleGeometry.setAttribute('instanceLifetime', 
      new THREE.InstancedBufferAttribute(this.attributeArrays.instanceLifetime, 2));
    particleGeometry.setAttribute('instanceSpeed', 
      new THREE.InstancedBufferAttribute(this.attributeArrays.instanceSpeed, 1));
    particleGeometry.setAttribute('instanceRotationSpeed', 
      new THREE.InstancedBufferAttribute(this.attributeArrays.instanceRotationSpeed, 3));

    // Create material
    const material = this.createMaterial(alphaMap);

    // Create instanced mesh
    this.mesh = new THREE.InstancedMesh(particleGeometry, material, this.settings.nbParticles);
    this.mesh.frustumCulled = this.settings.frustumCulled;
    this.mesh.onBeforeRender = this.onBeforeRender.bind(this);
  }

  private createMaterial(alphaMap?: THREE.Texture): THREE.ShaderMaterial {
    const easingIndex = easeFunctionList.indexOf(this.settings.easeFunction);
    
    const defines: Record<string, boolean> = {
      STRETCH_BILLBOARD_MODE: this.settings.renderMode === RenderMode.StretchBillboard,
      BILLBOARD_MODE: this.settings.renderMode === RenderMode.Billboard,
      MESH_MODE: this.settings.renderMode === RenderMode.Mesh,
    };

    if (alphaMap) {
      defines.USE_ALPHAMAP = true;
    }

    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: this.settings.intensity },
        uStretchScale: { value: this.settings.stretchScale },
        uFadeSize: { value: this.settings.fadeSize },
        uFadeAlpha: { value: this.settings.fadeAlpha },
        uGravity: { value: this.settings.gravity },
        uAppearanceMode: { value: this.settings.appearance },
        uEasingFunction: { value: easingIndex },
        alphaMap: { value: alphaMap || null },
      },
      vertexShader: this.getVertexShader(),
      fragmentShader: this.getFragmentShader(),
      transparent: true,
      blending: this.settings.blendingMode,
      depthWrite: false,
      defines,
    });
  }

  private getVertexShader(): string {
    return `
${easings}

mat4 rotationX(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat4(
      1,  0,  0,  0,
      0,  c, -s,  0,
      0,  s,  c,  0,
      0,  0,  0,  1
  );
}

mat4 rotationY(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat4(
        c,  0,  s,  0,
        0,  1,  0,  0,
      -s,  0,  c,  0,
        0,  0,  0,  1
  );
}

mat4 rotationZ(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat4(
      c, -s,  0,  0,
      s,  c,  0,  0,
      0,  0,  1,  0,
      0,  0,  0,  1
  );
}

uniform float uTime;
uniform vec2 uFadeSize;
uniform vec3 uGravity;
uniform float uStretchScale;
uniform int uEasingFunction;

varying vec2 vUv;
varying vec3 vColor;
varying vec3 vColorEnd;
varying float vProgress;

attribute float instanceSpeed;
attribute vec3 instanceRotationSpeed;
attribute vec3 instanceDirection;
attribute vec3 instanceColor;
attribute vec3 instanceColorEnd;
attribute vec2 instanceLifetime; // x: startTime, y: duration

void main() {
  float startTime = instanceLifetime.x;
  float duration = instanceLifetime.y;
  float age = uTime - startTime;

  // Adjust age based on instanceSpeed direction
  age = instanceSpeed < 0.0 ? duration - (uTime - startTime) : uTime - startTime;
  float progress = clamp(age / duration, 0.0, 1.0);
  vProgress = applyEasing(progress, uEasingFunction);

  if (vProgress < 0.0 || vProgress > 1.0) {
    gl_Position = vec4(vec3(9999.0), 1.0);
    return;
  }

  float scale = smoothstep(0.0, uFadeSize.x, vProgress) * smoothstep(1.01, uFadeSize.y, vProgress);

  vec3 normalizedDirection = length(instanceDirection) > 0.0 ? normalize(instanceDirection) : vec3(0.0);
  vec3 gravityForce = 0.5 * uGravity * (age * age);
  float easedAge = vProgress * duration;
  vec3 offset = normalizedDirection * easedAge * instanceSpeed;
  offset += gravityForce;

  vec3 rotationSpeed = instanceRotationSpeed * age;
  mat4 rotX = rotationX(rotationSpeed.x);
  mat4 rotY = rotationY(rotationSpeed.y);
  mat4 rotZ = rotationZ(rotationSpeed.z);
  mat4 rotationMatrix = rotZ * rotY * rotX;

  vec4 mvPosition;
  #ifdef MESH_MODE
    vec4 startPosition = modelMatrix * instanceMatrix * rotationMatrix * vec4(position * scale, 1.0);
    vec3 instancePosition = startPosition.xyz;
    vec3 finalPosition = instancePosition + offset;
    mvPosition = modelViewMatrix * vec4(finalPosition, 1.0);
  #endif
  
  #ifdef BILLBOARD_MODE
    vec3 instancePosition = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz + offset;
    vec3 localZ = normalize(cameraPosition - instancePosition);
    vec3 worldUp = vec3(0.0, 1.0, 0.0);
    vec3 localX = normalize(cross(worldUp, localZ));
    vec3 localY = cross(localZ, localX);
    mat3 billboardMatrix = mat3(localX, localY, localZ);

    float scaleX = length(instanceMatrix[0].xyz);
    float scaleY = length(instanceMatrix[1].xyz);
    float scaleZ = length(instanceMatrix[2].xyz);
    vec3 instanceScale = vec3(scaleX, scaleY, scaleZ);

    mat3 finalMatrix = billboardMatrix * mat3(rotationMatrix);
    vec3 finalRight = finalMatrix[0] * instanceScale * scale;
    vec3 finalUp = finalMatrix[1] * instanceScale * scale;
    vec3 vertexWorldPos = instancePosition + finalRight * position.x + finalUp * position.y;
    mvPosition = viewMatrix * vec4(vertexWorldPos, 1.0);
  #endif
  
  #ifdef STRETCH_BILLBOARD_MODE
    vec3 particleWorldPos = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz + offset;
    vec3 worldVelocity = normalizedDirection * instanceSpeed + uGravity * age;
    float currentSpeed = length(worldVelocity);

    if (currentSpeed < 0.001) {
      vec3 instancePositionBillboard = particleWorldPos;
      vec3 camUpWorld = normalize(vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]));
      vec3 eyeVecBillboard = normalize(cameraPosition - instancePositionBillboard);
      vec3 bLocalX = normalize(cross(camUpWorld, eyeVecBillboard));

      if (length(bLocalX) < 0.001) {
        bLocalX = normalize(vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]));
      }
      vec3 bLocalY = normalize(cross(eyeVecBillboard, bLocalX));
      mat3 billboardBasis = mat3(bLocalX, bLocalY, eyeVecBillboard);

      float instScaleX = length(instanceMatrix[0].xyz);
      float instScaleY = length(instanceMatrix[1].xyz);

      mat3 rotatedBillboardBasis = billboardBasis * mat3(rotationMatrix);
      vec3 finalRight = rotatedBillboardBasis[0] * instScaleX * scale;
      vec3 finalUp = rotatedBillboardBasis[1] * instScaleY * scale;
      vec3 vertexWorldPos = instancePositionBillboard + finalRight * position.x + finalUp * position.y;
      mvPosition = viewMatrix * vec4(vertexWorldPos, 1.0);
    } else { 
      vec3 eyeVector = normalize(cameraPosition - particleWorldPos);
      vec3 tangent = normalize(worldVelocity); 
      vec3 projectedTangent = tangent - dot(tangent, eyeVector) * eyeVector;

      vec3 particlePlaneUp;
      vec3 particlePlaneRight; 

      if (length(projectedTangent) < 0.001) {
        particlePlaneUp = tangent;
        vec3 camUpWorld = normalize(vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]));
        particlePlaneRight = normalize(cross(particlePlaneUp, camUpWorld));

        if (length(particlePlaneRight) < 0.001) {
          vec3 camRightWorld = normalize(vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]));
          particlePlaneRight = normalize(cross(particlePlaneUp, camRightWorld));
        }
      } else {
        particlePlaneUp = normalize(projectedTangent);
        particlePlaneRight = normalize(cross(particlePlaneUp, eyeVector));
      }

      float baseWidth = length(instanceMatrix[0].xyz);
      float baseLength = length(instanceMatrix[1].xyz);
      float wid = baseWidth * scale;
      float len = baseLength * scale * (1.0 + currentSpeed * uStretchScale);

      float zAngle = instanceRotationSpeed.z * age;
      mat2 spinMatrix = mat2(cos(zAngle), -sin(zAngle), sin(zAngle), cos(zAngle));
      vec2 localSpunPos = spinMatrix * position.xy;

      vec3 worldSpaceVertexOffset = particlePlaneRight * localSpunPos.x * wid +
                                    particlePlaneUp * localSpunPos.y * len;

      vec3 finalVertexPos = particleWorldPos + worldSpaceVertexOffset;
      mvPosition = viewMatrix * vec4(finalVertexPos, 1.0);
    }
  #endif

  gl_Position = projectionMatrix * mvPosition;
  vUv = uv;
  vColor = instanceColor;
  vColorEnd = instanceColorEnd;
}`;
  }

  private getFragmentShader(): string {
    return `
uniform float uIntensity;
uniform vec2 uFadeAlpha;
uniform sampler2D alphaMap;
uniform int uAppearanceMode;

varying vec3 vColor;
varying vec3 vColorEnd;
varying float vProgress;
varying vec2 vUv;

void main() {
  if (vProgress < 0.0 || vProgress > 1.0) {
    discard;
  }
  vec3 finalColor = mix(vColor, vColorEnd, vProgress);
  finalColor *= uIntensity;

  float alpha = smoothstep(0.0, uFadeAlpha.x, vProgress) * smoothstep(1.01, uFadeAlpha.y, vProgress);

  #ifdef USE_ALPHAMAP
    vec2 uv = vUv;
    vec4 tex = texture2D(alphaMap, uv);
    gl_FragColor = vec4(finalColor, tex.a * alpha);
  #else
    if(uAppearanceMode == 1){ // Circular
      vec2 center = vec2(0.5);
      float dist = distance(vUv, center);
      
      if(dist > 0.5){
        discard; // creating circular shape 
      }
    }
    gl_FragColor = vec4(finalColor, alpha);
  #endif
}`;
  }

  private onBeforeRender(): void {
    if (!this.needsUpdate || !this.mesh) {
      return;
    }

    const attributes = [
      this.mesh.instanceMatrix,
      this.mesh.geometry.getAttribute("instanceColor"),
      this.mesh.geometry.getAttribute("instanceColorEnd"),
      this.mesh.geometry.getAttribute("instanceDirection"),
      this.mesh.geometry.getAttribute("instanceLifetime"),
      this.mesh.geometry.getAttribute("instanceSpeed"),
      this.mesh.geometry.getAttribute("instanceRotationSpeed"),
    ];

    attributes.forEach((attr) => {
      const attribute = attr as THREE.InstancedBufferAttribute;
      attribute.clearUpdateRanges();
      if (this.lastCursor > this.cursor) {
        attribute.addUpdateRange(0, this.cursor * attribute.itemSize);
        attribute.addUpdateRange(
          this.lastCursor * attribute.itemSize,
          this.settings.nbParticles * attribute.itemSize - this.lastCursor * attribute.itemSize
        );
      } else {
        attribute.addUpdateRange(
          this.lastCursor * attribute.itemSize,
          this.cursor * attribute.itemSize - this.lastCursor * attribute.itemSize
        );
      }
      attribute.needsUpdate = true;
    });
    this.lastCursor = this.cursor;
    this.needsUpdate = false;
  }

  public emit(count: number, setup: EmitCallbackSettingsFn): void {
    const instanceColor = this.mesh.geometry.getAttribute("instanceColor") as THREE.BufferAttribute;
    const instanceColorEnd = this.mesh.geometry.getAttribute("instanceColorEnd") as THREE.BufferAttribute;
    const instanceDirection = this.mesh.geometry.getAttribute("instanceDirection") as THREE.BufferAttribute;
    const instanceLifetime = this.mesh.geometry.getAttribute("instanceLifetime") as THREE.BufferAttribute;
    const instanceSpeed = this.mesh.geometry.getAttribute("instanceSpeed") as THREE.BufferAttribute;
    const instanceRotationSpeed = this.mesh.geometry.getAttribute("instanceRotationSpeed") as THREE.BufferAttribute;

    const tmpPosition = new THREE.Vector3();
    const tmpRotationEuler = new THREE.Euler();
    const tmpRotation = new THREE.Quaternion();
    const tmpScale = new THREE.Vector3(1, 1, 1);
    const tmpMatrix = new THREE.Matrix4();
    const tmpColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
      if (this.cursor >= this.settings.nbParticles) {
        this.cursor = 0;
      }

      const {
        scale,
        rotation,
        rotationSpeed,
        position,
        direction,
        lifetime,
        colorStart,
        colorEnd,
        speed,
      } = setup();

      tmpPosition.set(...position);
      tmpRotationEuler.set(...rotation);
      
      if (this.settings.renderMode === RenderMode.Billboard || this.settings.renderMode === RenderMode.StretchBillboard) {
        tmpRotationEuler.x = 0;
        tmpRotationEuler.y = 0;
      }
      
      tmpRotation.setFromEuler(tmpRotationEuler);
      tmpScale.set(...scale);
      tmpMatrix.compose(tmpPosition, tmpRotation, tmpScale);
      this.mesh.setMatrixAt(this.cursor, tmpMatrix);

      tmpColor.set(colorStart);
      instanceColor.setXYZ(this.cursor, tmpColor.r, tmpColor.g, tmpColor.b);
      
      tmpColor.set(colorEnd);
      instanceColorEnd.setXYZ(this.cursor, tmpColor.r, tmpColor.g, tmpColor.b);
      
      instanceDirection.setXYZ(this.cursor, direction[0], direction[1], direction[2]);
      instanceLifetime.setXY(this.cursor, lifetime[0], lifetime[1]);
      instanceSpeed.setX(this.cursor, speed[0]);
      instanceRotationSpeed.setXYZ(this.cursor, rotationSpeed[0], rotationSpeed[1], rotationSpeed[2]);
      
      this.cursor++;
      this.cursor = this.cursor % this.settings.nbParticles;
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    instanceColor.needsUpdate = true;
    instanceColorEnd.needsUpdate = true;
    instanceDirection.needsUpdate = true;
    instanceLifetime.needsUpdate = true;
    instanceSpeed.needsUpdate = true;
    instanceRotationSpeed.needsUpdate = true;
    this.needsUpdate = true;
  }

  public update(elapsedTime: number): void {
    if (!this.mesh) return;
    
    const material = this.mesh.material as THREE.ShaderMaterial;
    material.uniforms.uTime.value = elapsedTime;
    material.uniforms.uIntensity.value = this.settings.intensity;
    material.uniforms.uStretchScale.value = this.settings.stretchScale;
    material.uniforms.uFadeSize.value = this.settings.fadeSize;
    material.uniforms.uFadeAlpha.value = this.settings.fadeAlpha;
    material.uniforms.uGravity.value = this.settings.gravity;
    material.uniforms.uAppearanceMode.value = this.settings.appearance;
  }

  public dispose(): void {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}