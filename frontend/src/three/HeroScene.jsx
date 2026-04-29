import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, MeshWobbleMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

function GlowOrb({ position, color, size = 0.7, speed = 1, distort = 0.45 }) {
  const mesh = useRef();
  useFrame(() => {
    mesh.current.rotation.y += 0.006 * speed;
    mesh.current.rotation.z += 0.004 * speed;
  });
  return (
    <Float speed={speed * 1.4} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={mesh} position={position}>
        <sphereGeometry args={[size, 64, 64]} />
        <MeshDistortMaterial color={color} distort={distort} speed={2.5} roughness={0.05} metalness={0.95} />
      </mesh>
    </Float>
  );
}

function Diamond({ position, color, size = 0.55, speed = 1 }) {
  const mesh = useRef();
  useFrame((state) => {
    mesh.current.rotation.y = state.clock.elapsedTime * speed * 0.7;
    mesh.current.rotation.x = state.clock.elapsedTime * speed * 0.4;
  });
  return (
    <Float speed={speed * 1.2} floatIntensity={1.5}>
      <mesh ref={mesh} position={position}>
        <octahedronGeometry args={[size, 0]} />
        <meshStandardMaterial color={color} metalness={1} roughness={0} />
      </mesh>
    </Float>
  );
}

function KnotRing({ position, color, speed = 0.5 }) {
  const mesh = useRef();
  useFrame((state) => {
    mesh.current.rotation.x = state.clock.elapsedTime * speed * 0.6;
    mesh.current.rotation.y = state.clock.elapsedTime * speed;
  });
  return (
    <Float speed={speed * 1.6} rotationIntensity={0.8} floatIntensity={1}>
      <mesh ref={mesh} position={position}>
        <torusKnotGeometry args={[0.38, 0.1, 128, 16, 2, 3]} />
        <MeshWobbleMaterial color={color} metalness={0.9} roughness={0.05} factor={0.25} speed={1.5} />
      </mesh>
    </Float>
  );
}

function Ring({ position, color, speed = 0.4 }) {
  const mesh = useRef();
  useFrame((state) => {
    mesh.current.rotation.x = Math.PI / 3 + state.clock.elapsedTime * speed * 0.4;
    mesh.current.rotation.z = state.clock.elapsedTime * speed * 0.3;
  });
  return (
    <Float speed={speed * 1.3} floatIntensity={0.9}>
      <mesh ref={mesh} position={position}>
        <torusGeometry args={[0.55, 0.08, 24, 64]} />
        <meshStandardMaterial color={color} metalness={1} roughness={0} />
      </mesh>
    </Float>
  );
}

function Particle({ idx, pos }) {
  const mesh = useRef();
  const speed = 0.15 + (idx % 10) * 0.05;
  const size = 0.02 + (idx % 5) * 0.012;
  const colors = ['#c084fc', '#f472b6', '#818cf8', '#facc15', '#ffffff'];
  const color = colors[idx % colors.length];
  useFrame((state) => {
    mesh.current.position.y = pos[1] + Math.sin(state.clock.elapsedTime * speed + idx) * 0.15;
  });
  return (
    <mesh ref={mesh} position={pos}>
      <dodecahedronGeometry args={[size, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.8} />
    </mesh>
  );
}

const PARTICLE_POSITIONS = Array.from({ length: 70 }, (_, i) => ([
  (((i * 137.5) % 14) - 7),
  (((i * 97.3)  % 9)  - 4.5),
  (((i * 61.8)  % 7)  - 5),
]));

export default function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.5} color="#f0eaff" />
      <directionalLight position={[5, 8, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[3, 3, 4]}   intensity={3}   color="#a855f7" />
      <pointLight position={[-4, -2, 3]} intensity={2.5} color="#ec4899" />
      <pointLight position={[0, 6, -4]}  intensity={1.5} color="#facc15" />
      <pointLight position={[-3, 2, 5]}  intensity={1.8} color="#818cf8" />

      {/* Central hero orb */}
      <GlowOrb position={[0, 0, 0]}        color="#8b5cf6" size={1.05} speed={0.6} distort={0.5} />
      {/* Accent orbs */}
      <GlowOrb position={[-3, 0.8, -1]}    color="#ec4899" size={0.6}  speed={1.0} distort={0.4} />
      <GlowOrb position={[3.2, -0.5, -0.5]} color="#c084fc" size={0.55} speed={0.8} distort={0.35} />
      <GlowOrb position={[1.5, 2, -1.5]}   color="#f472b6" size={0.42} speed={1.2} distort={0.5} />
      {/* Diamonds */}
      <Diamond position={[2.4, 1.5, 0.5]}   color="#facc15" size={0.5}  speed={1.1} />
      <Diamond position={[-2.2, -1.5, 0]}   color="#60a5fa" size={0.45} speed={0.9} />
      <Diamond position={[0.5, -2.2, -0.5]} color="#f9a8d4" size={0.38} speed={1.3} />
      {/* Torus knots */}
      <KnotRing position={[-1.8, 1.8, -0.5]} color="#a78bfa" speed={0.5} />
      <KnotRing position={[2.8, -1.8, -1]}   color="#fb7185" speed={0.65} />
      {/* Rings */}
      <Ring position={[-3.2, -0.5, 0.5]} color="#e879f9" speed={0.45} />
      <Ring position={[1.2, 2.8, -1]}   color="#818cf8" speed={0.55} />
      {/* Particles */}
      {PARTICLE_POSITIONS.map((pos, i) => <Particle key={i} idx={i} pos={pos} />)}
    </>
  );
}
