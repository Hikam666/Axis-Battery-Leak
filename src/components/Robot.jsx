import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Html } from '@react-three/drei';
import { useKeyboard } from '../hooks/useKeyboard';
import * as THREE from 'three';

export function Robot({ level = 1, targets = [], onCollect, ...props }) {
  const rigidBodyRef = useRef();
  const meshGroupRef = useRef();
  const thrusterRef = useRef();
  const cameraYaw = useRef(0);
  const cameraPitch = useRef(0);
  
  // Left Arm Refs
  const leftArmShoulderRef = useRef();
  const leftArmElbowRef = useRef();
  // Right Arm Refs
  const rightArmShoulderRef = useRef();
  const rightArmElbowRef = useRef();
  // Leg Refs
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  
  const keys = useKeyboard();
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [isNearTarget, setIsNearTarget] = useState(false);
  const prevGrabRef = useRef(false);
  const jumpCooldownRef = useRef(0);
  const targetIdToGrabRef = useRef(null);

  useFrame((state, delta) => {
    if (!rigidBodyRef.current || !meshGroupRef.current) return;

    // 1. Proximity Detection
    const pos = rigidBodyRef.current.translation();
    const robotPos = new THREE.Vector3(pos.x, pos.y, pos.z);
    
    let nearestTargetId = null;
    let minDistance = 2.5; 
    
    for (let i = 0; i < targets.length; i++) {
      const targetPos = new THREE.Vector3(targets[i][0], targets[i][1], targets[i][2]);
      const dist = robotPos.distanceTo(targetPos);
      const heightDiff = Math.abs(robotPos.y - targetPos.y);
      
      // Must be close AND at roughly the same elevation
      if (dist < minDistance && heightDiff < 1.0) {
        minDistance = dist;
        nearestTargetId = i;
      }
    }

    const near = nearestTargetId !== null;
    if (near !== isNearTarget) {
      setIsNearTarget(near);
    }

    // 2. Grab Logic
    const justPressedGrab = keys.grab && !prevGrabRef.current;
    if (justPressedGrab && near && !isGrabbing) {
      setIsGrabbing(true);
      targetIdToGrabRef.current = nearestTargetId;
      setTimeout(() => {
        if (targetIdToGrabRef.current !== null && onCollect) {
          onCollect(targetIdToGrabRef.current);
          targetIdToGrabRef.current = null;
        }
        setIsGrabbing(false);
      }, 300); // Grab animation duration
    }
    prevGrabRef.current = keys.grab;

    // 3. Grab Animation (Both arms)
    const targetElbowRot = isGrabbing ? -Math.PI / 2 : 0;
    const targetShoulderRot = isGrabbing ? Math.PI / 4 : 0;

    if (leftArmShoulderRef.current && rightArmShoulderRef.current) {
      leftArmShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftArmShoulderRef.current.rotation.x, targetShoulderRot, 0.2);
      leftArmElbowRef.current.rotation.x = THREE.MathUtils.lerp(leftArmElbowRef.current.rotation.x, targetElbowRot, 0.2);
      
      rightArmShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightArmShoulderRef.current.rotation.x, targetShoulderRot, 0.2);
      rightArmElbowRef.current.rotation.x = THREE.MathUtils.lerp(rightArmElbowRef.current.rotation.x, targetElbowRot, 0.2);
    }

    // 5. Camera & Steering
    const turnSpeed = 0.04;
    if (keys.povLeft) cameraYaw.current += turnSpeed;
    if (keys.povRight) cameraYaw.current -= turnSpeed;
    if (keys.povUp) cameraPitch.current += turnSpeed;
    if (keys.povDown) cameraPitch.current -= turnSpeed;
    
    // Clamp pitch to prevent flipping
    cameraPitch.current = Math.max(-Math.PI/2.5, Math.min(Math.PI/2.5, cameraPitch.current));
    
    // Apply rotation to camera
    const euler = new THREE.Euler(cameraPitch.current, cameraYaw.current, 0, 'YXZ');
    state.camera.quaternion.setFromEuler(euler);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(state.camera.quaternion);
    forward.y = 0; 
    forward.normalize();
    
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(state.camera.quaternion);
    right.y = 0;
    right.normalize();

    // 4. Grounded Movement (Walking)
    const speed = 4.0 + (level * 0.3);
    const velocity = new THREE.Vector3();
    
    if (keys.forward) velocity.add(forward);
    if (keys.backward) velocity.add(forward.clone().multiplyScalar(-1));
    if (keys.left) velocity.add(right.clone().multiplyScalar(-1));
    if (keys.right) velocity.add(right);

    // Mencegah glitch kecepatan ganda jika menekan 2 tombol (diagonal)
    if (velocity.lengthSq() > 0.01) {
      velocity.normalize().multiplyScalar(speed);
    }
    
    const isMoving = velocity.lengthSq() > 0.01;

    // 5. Walking / Leg Animation
    const time = state.clock.getElapsedTime();
    if (isMoving) {
      const legSwing = Math.sin(time * 15) * 0.5;
      if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing;
      meshGroupRef.current.position.y = Math.sin(time * 30) * 0.05; // Light bounce
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.2);
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.2);
      meshGroupRef.current.position.y = THREE.MathUtils.lerp(meshGroupRef.current.position.y, 0, 0.2);
    }
    
    // Jump mechanics
    const currentVel = rigidBodyRef.current.linvel();
    if (jumpCooldownRef.current > 0) {
      jumpCooldownRef.current -= 1;
    }
    
    if (keys.up && Math.abs(currentVel.y) < 0.1 && jumpCooldownRef.current <= 0) {
      velocity.y = 15; // Massive jump to clear tables easily
      jumpCooldownRef.current = 30; // Cooldown
    } else {
      velocity.y = currentVel.y;
    }

    rigidBodyRef.current.setLinvel(velocity, true);

    // 7. Update body rotation to face movement direction smoothly
    if (isMoving) {
      const angle = Math.atan2(velocity.x, velocity.z);
      const targetQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle + Math.PI);
      meshGroupRef.current.quaternion.slerp(targetQuat, 0.2);
    }

    // 8. Camera Follow
    const cameraOffset = new THREE.Vector3(0, 1.5, 3.5);
    cameraOffset.applyQuaternion(state.camera.quaternion);
    
    state.camera.position.lerp(new THREE.Vector3(
      pos.x + cameraOffset.x,
      pos.y + cameraOffset.y,
      pos.z + cameraOffset.z
    ), 0.2);
  });

  return (
    <>
      <RigidBody 
        name="robot"
        ref={rigidBodyRef} 
        position={props.position || [0, 2, 0]} 
        colliders={false}
        enabledRotations={[false, false, false]} 
        linearDamping={2}
        friction={0}
      >
        <CuboidCollider args={[0.75, 0.9, 0.75]} />
        
        {/* Shift visual mesh up by 0.45 to align feet with the bottom of the 0.9m collider */}
        <group position={[0, 0.45, 0]}>
          <group ref={meshGroupRef} scale={1.5}>
          {/* HEAD */}
          <group position={[0, 0.4, 0]}>
            {/* TV Head */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.7, 0.5, 0.5]} />
              <meshStandardMaterial color="#F2F4F7" roughness={0.3} metalness={0.1} />
            </mesh>
            {/* Dark Screen */}
            <mesh position={[0, 0, -0.26]}>
              <boxGeometry args={[0.6, 0.4, 0.05]} />
              <meshStandardMaterial color="#1C1F26" roughness={0.5} />
            </mesh>
            {/* Cyan Eyes */}
            <mesh position={[-0.15, 0.05, -0.29]}>
              <capsuleGeometry args={[0.04, 0.08, 4, 8]} />
              <meshStandardMaterial color="#00D4FF" emissive="#00D4FF" emissiveIntensity={1} />
            </mesh>
            <mesh position={[0.15, 0.05, -0.29]}>
              <capsuleGeometry args={[0.04, 0.08, 4, 8]} />
              <meshStandardMaterial color="#00D4FF" emissive="#00D4FF" emissiveIntensity={1} />
            </mesh>
            {/* Mouth */}
            <mesh position={[0, -0.1, -0.29]}>
              <planeGeometry args={[0.1, 0.05]} />
              <meshStandardMaterial color="#00D4FF" emissive="#00D4FF" emissiveIntensity={1} side={THREE.DoubleSide} />
            </mesh>
            {/* Pink Blush */}
            <mesh position={[-0.25, -0.05, -0.29]}>
              <circleGeometry args={[0.04, 16]} />
              <meshStandardMaterial color="#FF7E90" emissive="#FF7E90" emissiveIntensity={0.5} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0.25, -0.05, -0.29]}>
              <circleGeometry args={[0.04, 16]} />
              <meshStandardMaterial color="#FF7E90" emissive="#FF7E90" emissiveIntensity={0.5} side={THREE.DoubleSide} />
            </mesh>
            {/* Orange Ears */}
            <mesh position={[-0.37, 0, 0]} rotation={[0, 0, Math.PI/2]}>
              <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
              <meshStandardMaterial color="#FFB140" roughness={0.3} />
            </mesh>
            <mesh position={[0.37, 0, 0]} rotation={[0, 0, Math.PI/2]}>
              <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
              <meshStandardMaterial color="#FFB140" roughness={0.3} />
            </mesh>
            {/* Antenna */}
            <mesh position={[0, 0.35, 0]}>
              <cylinderGeometry args={[0.02, 0.04, 0.2, 8]} />
              <meshStandardMaterial color="#F2F4F7" roughness={0.3} />
            </mesh>
          </group>

          {/* BODY */}
          <group position={[0, -0.1, 0]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.3, 0.35, 0.5, 16]} />
              <meshStandardMaterial color="#F2F4F7" roughness={0.3} metalness={0.1} />
            </mesh>
            {/* Star Logo */}
            <group position={[0, 0.05, -0.31]} rotation={[0, 0, Math.PI/4]}>
              <mesh><planeGeometry args={[0.03, 0.2]} /><meshStandardMaterial color="#00D4FF" emissive="#00D4FF" emissiveIntensity={1} /></mesh>
              <mesh rotation={[0, 0, Math.PI/2]}><planeGeometry args={[0.03, 0.2]} /><meshStandardMaterial color="#00D4FF" emissive="#00D4FF" emissiveIntensity={1} /></mesh>
            </group>
          </group>

          {/* ARMS */}
          {/* Left Arm */}
          <group ref={leftArmShoulderRef} position={[-0.4, 0.0, 0]}>
            <mesh castShadow position={[0, 0, 0]}>
              <sphereGeometry args={[0.08]} />
              <meshStandardMaterial color="#1C1F26" />
            </mesh>
            <mesh castShadow position={[-0.05, -0.15, -0.05]} rotation={[0, 0, -Math.PI/8]}>
              <cylinderGeometry args={[0.06, 0.06, 0.3]} />
              <meshStandardMaterial color="#F2F4F7" />
            </mesh>
            <group ref={leftArmElbowRef} position={[-0.1, -0.3, -0.1]}>
              <mesh castShadow>
                <sphereGeometry args={[0.06]} />
                <meshStandardMaterial color="#1C1F26" />
              </mesh>
              <mesh castShadow position={[0, -0.15, -0.1]} rotation={[Math.PI/6, 0, 0]}>
                <cylinderGeometry args={[0.06, 0.07, 0.3]} />
                <meshStandardMaterial color="#F2F4F7" />
              </mesh>
              {/* Hand */}
              <mesh position={[0, -0.3, -0.2]}>
                <sphereGeometry args={[0.09]} />
                <meshStandardMaterial color="#F2F4F7" />
              </mesh>
            </group>
          </group>

          {/* Right Arm */}
          <group ref={rightArmShoulderRef} position={[0.4, 0.0, 0]}>
            <mesh castShadow position={[0, 0, 0]}>
              <sphereGeometry args={[0.08]} />
              <meshStandardMaterial color="#1C1F26" />
            </mesh>
            <mesh castShadow position={[0.05, -0.15, -0.05]} rotation={[0, 0, Math.PI/8]}>
              <cylinderGeometry args={[0.06, 0.06, 0.3]} />
              <meshStandardMaterial color="#F2F4F7" />
            </mesh>
            <group ref={rightArmElbowRef} position={[0.1, -0.3, -0.1]}>
              <mesh castShadow>
                <sphereGeometry args={[0.06]} />
                <meshStandardMaterial color="#1C1F26" />
              </mesh>
              <mesh castShadow position={[0, -0.15, -0.1]} rotation={[Math.PI/6, 0, 0]}>
                <cylinderGeometry args={[0.06, 0.07, 0.3]} />
                <meshStandardMaterial color="#F2F4F7" />
              </mesh>
              {/* Hand */}
              <mesh position={[0, -0.3, -0.2]}>
                <sphereGeometry args={[0.09]} />
                <meshStandardMaterial color="#F2F4F7" />
              </mesh>
            </group>
          </group>

          {/* LEGS */}
          <group ref={leftLegRef} position={[-0.15, -0.4, 0]}>
             <mesh castShadow>
               <sphereGeometry args={[0.08]} />
               <meshStandardMaterial color="#1C1F26" />
             </mesh>
             <mesh position={[0, -0.2, 0]}>
               <cylinderGeometry args={[0.08, 0.08, 0.4]} />
               <meshStandardMaterial color="#F2F4F7" />
             </mesh>
             {/* Foot */}
             <mesh position={[0, -0.45, -0.05]}>
               <boxGeometry args={[0.18, 0.1, 0.25]} />
               <meshStandardMaterial color="#F2F4F7" />
             </mesh>
          </group>
          <group ref={rightLegRef} position={[0.15, -0.4, 0]}>
             <mesh castShadow>
               <sphereGeometry args={[0.08]} />
               <meshStandardMaterial color="#1C1F26" />
             </mesh>
             <mesh position={[0, -0.2, 0]}>
               <cylinderGeometry args={[0.08, 0.08, 0.4]} />
               <meshStandardMaterial color="#F2F4F7" />
             </mesh>
             {/* Foot */}
             <mesh position={[0, -0.45, -0.05]}>
               <boxGeometry args={[0.18, 0.1, 0.25]} />
               <meshStandardMaterial color="#F2F4F7" />
             </mesh>
          </group>

          {/* UI Prompt when near target */}
          {isNearTarget && (
            <Html center position={[0, 1.2, 0]}>
              <div style={{ color: '#39FF14', background: 'rgba(0,0,0,0.7)', border: '1px solid #39FF14', padding: '5px 10px', fontFamily: 'monospace', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                [CLICK / E] TO GRAB
              </div>
            </Html>
          )}

          </group>
        </group>
      </RigidBody>
    </>
  );
}
