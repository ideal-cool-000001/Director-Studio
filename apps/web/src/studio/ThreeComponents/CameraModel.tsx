import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { CameraEntity } from '../types';

interface CameraModelProps {
  camera: CameraEntity;
  isSelected: boolean;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export function CameraModel({ camera, isSelected, isActive, onSelect }: CameraModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  const bodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: isActive ? '#00ff00' : '#007aff',
    metalness: 0.5,
    roughness: 0.3,
  }), [isActive]);

  const wireframeMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#00ffff',
    wireframe: true,
  }), []);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(camera.position.x, camera.position.y, camera.position.z);
    }
  }, [camera.position]);

  return (
    <group ref={groupRef} onClick={() => onSelect(camera.id)}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.3, 0.2, 0.2]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>
      <mesh position={[0, 0, -0.3]} rotation={[0, Math.PI, 0]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>
      {isSelected && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <primitive object={wireframeMaterial} attach="material" />
        </mesh>
      )}
    </group>
  );
}