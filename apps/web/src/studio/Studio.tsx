import { useState, useEffect, useCallback } from 'react';
import { SceneEngine } from './SceneEngine';
import { Viewport } from './ThreeComponents/Viewport';
import { TopBar } from './Panels/TopBar';
import { LeftPanel } from './Panels/LeftPanel';
import { RightPanel } from './Panels/RightPanel';
import { Toolbar } from './Panels/Toolbar';
import { SceneSnapshot, ViewMode, TransformMode, BodyType, PropEntity, ShotPreset } from './types';

export function Studio() {
  const [sceneEngine] = useState(() => new SceneEngine());
  const [snapshot, setSnapshot] = useState<SceneSnapshot>(() => sceneEngine.getSnapshot());
  const [viewMode, setViewMode] = useState<ViewMode>('director');

  useEffect(() => {
    return sceneEngine.subscribe(setSnapshot);
  }, [sceneEngine]);

  const handleSelect = useCallback((id: string | null) => {
    sceneEngine.selectEntity(id);
  }, [sceneEngine]);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    sceneEngine.setViewMode(mode);
  }, [sceneEngine]);

  const handleSave = useCallback(() => {
    sceneEngine.saveToStorage();
    alert('场景已保存');
  }, [sceneEngine]);

  const handleReset = useCallback(() => {
    if (confirm('确定要清空缓存并重置场景吗？')) {
      sceneEngine.clearStorageAndReset();
    }
  }, [sceneEngine]);

  const handleAddCharacter = useCallback((bodyType: BodyType) => {
    sceneEngine.addCharacter(bodyType);
  }, [sceneEngine]);

  const handleAddProp = useCallback((type: PropEntity['type']) => {
    sceneEngine.addProp(type);
  }, [sceneEngine]);

  const handleAddCrowd = useCallback(() => {
    sceneEngine.addCrowdGroup(3, 4, 1.5, 'male');
  }, [sceneEngine]);

  const handleAddCamera = useCallback(() => {
    sceneEngine.addCamera();
  }, [sceneEngine]);

  const handleDelete = useCallback((id: string) => {
    const type = sceneEngine.getEntityType(id);
    if (type === 'character') {
      sceneEngine.removeCharacter(id);
    } else if (type === 'prop') {
      sceneEngine.removeProp(id);
    } else if (type === 'camera') {
      sceneEngine.removeCamera(id);
    } else if (type === 'crowd') {
      sceneEngine.removeCrowdGroup(id);
    }
  }, [sceneEngine]);

  const handleToggleVisibility = useCallback((id: string, visible: boolean) => {
    const type = sceneEngine.getEntityType(id);
    if (type === 'character') {
      sceneEngine.updateCharacter(id, { visible });
    } else if (type === 'prop') {
      sceneEngine.updateProp(id, { visible });
    } else if (type === 'camera') {
      sceneEngine.updateCamera(id, { isActive: visible });
    } else if (type === 'crowd') {
      sceneEngine.updateCrowdGroup(id, { visible });
    }
  }, [sceneEngine]);

  const handleUpdateCharacter = useCallback((id: string, updates: Partial<SceneSnapshot['characters'][0]>) => {
    sceneEngine.updateCharacter(id, updates);
  }, [sceneEngine]);

  const handleUpdateProp = useCallback((id: string, updates: Partial<SceneSnapshot['props'][0]>) => {
    sceneEngine.updateProp(id, updates);
  }, [sceneEngine]);

  const handleUpdateCamera = useCallback((id: string, updates: Partial<SceneSnapshot['cameras'][0]>) => {
    sceneEngine.updateCamera(id, updates);
  }, [sceneEngine]);

  const handleSetCharacterPose = useCallback((charId: string, poseName: string) => {
    sceneEngine.setCharacterPose(charId, poseName);
  }, [sceneEngine]);

  const handleSetCameraShot = useCallback((cameraId: string, preset: ShotPreset) => {
    sceneEngine.setCameraShot(cameraId, preset);
  }, [sceneEngine]);

  const handleUpdatePanorama = useCallback((updates: Partial<SceneSnapshot['panorama']>) => {
    sceneEngine.updatePanorama(updates);
  }, [sceneEngine]);

  const handleUpdateSettings = useCallback((updates: Partial<SceneSnapshot['settings']>) => {
    sceneEngine.updateSettings(updates);
  }, [sceneEngine]);

  const handleCameraScreenshot = useCallback((cameraId: string) => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      sceneEngine.addCameraScreenshot(cameraId, url);
    }
  }, [sceneEngine]);

  const handleScreenshot = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `screenshot_${Date.now()}.png`;
      link.click();
    }
  }, []);

  const handleCameraChange = useCallback((cameraId: string) => {
    if (cameraId) {
      sceneEngine.setActiveCamera(cameraId);
    }
  }, [sceneEngine]);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950">
      <TopBar
        snapshot={snapshot}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onSave={handleSave}
        onReset={handleReset}
      />

      <div className="flex-1 flex overflow-hidden">
        <LeftPanel
          snapshot={snapshot}
          selectedId={snapshot.selectedId}
          onSelect={handleSelect}
          onToggleVisibility={handleToggleVisibility}
          onDelete={handleDelete}
        />

        <main className="flex-1 relative">
          <Viewport
            snapshot={snapshot}
            selectedId={snapshot.selectedId}
            onSelect={handleSelect}
            onCameraChange={handleCameraChange}
          />
        </main>

        <RightPanel
          snapshot={snapshot}
          selectedId={snapshot.selectedId}
          onUpdateCharacter={handleUpdateCharacter}
          onUpdateProp={handleUpdateProp}
          onUpdateCamera={handleUpdateCamera}
          onSetCharacterPose={handleSetCharacterPose}
          onSetCameraShot={handleSetCameraShot}
          onUpdatePanorama={handleUpdatePanorama}
          onUpdateSettings={handleUpdateSettings}
          onCameraScreenshot={handleCameraScreenshot}
        />
      </div>

      <Toolbar
        transformMode={sceneEngine.getTransformMode()}
        onTransformModeChange={(mode) => sceneEngine.setTransformMode(mode)}
        onAddCharacter={handleAddCharacter}
        onAddProp={handleAddProp}
        onAddCrowd={handleAddCrowd}
        onAddCamera={handleAddCamera}
        onPanorama={() => {}}
        onScreenshot={handleScreenshot}
        onFullscreen={handleFullscreen}
      />
    </div>
  );
}