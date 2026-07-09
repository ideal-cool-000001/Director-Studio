import {
  CharacterEntity,
  PropEntity,
  CameraEntity,
  CrowdGroup,
  PanoramaSettings,
  SceneSettings,
  SceneSnapshot,
  ViewMode,
  TransformMode,
  BodyType,
  JointName,
  JointRotation,
  ShotPreset,
} from './types';
import {
  BODY_TYPES,
  POSE_PRESETS,
  SHOT_PRESETS,
  COLORS,
  STORAGE_KEY,
  DEFAULT_SKY_COLOR,
  DEFAULT_GROUND_OPACITY,
  DEFAULT_GROUND_HEIGHT,
  DEFAULT_PANORAMA_RADIUS,
} from './constants';

type SnapshotListener = (snapshot: SceneSnapshot) => void;

export class SceneEngine {
  private characters: Map<string, CharacterEntity> = new Map();
  private props: Map<string, PropEntity> = new Map();
  private cameras: Map<string, CameraEntity> = new Map();
  private crowdGroups: Map<string, CrowdGroup> = new Map();

  private panorama: PanoramaSettings = {
    type: 'gradient',
    skyColor: DEFAULT_SKY_COLOR,
    rotation: 0,
    radius: DEFAULT_PANORAMA_RADIUS,
  };

  private settings: SceneSettings = {
    groundVisible: true,
    groundOpacity: DEFAULT_GROUND_OPACITY,
    groundHeight: DEFAULT_GROUND_HEIGHT,
    showCharacterLabels: true,
    cameraGrid: true,
    aspectRatio: '16:9',
  };

  private selectedId: string | null = null;
  private viewMode: ViewMode = 'director';
  private activeCameraId: string | null = null;
  private transformMode: TransformMode = 'translate';

  private listeners: Set<SnapshotListener> = new Set();
  private characterCounter = 1;
  private propCounter = 1;
  private cameraCounter = 1;
  private crowdCounter = 1;

  constructor() {
    this.loadFromStorage();
    if (this.characters.size === 0) {
      this.createDefaultScene();
    }
  }

  private createDefaultScene(): void {
    const defaultChar = this.addCharacter('male');
    this.selectEntity(defaultChar.id);

    const defaultCamera = this.addCamera('default');
    this.setActiveCamera(defaultCamera.id);
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  subscribe(listener: SnapshotListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => listener(snapshot));
    this.saveToStorage();
  }

  getSnapshot(): SceneSnapshot {
    return {
      characters: Array.from(this.characters.values()),
      props: Array.from(this.props.values()),
      cameras: Array.from(this.cameras.values()),
      crowdGroups: Array.from(this.crowdGroups.values()),
      panorama: { ...this.panorama },
      settings: { ...this.settings },
      selectedId: this.selectedId,
      viewMode: this.viewMode,
      activeCameraId: this.activeCameraId,
    };
  }

