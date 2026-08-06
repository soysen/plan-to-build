export type ModelType = 'humanoid_male' | 'humanoid_female' | 'quadruped' | 'custom_upload' | 'prop_box' | 'prop_sphere';

export type QuadrupedSpecies = 'canine' | 'feline' | 'equine';

export type HandGesture = 'relaxed' | 'open_palm' | 'fist' | 'pointing' | 'victory' | 'holding';

export type RenderMode = 'solid' | 'wireframe' | 'flat' | 'normals' | 'skeleton';

export type CameraPreset = 'front' | 'side' | 'three_quarter' | 'top' | 'bottom' | 'custom';

export interface CameraState {
  fov: number; // Lens Focal Length / Field of View (15mm to 120mm equivalent)
  presetAngle: CameraPreset;
  showGrid: boolean;
  showAxes: boolean;
}

export interface LightConfig {
  enabled: boolean;
  color: string;
  intensity: number;
  angleX: number;
  angleY: number;
  castShadow?: boolean;
}

export interface LightingState {
  keyLight: LightConfig;
  fillLight: LightConfig;
  rimLight: LightConfig;
  ambientLight: {
    color: string;
    intensity: number;
  };
}

export type JointRotation = { x: number; y: number; z: number };

export interface PoseState {
  presetName: string;
  joints: Record<string, JointRotation>;
  leftHandGesture: HandGesture;
  rightHandGesture: HandGesture;
}

export interface ReferenceImageState {
  src: string | null;
  fileName: string | null;
  overlayOpacity: number;
  showOverlay: boolean;
  isConverting: boolean;
  conversionProgress: number;
  converted3DMeshUrl: string | null;
  removedBackgroundSrc: string | null;
}

export interface StudioConfig {
  modelType: ModelType;
  quadrupedSpecies: QuadrupedSpecies;
  renderMode: RenderMode;
  camera: CameraState;
  lighting: LightingState;
  pose: PoseState;
  reference: ReferenceImageState;
  selectedJoint: string | null;
}
