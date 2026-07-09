import { useRef, useEffect, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { PropEntity } from '../types';

interface PropModelProps {
  prop: PropEntity;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function GLBModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export function PropModel({ prop, isSelected, onSelect }: PropModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  const propMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: prop.color,
    metalness: 0.3,
    roughness: 0.7,
  }), [prop.color]);

  const wireframeMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#00ffff',
    wireframe: true,
  }), []);

  const humanMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: prop.color,
    metalness: 0.2,
    roughness: 0.8,
    wireframe: true,
  }), [prop.color]);

  const headMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffcc99',
    metalness: 0.1,
    roughness: 0.8,
    wireframe: true,
  }), []);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(prop.position.x, prop.position.y, prop.position.z);
      groupRef.current.rotation.set(
        (prop.rotation.x * Math.PI) / 180,
        (prop.rotation.y * Math.PI) / 180,
        (prop.rotation.z * Math.PI) / 180
      );
      groupRef.current.scale.set(prop.scale.x, prop.scale.y, prop.scale.z);
    }
  }, [prop.position, prop.rotation, prop.scale]);

  const renderGeometry = () => {
    switch (prop.type) {
      case 'box':
        return (
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <primitive object={propMaterial} attach="material" />
          </mesh>
        );
      case 'cylinder':
        return (
          <mesh>
            <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
            <primitive object={propMaterial} attach="material" />
          </mesh>
        );
      case 'sphere':
        return (
          <mesh>
            <sphereGeometry args={[0.5, 32, 32]} />
            <primitive object={propMaterial} attach="material" />
          </mesh>
        );
      case 'human':
        return (
          <group scale={[0.8, 1.5, 0.8]}>
            <mesh position={[0, 0.75, 0]}>
              <boxGeometry args={[0.5, 1, 0.3]} />
              <primitive object={humanMaterial} attach="material" />
            </mesh>
            <mesh position={[0, 1.4, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <primitive object={headMaterial} attach="material" />
            </mesh>
          </group>
        );
      case 'glb':
        return prop.glbUrl ? (
          <Suspense fallback={null}>
            <GLBModel url={prop.glbUrl} />
          </Suspense>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <group ref={groupRef} onClick={() => onSelect(prop.id)}>
      {renderGeometry()}
      {isSelected && (
        <mesh>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <primitive object={wireframeMaterial} attach="material" />
        </mesh>
      )}
    </group>
  );
}