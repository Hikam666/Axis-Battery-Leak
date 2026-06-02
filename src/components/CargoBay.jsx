import { RigidBody, CuboidCollider } from '@react-three/rapier';

export function CargoBay() {
  const wallThickness = 1;
  const size = 30;
  
  return (
    <group>
      {/* Visual environment - Dark grid/wireframe */}
      <gridHelper args={[size, size, '#39FF14', '#111111']} position={[0, -size/2, 0]} />
      <gridHelper args={[size, size, '#39FF14', '#111111']} position={[0, size/2, 0]} />
      
      {/* Physics Colliders - Boundaries */}
      <RigidBody type="fixed">
        {/* Floor */}
        <CuboidCollider position={[0, -size/2 - wallThickness/2, 0]} args={[size/2, wallThickness/2, size/2]} />
        {/* Ceiling */}
        <CuboidCollider position={[0, size/2 + wallThickness/2, 0]} args={[size/2, wallThickness/2, size/2]} />
        {/* Walls */}
        <CuboidCollider position={[-size/2 - wallThickness/2, 0, 0]} args={[wallThickness/2, size/2, size/2]} />
        <CuboidCollider position={[size/2 + wallThickness/2, 0, 0]} args={[wallThickness/2, size/2, size/2]} />
        <CuboidCollider position={[0, 0, -size/2 - wallThickness/2]} args={[size/2, size/2, wallThickness/2]} />
        <CuboidCollider position={[0, 0, size/2 + wallThickness/2]} args={[size/2, size/2, wallThickness/2]} />
      </RigidBody>
    </group>
  );
}
