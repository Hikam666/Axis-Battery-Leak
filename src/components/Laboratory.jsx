import { useTexture } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';

// 1. Sleek Grounded Workstation
function StructuredTable({ position }) {
  // Base is at y=0, tabletop is 2 units high
  return (
    <RigidBody type="fixed" position={position}>
      <group>
        {/* Solid Pillar/Base to ground it */}
        <mesh position={[0, 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 2, 1.5]} />
          <meshStandardMaterial color="#050505" metalness={0.8} />
        </mesh>

        {/* Main Sleek Desk Top */}
        <mesh position={[0, 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[4, 0.2, 2.5]} />
          <meshStandardMaterial color="#080808" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Glowing Rim/Accent */}
        <mesh position={[0, 1.9, 0]}>
          <boxGeometry args={[3.8, 0.1, 2.3]} />
          <meshStandardMaterial color="#39FF14" emissive="#39FF14" emissiveIntensity={1} />
        </mesh>

        {/* Hologram Emitter Base */}
        <mesh position={[0, 2.15, -0.8]}>
          <boxGeometry args={[1, 0.1, 0.3]} />
          <meshStandardMaterial color="#111" metalness={1} />
        </mesh>

        {/* Hologram Screen */}
        <mesh position={[0, 3.2, -0.8]}>
          <planeGeometry args={[2, 1.2]} />
          <meshStandardMaterial 
            color="#39FF14" 
            emissive="#39FF14" 
            emissiveIntensity={0.8} 
            transparent 
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
      <CuboidCollider position={[0, 1, 0]} args={[2, 1.1, 1.25]} />
    </RigidBody>
  );
}

// 2. Structured Server Rack (Wall-aligned, Grounded)
function StructuredServerRack({ position, rotation = [0, 0, 0] }) {
  // Height is 6. Base at y=0. Center at y=3
  return (
    <RigidBody type="fixed" position={position} rotation={rotation}>
      <group>
        {/* Rack Body */}
        <mesh position={[0, 3, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 6, 2]} />
          <meshStandardMaterial color="#050505" metalness={0.8} roughness={0.4} />
        </mesh>
        
        {/* Glowing Data Cores (Front) */}
        <mesh position={[0, 4.5, 1.01]}>
          <planeGeometry args={[1.2, 1]} />
          <meshStandardMaterial color="#39FF14" emissive="#39FF14" emissiveIntensity={1.5} wireframe />
        </mesh>
        <mesh position={[0, 1.5, 1.01]}>
          <planeGeometry args={[1.2, 1]} />
          <meshStandardMaterial color="#39FF14" emissive="#39FF14" emissiveIntensity={1.5} wireframe />
        </mesh>
        <mesh position={[0, 3, 1.01]}>
          <planeGeometry args={[1.2, 0.5]} />
          <meshStandardMaterial color="#39FF14" emissive="#39FF14" emissiveIntensity={2} />
        </mesh>
      </group>
      <CuboidCollider position={[0, 3, 0]} args={[0.75, 3, 1]} />
    </RigidBody>
  );
}

// 3. Neon Strip Lighting (Architectural Lines)
function NeonStrip({ position, rotation, length }) {
  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[0.05, 0.05, length, 8]} />
      <meshStandardMaterial color="#39FF14" emissive="#39FF14" emissiveIntensity={3} />
    </mesh>
  );
}