  addCharacter(bodyType: BodyType): CharacterEntity {
    const scale = BODY_TYPES[bodyType].scale;
    const color = COLORS[(this.characterCounter - 1) % COLORS.length];
    const baseRotation: Record<JointName, JointRotation> = {} as Record<JointName, JointRotation>;
    const jointNames: JointName[] = [
      'body', 'torso', 'head', 'left_shoulder', 'right_shoulder',
      'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist',
      'left_hip', 'right_hip', 'left_knee', 'right_knee',
      'left_ankle', 'right_ankle',
    ];
    jointNames.forEach((joint) => {
      baseRotation[joint] = { x: 0, y: 0, z: 0 };
    });

    const char: CharacterEntity = {
      id: this.generateId('char'),
      name: `角色${this.characterCounter++}`,
      bodyType,
      position: { x: (this.characters.size - 1) * 2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale,
      color,
      visible: true,
      currentPose: '站立',
      jointRotations: { ...baseRotation },
    };

    this.characters.set(char.id, char);
    this.notify();
    return char;
  }

  removeCharacter(id: string): void {
    this.characters.delete(id);
    if (this.selectedId === id) {
      this.selectedId = null;
    }
    this.notify();
  }

  updateCharacter(id: string, updates: Partial<CharacterEntity>): void {
    const char = this.characters.get(id);
    if (char) {
      Object.assign(char, updates);
      this.notify();
    }
  }

  setCharacterPose(charId: string, poseName: string): void {
    const char = this.characters.get(charId);
    if (!char) return;

    const pose = POSE_PRESETS.find((p) => p.name === poseName);
    if (pose) {
      char.currentPose = poseName;
      char.jointRotations = { ...pose.joints };
      this.notify();
    }
  }

  resetCharacterPose(charId: string): void {
    this.setCharacterPose(charId, '站立');
  }

  resetAllPoses(): void {
    this.characters.forEach((char) => {
      this.setCharacterPose(char.id, '站立');
    });
  }

  addProp(type: PropEntity['type'], glbUrl?: string): PropEntity {
    const prop: PropEntity = {
      id: this.generateId('prop'),
      name: `道具${this.propCounter++}`,
      type,
      glbUrl,
      position: { x: 0, y: 0.5, z: 2 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color: COLORS[(this.propCounter - 2) % COLORS.length],
      visible: true,
    };

    this.props.set(prop.id, prop);
    this.notify();
    return prop;
  }

  removeProp(id: string): void {
    this.props.delete(id);
    if (this.selectedId === id) {
      this.selectedId = null;
    }
    this.notify();
  }

  updateProp(id: string, updates: Partial<PropEntity>): void {
    const prop = this.props.get(id);
    if (prop) {
      Object.assign(prop, updates);
      this.notify();
    }
  }

  addCrowdGroup(rows: number, cols: number, spacing: number, bodyType: BodyType): CrowdGroup {
    const group: CrowdGroup = {
      id: this.generateId('crowd'),
      name: `群众阵列${this.crowdCounter++}`,
      rows,
      cols,
      spacing,
      bodyType,
      characterIds: [],
      visible: true,
    };

    const total = rows * cols;
    const startX = -(cols - 1) * spacing / 2;
    const startZ = -(rows - 1) * spacing / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const char = this.addCharacter(bodyType);
        char.position = {
          x: startX + c * spacing,
          y: 0,
          z: startZ + r * spacing,
        };
        char.name = `${group.name}-${r + 1}-${c + 1}`;
        group.characterIds.push(char.id);
      }
    }

    this.crowdGroups.set(group.id, group);
    this.notify();
    return group;
  }

  removeCrowdGroup(id: string): void {
    const group = this.crowdGroups.get(id);
    if (group) {
      group.characterIds.forEach((charId) => {
        this.characters.delete(charId);
      });
      this.crowdGroups.delete(id);
      this.notify();
    }
  }

  updateCrowdGroup(id: string, updates: Partial<CrowdGroup>): void {
    const group = this.crowdGroups.get(id);
    if (group) {
      Object.assign(group, updates);
      this.notify();
    }
  }

  addCamera(name?: string): CameraEntity {
    const shot = SHOT_PRESETS.front_medium;
    const camera: CameraEntity = {
      id: this.generateId('cam'),
      name: name || `机位${this.cameraCounter++}`,
      position: { ...shot.position },
      target: { ...shot.target },
      fov: shot.fov,
      isActive: this.cameras.size === 0,
      screenshots: [],
    };

    this.cameras.set(camera.id, camera);
    this.notify();
    return camera;
  }

  removeCamera(id: string): void {
    this.cameras.delete(id);
    if (this.activeCameraId === id) {
      const firstKey = this.cameras.size > 0 ? this.cameras.keys().next().value : null;
    this.activeCameraId = firstKey ?? null;
    }
    if (this.selectedId === id) {
      this.selectedId = null;
    }
    this.notify();
  }

  updateCamera(id: string, updates: Partial<CameraEntity>): void {
    const camera = this.cameras.get(id);
    if (camera) {
      Object.assign(camera, updates);
      this.notify();
    }
  }

  setCameraShot(cameraId: string, preset: ShotPreset): void {
    const camera = this.cameras.get(cameraId);
    if (!camera) return;

    const shot = SHOT_PRESETS[preset];
    if (shot) {
      camera.position = { ...shot.position };
      camera.target = { ...shot.target };
      camera.fov = shot.fov;
      this.notify();
    }
  }

  addCameraScreenshot(cameraId: string, url: string): void {
    const camera = this.cameras.get(cameraId);
    if (camera) {
      camera.screenshots.push(url);
      this.notify();
    }
  }

  clearCameraScreenshots(cameraId: string): void {
    const camera = this.cameras.get(cameraId);
    if (camera) {
      camera.screenshots = [];
      this.notify();
    }
  }

