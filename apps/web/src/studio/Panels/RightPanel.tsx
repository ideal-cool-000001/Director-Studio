import { useState } from 'react';
import { SceneSnapshot, PanelTab, ShotPreset } from '../types';
import { POSE_PRESETS, SHOT_PRESETS, SHOT_PRESET_GROUPS, COLORS, ASPECT_RATIOS } from '../constants';

interface RightPanelProps {
  snapshot: SceneSnapshot;
  selectedId: string | null;
  onUpdateCharacter: (id: string, updates: Partial<SceneSnapshot['characters'][0]>) => void;
  onUpdateProp: (id: string, updates: Partial<SceneSnapshot['props'][0]>) => void;
  onUpdateCamera: (id: string, updates: Partial<SceneSnapshot['cameras'][0]>) => void;
  onSetCharacterPose: (charId: string, poseName: string) => void;
  onSetCameraShot: (cameraId: string, preset: ShotPreset) => void;
  onUpdatePanorama: (updates: Partial<SceneSnapshot['panorama']>) => void;
  onUpdateSettings: (updates: Partial<SceneSnapshot['settings']>) => void;
  onCameraScreenshot: (cameraId: string) => void;
}

function SceneSettingsPanel({ snapshot, onUpdatePanorama, onUpdateSettings }: {
  snapshot: SceneSnapshot;
  onUpdatePanorama: (updates: Partial<SceneSnapshot['panorama']>) => void;
  onUpdateSettings: (updates: Partial<SceneSnapshot['settings']>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-secondary text-xs font-semibold uppercase tracking-wider mb-3">全景背景</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-secondary text-sm">天空颜色</span>
            <input
              type="color"
              value={snapshot.panorama.skyColor}
              onChange={(e) => onUpdatePanorama({ skyColor: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-primary"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-secondary text-sm">水平旋转</span>
            <input
              type="range"
              min="-180"
              max="180"
              value={snapshot.panorama.rotation}
              onChange={(e) => onUpdatePanorama({ rotation: parseFloat(e.target.value) })}
              className="w-32 accent-accent"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-secondary text-sm">球形半径</span>
            <input
              type="range"
              min="20"
              max="100"
              value={snapshot.panorama.radius}
              onChange={(e) => onUpdatePanorama({ radius: parseFloat(e.target.value) })}
              className="w-32 accent-accent"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-secondary text-xs font-semibold uppercase tracking-wider mb-3">场景设置</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={snapshot.settings.groundVisible}
              onChange={(e) => onUpdateSettings({ groundVisible: e.target.checked })}
              className="w-4 h-4 rounded border-primary bg-card accent-accent"
            />
            <span className="text-secondary text-sm">显示地面</span>
          </label>
          <div className="flex items-center justify-between">
            <span className="text-secondary text-sm">地面透明度</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={snapshot.settings.groundOpacity}
              onChange={(e) => onUpdateSettings({ groundOpacity: parseFloat(e.target.value) })}
              className="w-32 accent-accent"
            />
          </div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={snapshot.settings.showCharacterLabels}
              onChange={(e) => onUpdateSettings({ showCharacterLabels: e.target.checked })}
              className="w-4 h-4 rounded border-primary bg-card accent-accent"
            />
            <span className="text-secondary text-sm">角色标签</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={snapshot.settings.cameraGrid}
              onChange={(e) => onUpdateSettings({ cameraGrid: e.target.checked })}
              className="w-4 h-4 rounded border-primary bg-card accent-accent"
            />
            <span className="text-secondary text-sm">取景网格</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-secondary text-xs font-semibold uppercase tracking-wider mb-3">画幅比例</h3>
        <div className="grid grid-cols-2 gap-2">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.value}
              onClick={() => onUpdateSettings({ aspectRatio: ratio.value as SceneSnapshot['settings']['aspectRatio'] })}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                snapshot.settings.aspectRatio === ratio.value
                  ? 'bg-accent text-black font-medium'
                  : 'bg-card text-secondary hover:text-primary hover:bg-hover border border-primary'
              }`}
            >
              {ratio.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CharacterPanel({ character, onUpdateCharacter, onSetCharacterPose }: {
  character: SceneSnapshot['characters'][0];
  onUpdateCharacter: (id: string, updates: Partial<SceneSnapshot['characters'][0]>) => void;
  onSetCharacterPose: (charId: string, poseName: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<PanelTab>('properties');

  return (
    <div>
      <div className="flex border-b border-primary mb-4">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-2 text-sm font-medium transition-all relative ${
            activeTab === 'properties' ? 'text-accent' : 'text-secondary hover:text-primary'
          }`}
        >
          属性
          {activeTab === 'properties' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('pose')}
          className={`flex-1 py-2 text-sm font-medium transition-all relative ${
            activeTab === 'pose' ? 'text-accent' : 'text-secondary hover:text-primary'
          }`}
        >
          姿势
          {activeTab === 'pose' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>
      </div>

      {activeTab === 'properties' && (
        <div className="space-y-5">
          <div>
            <label className="text-secondary text-xs block mb-2">名称</label>
            <input
              type="text"
              value={character.name}
              onChange={(e) => onUpdateCharacter(character.id, { name: e.target.value })}
              className="w-full px-3 py-2 bg-card text-primary text-sm rounded-lg border border-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="text-secondary text-xs block mb-2">位置</label>
            <div className="grid grid-cols-3 gap-2">
              {(['x', 'y', 'z'] as const).map((axis) => (
                <div key={axis}>
                  <span className="text-muted text-xs block mb-1">{axis.toUpperCase()}</span>
                  <input
                    type="number"
                    step="0.1"
                    value={character.position[axis]}
                    onChange={(e) => onUpdateCharacter(character.id, { position: { ...character.position, [axis]: parseFloat(e.target.value) } })}
                    className="w-full px-2 py-1.5 bg-card text-primary text-sm rounded-lg border border-primary focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-secondary text-xs block mb-2">旋转</label>
            <div className="grid grid-cols-3 gap-2">
              {(['x', 'y', 'z'] as const).map((axis) => (
                <div key={axis}>
                  <span className="text-muted text-xs block mb-1">{axis.toUpperCase()}</span>
                  <input
                    type="number"
                    step="1"
                    value={character.rotation[axis]}
                    onChange={(e) => onUpdateCharacter(character.id, { rotation: { ...character.rotation, [axis]: parseFloat(e.target.value) } })}
                    className="w-full px-2 py-1.5 bg-card text-primary text-sm rounded-lg border border-primary focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-secondary text-xs block mb-2">颜色</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={character.color}
                onChange={(e) => onUpdateCharacter(character.id, { color: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-primary"
              />
              <div className="flex flex-wrap gap-1.5">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => onUpdateCharacter(character.id, { color })}
                    className={`w-5 h-5 rounded-lg border-2 transition-all ${character.color === color ? 'border-accent scale-110' : 'border-transparent hover:border-primary'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pose' && (
        <div className="space-y-5">
          <div>
            <label className="text-secondary text-xs block mb-2">姿势预设</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {POSE_PRESETS.map((pose) => (
                <button
                  key={pose.name}
                  onClick={() => onSetCharacterPose(character.id, pose.name)}
                  className={`px-3 py-2 text-sm rounded-lg transition-all ${
                    character.currentPose === pose.name
                      ? 'bg-accent text-black font-medium'
                      : 'bg-card text-secondary hover:text-primary hover:bg-hover border border-primary'
                  }`}
                >
                  {pose.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onSetCharacterPose(character.id, '站立')}
              className="flex-1 px-4 py-2 bg-card hover:bg-hover text-secondary hover:text-primary text-sm rounded-lg border border-primary transition-all"
            >
              复位姿势
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PropPanel({ prop, onUpdateProp }: {
  prop: SceneSnapshot['props'][0];
  onUpdateProp: (id: string, updates: Partial<SceneSnapshot['props'][0]>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className="text-secondary text-xs block mb-2">名称</label>
        <input
          type="text"
          value={prop.name}
          onChange={(e) => onUpdateProp(prop.id, { name: e.target.value })}
          className="w-full px-3 py-2 bg-card text-primary text-sm rounded-lg border border-primary focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div>
        <label className="text-secondary text-xs block mb-2">位置</label>
        <div className="grid grid-cols-3 gap-2">
          {(['x', 'y', 'z'] as const).map((axis) => (
            <div key={axis}>
              <span className="text-muted text-xs block mb-1">{axis.toUpperCase()}</span>
              <input
                type="number"
                step="0.1"
                value={prop.position[axis]}
                onChange={(e) => onUpdateProp(prop.id, { position: { ...prop.position, [axis]: parseFloat(e.target.value) } })}
                className="w-full px-2 py-1.5 bg-card text-primary text-sm rounded-lg border border-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-secondary text-xs block mb-2">旋转</label>
        <div className="grid grid-cols-3 gap-2">
          {(['x', 'y', 'z'] as const).map((axis) => (
            <div key={axis}>
              <span className="text-muted text-xs block mb-1">{axis.toUpperCase()}</span>
              <input
                type="number"
                step="1"
                value={prop.rotation[axis]}
                onChange={(e) => onUpdateProp(prop.id, { rotation: { ...prop.rotation, [axis]: parseFloat(e.target.value) } })}
                className="w-full px-2 py-1.5 bg-card text-primary text-sm rounded-lg border border-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-secondary text-xs block mb-2">缩放</label>
        <div className="grid grid-cols-3 gap-2">
          {(['x', 'y', 'z'] as const).map((axis) => (
            <div key={axis}>
              <span className="text-muted text-xs block mb-1">{axis.toUpperCase()}</span>
              <input
                type="number"
                step="0.1"
                value={prop.scale[axis]}
                onChange={(e) => onUpdateProp(prop.id, { scale: { ...prop.scale, [axis]: parseFloat(e.target.value) } })}
                className="w-full px-2 py-1.5 bg-card text-primary text-sm rounded-lg border border-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-secondary text-xs block mb-2">颜色</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={prop.color}
            onChange={(e) => onUpdateProp(prop.id, { color: e.target.value })}
            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-primary"
          />
          <div className="flex flex-wrap gap-1.5">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onUpdateProp(prop.id, { color })}
                className={`w-5 h-5 rounded-lg border-2 transition-all ${prop.color === color ? 'border-accent scale-110' : 'border-transparent hover:border-primary'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CameraPanel({ camera, onUpdateCamera, onSetCameraShot, onCameraScreenshot }: {
  camera: SceneSnapshot['cameras'][0];
  onUpdateCamera: (id: string, updates: Partial<SceneSnapshot['cameras'][0]>) => void;
  onSetCameraShot: (cameraId: string, preset: ShotPreset) => void;
  onCameraScreenshot: (cameraId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<PanelTab>('camera');

  return (
    <div>
      <div className="flex border-b border-primary mb-4">
        <button
          onClick={() => setActiveTab('camera')}
          className={`flex-1 py-2 text-sm font-medium transition-all relative ${
            activeTab === 'camera' ? 'text-accent' : 'text-secondary hover:text-primary'
          }`}
        >
          机位
          {activeTab === 'camera' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('screenshots')}
          className={`flex-1 py-2 text-sm font-medium transition-all relative ${
            activeTab === 'screenshots' ? 'text-accent' : 'text-secondary hover:text-primary'
          }`}
        >
          截图 ({camera.screenshots.length})
          {activeTab === 'screenshots' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>
      </div>

      {activeTab === 'camera' && (
        <div className="space-y-5">
          <div>
            <label className="text-secondary text-xs block mb-2">名称</label>
            <input
              type="text"
              value={camera.name}
              onChange={(e) => onUpdateCamera(camera.id, { name: e.target.value })}
              className="w-full px-3 py-2 bg-card text-primary text-sm rounded-lg border border-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="text-secondary text-xs block mb-2">位置</label>
            <div className="grid grid-cols-3 gap-2">
              {(['x', 'y', 'z'] as const).map((axis) => (
                <div key={axis}>
                  <span className="text-muted text-xs block mb-1">{axis.toUpperCase()}</span>
                  <input
                    type="number"
                    step="0.1"
                    value={camera.position[axis]}
                    onChange={(e) => onUpdateCamera(camera.id, { position: { ...camera.position, [axis]: parseFloat(e.target.value) } })}
                    className="w-full px-2 py-1.5 bg-card text-primary text-sm rounded-lg border border-primary focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-secondary text-xs block mb-2">注视目标</label>
            <div className="grid grid-cols-3 gap-2">
              {(['x', 'y', 'z'] as const).map((axis) => (
                <div key={axis}>
                  <span className="text-muted text-xs block mb-1">{axis.toUpperCase()}</span>
                  <input
                    type="number"
                    step="0.1"
                    value={camera.target[axis]}
                    onChange={(e) => onUpdateCamera(camera.id, { target: { ...camera.target, [axis]: parseFloat(e.target.value) } })}
                    className="w-full px-2 py-1.5 bg-card text-primary text-sm rounded-lg border border-primary focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-secondary text-xs block mb-2">FOV</label>
            <input
              type="range"
              min="20"
              max="120"
              value={camera.fov}
              onChange={(e) => onUpdateCamera(camera.id, { fov: parseFloat(e.target.value) })}
              className="w-full accent-accent"
            />
            <span className="text-secondary text-sm mt-1 block">{camera.fov}°</span>
          </div>

          <div>
            <label className="text-secondary text-xs block mb-2">运镜预设</label>
            <div className="space-y-2">
              {Object.entries(SHOT_PRESET_GROUPS).map(([group, presets]) => (
                <div key={group}>
                  <span className="text-muted text-xs block mb-1">
                    {group === 'front' ? '正面' : group === 'side_back' ? '侧背' : group === 'angle' ? '角度' : '特殊'}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {presets.map((preset) => {
                      const shot = SHOT_PRESETS[preset];
                      return (
                        <button
                          key={preset}
                          onClick={() => onSetCameraShot(camera.id, preset)}
                          className="px-2.5 py-1.5 text-xs bg-card hover:bg-hover text-secondary hover:text-primary rounded-lg border border-primary transition-all"
                        >
                          {shot.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'screenshots' && (
        <div className="space-y-4">
          {camera.screenshots.length === 0 ? (
            <div className="text-muted text-sm text-center py-8">
              暂无截图
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {camera.screenshots.map((url, index) => (
                <div key={index} className="relative group">
                  <img src={url} alt={`截图 ${index + 1}`} className="w-full aspect-video object-cover rounded-lg" />
                  <button
                    onClick={() => window.open(url, '_blank')}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => onCameraScreenshot(camera.id)}
            className="w-full px-4 py-2 bg-card hover:bg-hover text-secondary hover:text-primary text-sm rounded-lg border border-primary transition-all"
          >
            截图
          </button>
        </div>
      )}
    </div>
  );
}

export function RightPanel({
  snapshot,
  selectedId,
  onUpdateCharacter,
  onUpdateProp,
  onUpdateCamera,
  onSetCharacterPose,
  onSetCameraShot,
  onUpdatePanorama,
  onUpdateSettings,
  onCameraScreenshot,
}: RightPanelProps) {
  const selectedCharacter = snapshot.characters.find((c) => c.id === selectedId);
  const selectedProp = snapshot.props.find((p) => p.id === selectedId);
  const selectedCamera = snapshot.cameras.find((c) => c.id === selectedId);

  return (
    <div className="w-72 bg-panel border-l border-primary flex flex-col">
      <div className="p-4 border-b border-primary">
        <h2 className="text-primary font-medium text-sm">
          {selectedCharacter ? selectedCharacter.name : selectedProp ? selectedProp.name : selectedCamera ? selectedCamera.name : '3D 场景'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {selectedCharacter && (
          <CharacterPanel
            character={selectedCharacter}
            onUpdateCharacter={onUpdateCharacter}
            onSetCharacterPose={onSetCharacterPose}
          />
        )}

        {selectedProp && (
          <PropPanel
            prop={selectedProp}
            onUpdateProp={onUpdateProp}
          />
        )}

        {selectedCamera && (
          <CameraPanel
            camera={selectedCamera}
            onUpdateCamera={onUpdateCamera}
            onSetCameraShot={onSetCameraShot}
            onCameraScreenshot={onCameraScreenshot}
          />
        )}

        {!selectedId && (
          <SceneSettingsPanel
            snapshot={snapshot}
            onUpdatePanorama={onUpdatePanorama}
            onUpdateSettings={onUpdateSettings}
          />
        )}
      </div>
    </div>
  );
}