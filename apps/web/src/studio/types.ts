export type BodyType = 'male' | 'female' | 'muscular' | 'slender' | 'broad' | 'child' | 'teen' | 'chibi';

export type JointName =
  | 'body'
  | 'torso'
  | 'head'
  | 'left_shoulder'
  | 'right_shoulder'
  | 'left_elbow'
  | 'right_elbow'
  | 'left_wrist'
  | 'right_wrist'
  | 'left_hip'
  | 'right_hip'
  | 'left_knee'
  | 'right_knee'
  | 'left_ankle'
  | 'right_ankle';

export interface JointRotation {
  x: number;
  y: number;
  z: number;
}

export interface PoseData {
  name: string;
  joints: Record<JointName, JointRotation>;
}

export type ShotPreset =
  | 'front_medium'
  | 'front_closeup'
  | 'side_follow'
  | 'over_shoulder'
  | 'birdseye'
  | 'dutch_angle'
  | 'back_long'
  | 'three_quarter'
  | 'extreme_closeup'
  | 'wide_angle'
  | 'tracking_left'
  | 'tracking_right'
  | 'low_angle'
  | 'high_angle'
  | 'profile';

export interface CameraShot {
  name: string;
  preset: ShotPreset;
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  fov: number;
}

export interface CameraEntity {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  fov: number;
  isActive: boolean;
  screenshots: string[];
}

export interface CharacterEntity {
  id: string;
  name: string;
  bodyType: BodyType;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  color: string;
  visible: boolean;
  currentPose: string;
  jointRotations: Record<JointName, JointRotation>;
}

export interface PropEntity {
  id: string;
  name: string;
  type: 'box' | 'cylinder' | 'sphere' | 'human' | 'glb';
  glbUrl?: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  color: string;
  visible: boolean;
}

export interface CrowdGroup {
  id: string;
  name: string;
  rows: number;
  cols: number;
  spacing: number;
  bodyType: BodyType;
  characterIds: string[];
  visible: boolean;
}

export interface PanoramaSettings {
  type: 'image' | 'video' | 'gradient';
  url?: string;
  skyColor: string;
  rotation: number;
  radius: number;
}

export interface SceneSettings {
  groundVisible: boolean;
  groundOpacity: number;
  groundHeight: number;
  showCharacterLabels: boolean;
  cameraGrid: boolean;
  aspectRatio: '16:9' | '9:16' | '1:1' | '21:9' | '4:3';
}

export type ViewMode = 'director' | 'camera';

export type TransformMode = 'translate' | 'rotate' | 'scale';

export interface SceneSnapshot {
  characters: CharacterEntity[];
  props: PropEntity[];
  cameras: CameraEntity[];
  crowdGroups: CrowdGroup[];
  panorama: PanoramaSettings;
  settings: SceneSettings;
  selectedId: string | null;
  viewMode: ViewMode;
  activeCameraId: string | null;
}

export interface ScreenshotData {
  id: string;
  cameraId: string;
  cameraName: string;
  url: string;
  timestamp: number;
}

export type PanelTab = 'properties' | 'pose' | 'camera' | 'screenshots';

export type AddMenuType = 'character' | 'crowd' | 'geometry' | 'upload';

export interface AddMenuItem {
  type: AddMenuType;
  label: string;
  icon: string;
}

export interface CharacterAddOption {
  bodyType: BodyType;
  label: string;
}

export interface GeometryAddOption {
  type: 'box' | 'cylinder' | 'sphere' | 'human';
  label: string;
}