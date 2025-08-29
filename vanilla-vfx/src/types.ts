export enum AppearanceMode {
  Square = 0,
  Circular = 1,
}

export enum RenderMode {
  StretchBillboard = "stretchBillboard",
  Billboard = "billboard",
  Mesh = "mesh",
}

export type EaseFunction =
  | "easeLinear"
  | "easeInPower1"
  | "easeOutPower1"
  | "easeInOutPower1"
  | "easeInPower2"
  | "easeOutPower2"
  | "easeInOutPower2"
  | "easeInPower3"
  | "easeOutPower3"
  | "easeInOutPower3"
  | "easeInPower4"
  | "easeOutPower4"
  | "easeInOutPower4"
  | "easeInQuad"
  | "easeOutQuad"
  | "easeInOutQuad"
  | "easeInCubic"
  | "easeOutCubic"
  | "easeInOutCubic"
  | "easeInQuart"
  | "easeOutQuart"
  | "easeInOutQuart"
  | "easeInQuint"
  | "easeOutQuint"
  | "easeInOutQuint"
  | "easeInSine"
  | "easeOutSine"
  | "easeInOutSine"
  | "easeInExpo"
  | "easeOutExpo"
  | "easeInOutExpo"
  | "easeInCirc"
  | "easeOutCirc"
  | "easeInOutCirc"
  | "easeInElastic"
  | "easeOutElastic"
  | "easeInOutElastic"
  | "easeInBack"
  | "easeOutBack"
  | "easeInOutBack"
  | "easeInBounce"
  | "easeOutBounce"
  | "easeInOutBounce";

export const easeFunctionList: EaseFunction[] = [
  "easeLinear",
  "easeInPower1",
  "easeOutPower1",
  "easeInOutPower1",
  "easeInPower2",
  "easeOutPower2",
  "easeInOutPower2",
  "easeInPower3",
  "easeOutPower3",
  "easeInOutPower3",
  "easeInPower4",
  "easeOutPower4",
  "easeInOutPower4",
  "easeInQuad",
  "easeOutQuad",
  "easeInOutQuad",
  "easeInCubic",
  "easeOutCubic",
  "easeInOutCubic",
  "easeInQuart",
  "easeOutQuart",
  "easeInOutQuart",
  "easeInQuint",
  "easeOutQuint",
  "easeInOutQuint",
  "easeInSine",
  "easeOutSine",
  "easeInOutSine",
  "easeInExpo",
  "easeOutExpo",
  "easeInOutExpo",
  "easeInCirc",
  "easeOutCirc",
  "easeInOutCirc",
  "easeInElastic",
  "easeOutElastic",
  "easeInOutElastic",
  "easeInBack",
  "easeOutBack",
  "easeInOutBack",
  "easeInBounce",
  "easeOutBounce",
  "easeInOutBounce",
];

export interface VFXParticlesSettings {
  nbParticles?: number;
  intensity?: number;
  renderMode?: RenderMode;
  stretchScale?: number;
  fadeSize?: [number, number];
  fadeAlpha?: [number, number];
  gravity?: [number, number, number];
  frustumCulled?: boolean;
  appearance?: AppearanceMode;
  easeFunction?: EaseFunction;
  blendingMode?: THREE.Blending;
}

export interface VFXEmitterSettings {
  duration?: number;
  nbParticles?: number;
  spawnMode?: "time" | "burst";
  loop?: boolean;
  delay?: number;
  colorStart?: string[];
  colorEnd?: string[];
  particlesLifetime?: [number, number];
  speed?: [number, number];
  size?: [number, number];
  startPositionMin?: [number, number, number];
  startPositionMax?: [number, number, number];
  startRotationMin?: [number, number, number];
  startRotationMax?: [number, number, number];
  rotationSpeedMin?: [number, number, number];
  rotationSpeedMax?: [number, number, number];
  directionMin?: [number, number, number];
  directionMax?: [number, number, number];
  useLocalDirection?: boolean;
}

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