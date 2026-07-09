import { useMemo } from 'react';
import { PanoramaSettings } from '../types';
import * as THREE from 'three';

interface PanoramaProps {
  panorama: PanoramaSettings;
}

export function Panorama({ panorama }: PanoramaProps) {
  const geometry = useMemo(() => new THREE.SphereGeometry(panorama.radius, 64, 64), [panorama.radius]);

  const material = useMemo(() => {
    if (panorama.type === 'gradient') {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      const gradient = ctx.createLinearGradient(0, 0, 0, 512);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.5, '#16213e');
      gradient.addColorStop(1, '#0f3460');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1024, 512);
      const texture = new THREE.CanvasTexture(canvas);
      return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    } else if (panorama.type === 'image' && panorama.url) {
      const texture = new THREE.TextureLoader().load(panorama.url);
      return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    }
    return new THREE.MeshBasicMaterial({ color: panorama.skyColor, side: THREE.BackSide });
  }, [panorama.type, panorama.url, panorama.skyColor]);

  return (
    <mesh geometry={geometry} material={material} rotation={[0, (panorama.rotation * Math.PI) / 180, 0]}>
    </mesh>
  );
}