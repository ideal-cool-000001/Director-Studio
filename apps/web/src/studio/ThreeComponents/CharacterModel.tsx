import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { SceneSnapshot } from '../types';
import { JointName } from '../types';

interface CharacterModelProps {
  character: SceneSnapshot['characters'][0];
  isSelected: boolean;
  onClick: () => void;
}

function Joint({ position, size, color }: { position: [number, number, number]; size: number; color: string }) {
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    metalness: 0.3,
    roughness: 0.7,
    envMapIntensity: 0.4,
  }), [color]);

  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 8, 8]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function Limb({
  position,
  rotation,
  size,
  color,
  isSelected,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
  color: string;
  isSelected: boolean;
}) {
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    metalness: 0.35,
    roughness: 0.65,
    envMapIntensity: 0.45,
    emissive: isSelected ? '#00d4ff' : '#000000',
    emissiveIntensity: isSelected ? 0.1 : 0,
  }), [color, isSelected]);

  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[size[0], size[1], size[2], 12]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

const getJointRotation = (rotations: Record<JointName, { x: number; y: number; z: number }>, joint: JointName): { x: number; y: number; z: number } => {
  return rotations[joint] || { x: 0, y: 0, z: 0 };
};

export function CharacterModel({ character, isSelected, onClick }: CharacterModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  const scale = character.bodyType === 'child' ? 0.7 : character.bodyType === 'chibi' ? 0.6 : 1;
  const widthScale = character.bodyType === 'slender' ? 0.8 : character.bodyType === 'muscular' ? 1.2 : 1;
  const heightScale = character.bodyType === 'teen' ? 0.85 : 1;

  const leftShoulder = getJointRotation(character.jointRotations, 'left_shoulder');
  const rightShoulder = getJointRotation(character.jointRotations, 'right_shoulder');
  const leftElbow = getJointRotation(character.jointRotations, 'left_elbow');
  const rightElbow = getJointRotation(character.jointRotations, 'right_elbow');
  const torso = getJointRotation(character.jointRotations, 'torso');
  const leftHip = getJointRotation(character.jointRotations, 'left_hip');
  const rightHip = getJointRotation(character.jointRotations, 'right_hip');
  const leftKnee = getJointRotation(character.jointRotations, 'left_knee');
  const rightKnee = getJointRotation(character.jointRotations, 'right_knee');

  const bodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: character.color,
    metalness: 0.3,
    roughness: 0.65,
    envMapIntensity: 0.45,
    emissive: isSelected ? '#00d4ff' : '#000000',
    emissiveIntensity: isSelected ? 0.1 : 0,
  }), [character.color, isSelected]);

  const headMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: character.color,
    metalness: 0.25,
    roughness: 0.7,
    envMapIntensity: 0.5,
    emissive: isSelected ? '#00d4ff' : '#000000',
    emissiveIntensity: isSelected ? 0.15 : 0,
  }), [character.color, isSelected]);

  const limbMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: character.color,
    metalness: 0.35,
    roughness: 0.65,
    envMapIntensity: 0.45,
    emissive: isSelected ? '#00d4ff' : '#000000',
    emissiveIntensity: isSelected ? 0.1 : 0,
  }), [character.color, isSelected]);

  const handMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: character.color,
    metalness: 0.25,
    roughness: 0.7,
    envMapIntensity: 0.5,
  }), [character.color]);

  const footMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: character.color,
    metalness: 0.25,
    roughness: 0.7,
    envMapIntensity: 0.5,
  }), [character.color]);

  const wireframeMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#00d4ff',
    wireframe: true,
    transparent: true,
    opacity: 0.3,
  }), []);

  return (
    <group
      ref={groupRef}
      position={[character.position.x, character.position.y, character.position.z]}
      rotation={[0, (character.rotation.y * Math.PI) / 180, 0]}
      onClick={onClick}
    >
      <mesh
        position={[0, 1.25 * heightScale, 0]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.22 * widthScale, 16, 16]} />
        <primitive object={headMaterial} attach="material" />
      </mesh>

      <Joint
        position={[0, 1.08 * heightScale, 0]}
        size={0.08 * widthScale}
        color={character.color}
      />

      <mesh
        position={[0, 0.75 * heightScale, 0]}
        rotation={[(torso.x * Math.PI) / 180, (torso.y * Math.PI) / 180, (torso.z * Math.PI) / 180]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.4 * widthScale, 0.55 * heightScale, 0.22 * widthScale]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>

      <Joint
        position={[-0.18 * widthScale, 0.55 * heightScale, 0]}
        size={0.07 * widthScale}
        color={character.color}
      />
      <Joint
        position={[0.18 * widthScale, 0.55 * heightScale, 0]}
        size={0.07 * widthScale}
        color={character.color}
      />

      <Limb
        position={[-0.28 * widthScale, 0.3 * heightScale, 0]}
        rotation={[
          (leftShoulder.x * Math.PI) / 180,
          (leftShoulder.y * Math.PI) / 180,
          (leftShoulder.z * Math.PI) / 180,
        ]}
        size={[0.08 * widthScale, 0.06 * widthScale, 0.42 * heightScale]}
        color={character.color}
        isSelected={isSelected}
      />

      <mesh
        position={[-0.28 * widthScale, 0.09 * heightScale, 0]}
        rotation={[
          (leftShoulder.x * Math.PI) / 180,
          (leftShoulder.y * Math.PI) / 180,
          (leftShoulder.z * Math.PI) / 180,
        ]}
      >
        <mesh
          position={[0, -0.21 * heightScale, 0]}
          rotation={[(leftElbow.x * Math.PI) / 180, 0, 0]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.06 * widthScale, 0.05 * widthScale, 0.38 * heightScale, 12]} />
          <primitive object={limbMaterial} attach="material" />
        </mesh>

        <mesh
          position={[0, -0.4 * heightScale, 0]}
          rotation={[(leftElbow.x * Math.PI) / 180, 0, 0]}
        >
          <sphereGeometry args={[0.06 * widthScale, 10, 10]} />
          <primitive object={handMaterial} attach="material" />
        </mesh>
      </mesh>

      <Limb
        position={[0.28 * widthScale, 0.3 * heightScale, 0]}
        rotation={[
          (rightShoulder.x * Math.PI) / 180,
          (rightShoulder.y * Math.PI) / 180,
          (rightShoulder.z * Math.PI) / 180,
        ]}
        size={[0.08 * widthScale, 0.06 * widthScale, 0.42 * heightScale]}
        color={character.color}
        isSelected={isSelected}
      />

      <mesh
        position={[0.28 * widthScale, 0.09 * heightScale, 0]}
        rotation={[
          (rightShoulder.x * Math.PI) / 180,
          (rightShoulder.y * Math.PI) / 180,
          (rightShoulder.z * Math.PI) / 180,
        ]}
      >
        <mesh
          position={[0, -0.21 * heightScale, 0]}
          rotation={[(rightElbow.x * Math.PI) / 180, 0, 0]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.06 * widthScale, 0.05 * widthScale, 0.38 * heightScale, 12]} />
          <primitive object={limbMaterial} attach="material" />
        </mesh>

        <mesh
          position={[0, -0.4 * heightScale, 0]}
          rotation={[(rightElbow.x * Math.PI) / 180, 0, 0]}
        >
          <sphereGeometry args={[0.06 * widthScale, 10, 10]} />
          <primitive object={handMaterial} attach="material" />
        </mesh>
      </mesh>

      <Joint
        position={[0, 0.42 * heightScale, 0]}
        size={0.08 * widthScale}
        color={character.color}
      />

      <mesh
        position={[0, 0.18 * heightScale, 0]}
        rotation={[(torso.x * Math.PI) / 180, (torso.y * Math.PI) / 180, (torso.z * Math.PI) / 180]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.35 * widthScale, 0.3 * heightScale, 0.18 * widthScale]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>

      <Joint
        position={[-0.15 * widthScale, 0.05 * heightScale, 0]}
        size={0.07 * widthScale}
        color={character.color}
      />
      <Joint
        position={[0.15 * widthScale, 0.05 * heightScale, 0]}
        size={0.07 * widthScale}
        color={character.color}
      />

      <mesh
        position={[-0.22 * widthScale, -0.35 * heightScale, 0]}
        rotation={[
          (torso.x * Math.PI) / 180,
          (leftHip.y * Math.PI) / 180 + (torso.y * Math.PI) / 180,
          (leftHip.z * Math.PI) / 180 + (torso.z * Math.PI) / 180,
        ]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.09 * widthScale, 0.07 * widthScale, 0.42 * heightScale, 12]} />
        <primitive object={limbMaterial} attach="material" />
      </mesh>

      <mesh
        position={[-0.22 * widthScale, -0.56 * heightScale, 0]}
        rotation={[
          (torso.x * Math.PI) / 180,
          (leftHip.y * Math.PI) / 180 + (torso.y * Math.PI) / 180,
          (leftHip.z * Math.PI) / 180 + (torso.z * Math.PI) / 180,
        ]}
      >
        <mesh
          position={[0, -0.21 * heightScale, 0]}
          rotation={[(leftKnee.x * Math.PI) / 180, 0, 0]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.07 * widthScale, 0.08 * widthScale, 0.4 * heightScale, 12]} />
          <primitive object={limbMaterial} attach="material" />
        </mesh>

        <mesh
          position={[0, -0.41 * heightScale, 0]}
          rotation={[(leftKnee.x * Math.PI) / 180, 0, 0]}
        >
          <sphereGeometry args={[0.09 * widthScale, 12, 12]} />
          <primitive object={footMaterial} attach="material" />
        </mesh>
      </mesh>

      <mesh
        position={[0.22 * widthScale, -0.35 * heightScale, 0]}
        rotation={[
          (torso.x * Math.PI) / 180,
          (rightHip.y * Math.PI) / 180 + (torso.y * Math.PI) / 180,
          (rightHip.z * Math.PI) / 180 + (torso.z * Math.PI) / 180,
        ]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.09 * widthScale, 0.07 * widthScale, 0.42 * heightScale, 12]} />
        <primitive object={limbMaterial} attach="material" />
      </mesh>

      <mesh
        position={[0.22 * widthScale, -0.56 * heightScale, 0]}
        rotation={[
          (torso.x * Math.PI) / 180,
          (rightHip.y * Math.PI) / 180 + (torso.y * Math.PI) / 180,
          (rightHip.z * Math.PI) / 180 + (torso.z * Math.PI) / 180,
        ]}
      >
        <mesh
          position={[0, -0.21 * heightScale, 0]}
          rotation={[(rightKnee.x * Math.PI) / 180, 0, 0]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.07 * widthScale, 0.08 * widthScale, 0.4 * heightScale, 12]} />
          <primitive object={limbMaterial} attach="material" />
        </mesh>

        <mesh
          position={[0, -0.41 * heightScale, 0]}
          rotation={[(rightKnee.x * Math.PI) / 180, 0, 0]}
        >
          <sphereGeometry args={[0.09 * widthScale, 12, 12]} />
          <primitive object={footMaterial} attach="material" />
        </mesh>
      </mesh>

      {isSelected && (
        <>
          <mesh position={[0, 1.5 * heightScale, 0]}>
            <sphereGeometry args={[0.35 * widthScale, 16, 16]} />
            <primitive object={wireframeMaterial} attach="material" />
          </mesh>
          <mesh position={[0, 0.5 * heightScale, 0]}>
            <boxGeometry args={[0.55 * widthScale, 1.5 * heightScale, 0.35 * widthScale]} />
            <primitive object={wireframeMaterial} attach="material" />
          </mesh>
        </>
      )}
    </group>
  );
}