import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { SceneSnapshot } from '../types';
import { CharacterModel } from './CharacterModel';
import { PropModel } from './PropModel';
import { CameraModel } from './CameraModel';

interface ViewportProps {
  snapshot: SceneSnapshot;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onCameraChange: (cameraId: string) => void;
}

function Scene({ snapshot, selectedId, onSelect }: {
  snapshot: SceneSnapshot;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const gridRef = useRef<THREE.GridHelper>(null);
  const groundRef = useRef<THREE.Mesh>(null);

  const groundMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0a0a0f',
    roughness: 0.8,
    metalness: 0.2,
    transparent: true,
    opacity: snapshot.settings.groundOpacity,
  }), [snapshot.settings.groundOpacity]);

  useFrame(() => {
    if (gridRef.current) {
      gridRef.current.position.y = -0.01;
    }
  });

  return (
    <>
      <directionalLight
        position={[8, 12, 6]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0001}
      />

      <directionalLight
        position={[-6, 8, -4]}
        intensity={0.4}
        castShadow={false}
      />

      <directionalLight
        position={[0, -5, 0]}
        intensity={0.2}
        castShadow={false}
      />

      <ambientLight intensity={0.3} />

      {(snapshot.settings.groundVisible || snapshot.settings.groundOpacity > 0) && (
        <>
          <mesh
            ref={groundRef}
            position={[0, -0.01, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[100, 100]} />
            <primitive object={groundMaterial} attach="material" />
          </mesh>

          <gridHelper
            ref={gridRef}
            args={[100, 100, '#1a1a24', '#111118']}
            material-props={{ transparent: true, opacity: snapshot.settings.groundOpacity * 0.8 }}
          />
        </>
      )}

      {snapshot.characters.map((character) => (
        <CharacterModel
          key={character.id}
          character={character}
          isSelected={selectedId === character.id}
          onClick={() => onSelect(character.id)}
        />
      ))}

      {snapshot.props.map((prop) => (
        <PropModel
          key={prop.id}
          prop={prop}
          isSelected={selectedId === prop.id}
          onSelect={() => onSelect(prop.id)}
        />
      ))}

      {snapshot.cameras.map((camera) => (
        <CameraModel
          key={camera.id}
          camera={camera}
          isSelected={selectedId === camera.id}
          isActive={camera.isActive}
          onSelect={() => onSelect(camera.id)}
        />
      ))}
    </>
  );
}

export function Viewport({ snapshot, selectedId, onSelect, onCameraChange }: ViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 'v':
          break;
        case 'r':
          break;
        case 's':
          break;
        case 'delete':
        case 'backspace':
          break;
        case 'c':
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div ref={containerRef} className="flex-1 relative bg-primary">
      <Canvas
        shadows
        camera={{ position: [10, 8, 10], fov: 50 }}
        gl={{
          powerPreference: 'high-performance',
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <color attach="background" args={[snapshot.panorama.skyColor]} />

        <fog attach="fog" args={[snapshot.panorama.skyColor, 20, 80]} />

        <Scene snapshot={snapshot} selectedId={selectedId} onSelect={onSelect} />

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2.1}
          onEnd={() => onCameraChange('')}
        />
      </Canvas>

      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <div className="bg-panel/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-secondary">
          <div className="flex items-center gap-2">
            <span className="text-muted">X:</span>
            <span className="font-mono">{Math.round(snapshot.cameras.find((c) => c.isActive)?.position.x || 10)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted">Y:</span>
            <span className="font-mono">{Math.round(snapshot.cameras.find((c) => c.isActive)?.position.y || 8)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted">Z:</span>
            <span className="font-mono">{Math.round(snapshot.cameras.find((c) => c.isActive)?.position.z || 10)}</span>
          </div>
        </div>

        <button className="bg-panel/80 backdrop-blur-sm hover:bg-panel text-secondary hover:text-primary px-3 py-2 rounded-lg text-xs transition-all border border-primary">
          重置视角
        </button>
      </div>

      {snapshot.settings.showCharacterLabels && snapshot.characters.map((character) => (
        <Html
          key={`${character.id}-label`}
          position={[character.position.x, character.position.y + 1.8, character.position.z]}
          center
        >
          <div className="bg-panel/90 backdrop-blur-sm text-primary text-xs px-2 py-1 rounded-full border border-primary whitespace-nowrap shadow-lg">
            {character.name}
          </div>
        </Html>
      ))}

      {snapshot.settings.cameraGrid && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full border-4 border-accent/30 rounded-lg m-4" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-accent/20" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-accent/20" />
          <div className="absolute top-0 left-1/3 right-1/3 h-full">
            <div className="absolute top-0 bottom-0 w-px bg-accent/15" />
          </div>
          <div className="absolute left-0 top-1/3 bottom-1/3 w-full">
            <div className="absolute left-0 right-0 h-px bg-accent/15" />
          </div>
        </div>
      )}
    </div>
  );
}