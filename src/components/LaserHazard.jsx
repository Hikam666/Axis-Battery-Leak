import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';

export function LaserHazard({ level = 1, position, onHit }) {
  const rigidBodyRef = useRef();
  const speed = 0.5 + (level * 0.15); // Slower base speed and slower scaling

  useFrame((state, delta) => {
    if (rigidBodyRef.current) {
      const angle = state.clock.elapsedTime * speed;
      const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      rigidBodyRef.current.setNextKinematicRotation(quaternion);
    }
  });

  return (
    <group position={position}>
      {/* Central Pillar */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 3, 16]} />
        <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Rotating Laser Beams */}
      <RigidBody 
        ref={rigidBodyRef}
        type="kinematicPosition" 
        colliders={false} 
        onIntersectionEnter={({ other }) => {
          // If a dynamic body (robot) touches the sensor, trigger hit
          if (other.rigidBodyObject && other.rigidBodyObject.name === "robot") {
            if (onHit) onHit();
          }
        }}
      >
        <CuboidCollider args={[2.5, 0.1, 0.1]} position={[0, 1, 0]} sensor />
        <CuboidCollider args={[2.5, 0.1, 0.1]} position={[0, 2, 0]} sensor />
        
        {/* Visual Lasers */}
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[5, 0.05, 0.05]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={5} toneMapped={false} />
        </mesh>
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[5, 0.05, 0.05]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={5} toneMapped={false} />
        </mesh>
      </RigidBody>
    </group>
  );
}