  setActiveCamera(id: string | null): void {
    this.activeCameraId = id;
    this.cameras.forEach((camera) => {
      camera.isActive = camera.id === id;
    });
    this.notify();
  }

  selectEntity(id: string | null): void {
    this.selectedId = id;
    this.notify();
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
    this.notify();
  }

  setTransformMode(mode: TransformMode): void {
    this.transformMode = mode;
  }

  getTransformMode(): TransformMode {
    return this.transformMode;
  }

  deleteSelected(): void {
    if (!this.selectedId) return;

    if (this.characters.has(this.selectedId)) {
      this.removeCharacter(this.selectedId);
    } else if (this.props.has(this.selectedId)) {
      this.removeProp(this.selectedId);
    } else if (this.cameras.has(this.selectedId)) {
      this.removeCamera(this.selectedId);
    }
  }

  updatePanorama(updates: Partial<PanoramaSettings>): void {
    Object.assign(this.panorama, updates);
    this.notify();
  }

  updateSettings(updates: Partial<SceneSettings>): void {
    Object.assign(this.settings, updates);
    this.notify();
  }

  saveToStorage(): void {
    try {
      const snapshot = this.getSnapshot();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (e) {
      console.warn('Failed to save scene to storage:', e);
    }
  }

  loadFromStorage(): void {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const snapshot: SceneSnapshot = JSON.parse(data);
        this.characters = new Map(snapshot.characters.map((c) => [c.id, c]));
        this.props = new Map(snapshot.props.map((p) => [p.id, p]));
        this.cameras = new Map(snapshot.cameras.map((c) => [c.id, c]));
        this.crowdGroups = new Map(snapshot.crowdGroups.map((g) => [g.id, g]));
        this.panorama = snapshot.panorama;
        this.settings = snapshot.settings;
        this.selectedId = snapshot.selectedId;
        this.viewMode = snapshot.viewMode;
        this.activeCameraId = snapshot.activeCameraId;

        const maxChar = Math.max(
          ...Array.from(this.characters.values()).map((c) => {
            const match = c.name.match(/角色(\d+)/);
            return match ? parseInt(match[1]) : 0;
          }),
          0
        );
        this.characterCounter = maxChar + 1;

        const maxProp = Math.max(
          ...Array.from(this.props.values()).map((p) => {
            const match = p.name.match(/道具(\d+)/);
            return match ? parseInt(match[1]) : 0;
          }),
          0
        );
        this.propCounter = maxProp + 1;

        const maxCam = Math.max(
          ...Array.from(this.cameras.values()).map((c) => {
            const match = c.name.match(/机位(\d+)/);
            return match ? parseInt(match[1]) : 0;
          }),
          0
        );
        this.cameraCounter = maxCam + 1;
      }
    } catch (e) {
      console.warn('Failed to load scene from storage:', e);
    }
  }

  clearStorageAndReset(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.characters.clear();
    this.props.clear();
    this.cameras.clear();
    this.crowdGroups.clear();
    this.selectedId = null;
    this.activeCameraId = null;
    this.viewMode = 'director';
    this.panorama = {
      type: 'gradient',
      skyColor: DEFAULT_SKY_COLOR,
      rotation: 0,
      radius: DEFAULT_PANORAMA_RADIUS,
    };
    this.settings = {
      groundVisible: true,
      groundOpacity: DEFAULT_GROUND_OPACITY,
      groundHeight: DEFAULT_GROUND_HEIGHT,
      showCharacterLabels: true,
      cameraGrid: true,
      aspectRatio: '16:9',
    };
    this.createDefaultScene();
  }

  getEntityType(id: string): 'character' | 'prop' | 'camera' | 'crowd' | null {
    if (this.characters.has(id)) return 'character';
    if (this.props.has(id)) return 'prop';
    if (this.cameras.has(id)) return 'camera';
    if (this.crowdGroups.has(id)) return 'crowd';
    return null;
  }

  getCharacter(id: string): CharacterEntity | undefined {
    return this.characters.get(id);
  }

  getProp(id: string): PropEntity | undefined {
    return this.props.get(id);
  }

  getCamera(id: string): CameraEntity | undefined {
    return this.cameras.get(id);
  }

  getActiveCamera(): CameraEntity | undefined {
    return this.activeCameraId ? this.cameras.get(this.activeCameraId) : undefined;
  }
}