export function Laboratory() {
  const wallThickness = 2;
  // Dimensions for a long corridor style lab
  const width = 24;  // X
  const height = 12; // Y (Floor is at 0, Ceiling is at 12)
  const depth = 80;  // Z

  const steelTexture = useTexture('/lab_wall.png').clone();
  steelTexture.wrapS = steelTexture.wrapT = THREE.RepeatWrapping;
  steelTexture.repeat.set(width / 2, depth / 2); 

  const wavySide = useTexture('/wavy_wall.png').clone();
  wavySide.wrapS = wavySide.wrapT = THREE.RepeatWrapping;
  wavySide.repeat.set(depth / 6, 2); 

  const wavyFront = useTexture('/wavy_wall.png').clone();
  wavyFront.wrapS = wavyFront.wrapT = THREE.RepeatWrapping;
  wavyFront.repeat.set(width / 6, 2); 

  const woodFloor = useTexture('/wood_floor.png').clone();
  woodFloor.wrapS = woodFloor.wrapT = THREE.RepeatWrapping;
  // Repeat the texture to make planks look realistic in size
  woodFloor.repeat.set(width / 4, depth / 4);

  return (
    <group>
      {/* --- CORRIDOR GEOMETRY --- */}
      {/* Floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial map={woodFloor} roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, height, 0]} rotation={[Math.PI/2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} metalness={0.0} />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-width/2, height/2, 0]} rotation={[0, Math.PI/2, 0]} receiveShadow>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial map={wavySide} color="#ffffff" roughness={0.9} metalness={0.0} />
      </mesh>
      {/* Right Wall */}
      <mesh position={[width/2, height/2, 0]} rotation={[0, -Math.PI/2, 0]} receiveShadow>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial map={wavySide} color="#ffffff" roughness={0.9} metalness={0.0} />
      </mesh>
      {/* Front Wall (Starting area) */}
      <mesh position={[0, height/2, depth/2]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={wavyFront} color="#ffffff" roughness={0.9} metalness={0.0} />
      </mesh>
      {/* Back Wall (End of corridor) */}
      <mesh position={[0, height/2, -depth/2]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={wavyFront} color="#ffffff" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* --- ARCHITECTURAL STRIP LIGHTS --- */}
      {/* Floor corners */}
      <NeonStrip position={[-width/2 + 0.1, 0.1, 0]} rotation={[Math.PI/2, 0, 0]} length={depth} />
      <NeonStrip position={[width/2 - 0.1, 0.1, 0]} rotation={[Math.PI/2, 0, 0]} length={depth} />
      {/* Ceiling corners */}
      <NeonStrip position={[-width/2 + 0.1, height - 0.1, 0]} rotation={[Math.PI/2, 0, 0]} length={depth} />
      <NeonStrip position={[width/2 - 0.1, height - 0.1, 0]} rotation={[Math.PI/2, 0, 0]} length={depth} />
      
      {/* --- STRUCTURED INTERIOR --- */}
      {/* Central Island Workstations (Grounded) */}
      <StructuredTable position={[0, 0, 20]} />
      <StructuredTable position={[0, 0, 0]} />
      <StructuredTable position={[0, 0, -20]} />

      {/* Left Wall Server Racks (Grounded) */}
      <StructuredServerRack position={[-10, 0, 30]} rotation={[0, Math.PI/2, 0]} />
      <StructuredServerRack position={[-10, 0, 15]} rotation={[0, Math.PI/2, 0]} />
      <StructuredServerRack position={[-10, 0, 0]} rotation={[0, Math.PI/2, 0]} />
      <StructuredServerRack position={[-10, 0, -15]} rotation={[0, Math.PI/2, 0]} />
      <StructuredServerRack position={[-10, 0, -30]} rotation={[0, Math.PI/2, 0]} />

      {/* Right Wall Server Racks (Grounded) */}
      <StructuredServerRack position={[10, 0, 30]} rotation={[0, -Math.PI/2, 0]} />
      <StructuredServerRack position={[10, 0, 15]} rotation={[0, -Math.PI/2, 0]} />
      <StructuredServerRack position={[10, 0, 0]} rotation={[0, -Math.PI/2, 0]} />
      <StructuredServerRack position={[10, 0, -15]} rotation={[0, -Math.PI/2, 0]} />
      <StructuredServerRack position={[10, 0, -30]} rotation={[0, -Math.PI/2, 0]} />

      {/* --- PHYSICS BOUNDARIES --- */}
      <RigidBody type="fixed">
        <CuboidCollider position={[0, -wallThickness/2, 0]} args={[width/2, wallThickness/2, depth/2]} />
        <CuboidCollider position={[0, height + wallThickness/2, 0]} args={[width/2, wallThickness/2, depth/2]} />
        <CuboidCollider position={[-width/2 - wallThickness/2, height/2, 0]} args={[wallThickness/2, height/2, depth/2]} />
        <CuboidCollider position={[width/2 + wallThickness/2, height/2, 0]} args={[wallThickness/2, height/2, depth/2]} />
        <CuboidCollider position={[0, height/2, depth/2 + wallThickness/2]} args={[width/2, height/2, wallThickness/2]} />
        <CuboidCollider position={[0, height/2, -depth/2 - wallThickness/2]} args={[width/2, height/2, wallThickness/2]} />
      </RigidBody>
    </group>
  );
}
