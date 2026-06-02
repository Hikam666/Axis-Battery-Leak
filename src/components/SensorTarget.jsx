import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

export function SensorTarget({ position, collected }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && !collected) {
      // Rotate the beacon
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      // Gentle bobbing
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  if (collected) return null;

  return (
    <group position={position}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.4, 0.4, 0.2]} />
      </RigidBody>

      <group ref={meshRef}>
        {/* Battery Pack Main Casing */}
        <group position={[0, 0.5, 0]}> 
          {/* White Outer Shell */}
          {/* Backplate */}
          <mesh position={[0, 0, -0.1]} castShadow>
            <boxGeometry args={[0.7, 0.7, 0.05]} />
            <meshStandardMaterial color="#eeeeee" roughness={0.3} metalness={0.2} />
          </mesh>
          {/* Top/Bottom */}
          <mesh position={[0, 0.35, 0]} castShadow>
            <boxGeometry args={[0.7, 0.1, 0.25]} />
            <meshStandardMaterial color="#eeeeee" roughness={0.3} metalness={0.2} />
          </mesh>
          <mesh position={[0, -0.35, 0]} castShadow>
            <boxGeometry args={[0.7, 0.1, 0.25]} />
            <meshStandardMaterial color="#eeeeee" roughness={0.3} metalness={0.2} />
          </mesh>
          {/* Sides */}
          <mesh position={[-0.35, 0, 0]} castShadow>
            <boxGeometry args={[0.1, 0.7, 0.25]} />
            <meshStandardMaterial color="#eeeeee" roughness={0.3} metalness={0.2} />
          </mesh>
          <mesh position={[0.35, 0, 0]} castShadow>
            <boxGeometry args={[0.1, 0.7, 0.25]} />
            <meshStandardMaterial color="#eeeeee" roughness={0.3} metalness={0.2} />
          </mesh>

          {/* Dark Inner Frame */}
          <mesh position={[0, 0, -0.07]}>
            <boxGeometry args={[0.62, 0.62, 0.02]} />
            <meshStandardMaterial color="#222222" roughness={0.7} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.28, 0]}>
            <boxGeometry args={[0.62, 0.08, 0.2]} />
            <meshStandardMaterial color="#222222" roughness={0.7} metalness={0.5} />
          </mesh>
          <mesh position={[0, -0.28, 0]}>
            <boxGeometry args={[0.62, 0.08, 0.2]} />
            <meshStandardMaterial color="#222222" roughness={0.7} metalness={0.5} />
          </mesh>
          <mesh position={[-0.28, 0, 0]}>
            <boxGeometry args={[0.08, 0.62, 0.2]} />
            <meshStandardMaterial color="#222222" roughness={0.7} metalness={0.5} />
          </mesh>
          <mesh position={[0.28, 0, 0]}>
            <boxGeometry args={[0.08, 0.62, 0.2]} />
            <meshStandardMaterial color="#222222" roughness={0.7} metalness={0.5} />
          </mesh>

          {/* Top Orange Clip */}
          <mesh position={[0, 0.41, 0]}>
            <boxGeometry args={[0.2, 0.04, 0.15]} />
            <meshStandardMaterial color="#FF9900" roughness={0.4} metalness={0.3} />
          </mesh>

          {/* Glowing Blue LEDs on Top Inner Frame */}
          {[-0.09, -0.03, 0.03, 0.09].map((x, i) => (
            <mesh key={`led-${i}`} position={[x, 0.28, 0.105]}>
              <sphereGeometry args={[0.015, 16, 16]} />
              <meshStandardMaterial color="#00D4FF" emissive="#00D4FF" emissiveIntensity={3} toneMapped={false} />
            </mesh>
          ))}

          {/* Gold Buttons on Bottom Inner Frame */}
          {[-0.12, -0.06, 0, 0.06, 0.12].map((x, i) => (
            <mesh key={`btn-${i}`} position={[x, -0.28, 0.105]} rotation={[Math.PI/2, 0, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.02, 16]} />
              <meshStandardMaterial color="#FFD700" roughness={0.3} metalness={0.8} />
            </mesh>
          ))}

          {/* 4 Blue Battery Cells */}
          {[-0.18, -0.06, 0.06, 0.18].map((x, i) => (
            <group key={`cell-${i}`} position={[x, 0, 0]}>
              {/* Blue Cylinder */}
              <mesh>
                <cylinderGeometry args={[0.05, 0.05, 0.48, 32]} />
                <meshStandardMaterial color="#1E90FF" roughness={0.4} metalness={0.3} />
              </mesh>
              {/* Silver Top Cap */}
              <mesh position={[0, 0.24, 0]}>
                <cylinderGeometry args={[0.055, 0.055, 0.02, 32]} />
                <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.9} />
              </mesh>
              {/* Silver Bottom Cap */}
              <mesh position={[0, -0.24, 0]}>
                <cylinderGeometry args={[0.055, 0.055, 0.02, 32]} />
                <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.9} />
              </mesh>
              {/* Lightning Bolt Symbol */}
              <group position={[0, 0, 0.051]}>
                <mesh position={[0.005, 0.02, 0]} rotation={[0, 0, -0.2]}>
                  <planeGeometry args={[0.015, 0.05]} />
                  <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} toneMapped={false} />
                </mesh>
                <mesh position={[-0.005, -0.02, 0]} rotation={[0, 0, -0.2]}>
                  <planeGeometry args={[0.015, 0.05]} />
                  <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} toneMapped={false} />
                </mesh>
              </group>
            </group>
          ))}
        </group>
        
        {/* Floating Locator / Laser Pointer to ground */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.0]} />
          <meshStandardMaterial color="#1E90FF" emissive="#1E90FF" emissiveIntensity={2} transparent opacity={0.4} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
