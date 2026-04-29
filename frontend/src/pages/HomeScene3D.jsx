/**
 * HomeScene3D.jsx
 * All Three.js / @react-three code lives HERE so it goes into its own
 * lazy chunk and is NEVER downloaded or parsed on mobile Safari.
 */
import React, { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial, Float, MeshDistortMaterial, Sphere } from "@react-three/drei";

/* ── Error boundary: WebGL crash silently hides the canvas ── */
class CanvasErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? null : this.props.children; }
}

/* ── Particle sphere ── */
function ParticleSphere() {
  const ref = useRef();
  const count = 2800;
  const positions = React.useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 1.6 + (Math.random() - 0.5) * 0.55;
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.06;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.035) * 0.18;
    }
  });
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent color="#fbbf24" size={0.012}
        sizeAttenuation depthWrite={false} opacity={0.75}
      />
    </Points>
  );
}

/* ── Inner globe ── */
function InnerGlobe() {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 0.12;
      meshRef.current.rotation.z = clock.elapsedTime * 0.05;
    }
  });
  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.8}>
      <Sphere ref={meshRef} args={[0.88, 64, 64]}>
        <MeshDistortMaterial
          color="#7c3aed"
          attach="material"
          distort={0.55}
          speed={1.8}
          roughness={0}
          metalness={0.6}
          transparent
          opacity={0.55}
        />
      </Sphere>
    </Float>
  );
}

/* ── Gold ring ── */
function GoldRing() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.elapsedTime * 0.18;
      ref.current.rotation.y = clock.elapsedTime * 0.11;
    }
  });
  return (
    <Float speed={0.6} rotationIntensity={0.2} floatIntensity={0.25}>
      <mesh ref={ref}>
        <torusGeometry args={[1.15, 0.016, 16, 100]} />
        <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.06} emissive="#fbbf24" emissiveIntensity={0.5} />
      </mesh>
    </Float>
  );
}

/* ── Purple ring ── */
function PurpleRing() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = -clock.elapsedTime * 0.12;
      ref.current.rotation.z =  clock.elapsedTime * 0.08;
    }
  });
  return (
    <Float speed={0.8} rotationIntensity={0.22} floatIntensity={0.35}>
      <mesh ref={ref}>
        <torusGeometry args={[1.38, 0.012, 16, 100]} />
        <meshStandardMaterial color="#a78bfa" metalness={1} roughness={0.06} emissive="#a78bfa" emissiveIntensity={0.38} />
      </mesh>
    </Float>
  );
}

/* ── Cyan ring ── */
function CyanRing() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y =  clock.elapsedTime * 0.09;
      ref.current.rotation.z = -clock.elapsedTime * 0.15;
    }
  });
  return (
    <Float speed={0.5} rotationIntensity={0.18} floatIntensity={0.2}>
      <mesh ref={ref}>
        <torusGeometry args={[0.92, 0.010, 16, 100]} />
        <meshStandardMaterial color="#22d3ee" metalness={1} roughness={0.05} emissive="#22d3ee" emissiveIntensity={0.45} />
      </mesh>
    </Float>
  );
}

/* ── Scene root ── */
function Scene3D() {
  const { camera } = useThree();
  useEffect(() => { camera.position.z = 3.6; }, [camera]);
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[4, 4, 4]}    intensity={3.5} color="#fbbf24" />
      <pointLight position={[-4, -4, -4]} intensity={2.2} color="#7c3aed" />
      <pointLight position={[0, 5, -3]}   intensity={1.8} color="#06b6d4" />
      <pointLight position={[3, -3, 2]}   intensity={1.4} color="#ec4899" />
      <InnerGlobe />
      <GoldRing />
      <PurpleRing />
      <CyanRing />
      <ParticleSphere />
    </>
  );
}

/* ── Default export: full canvas wrapped in error boundary ── */
export default function HomeScene3D() {
  return (
    <CanvasErrorBoundary>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 3.5], fov: 55 }}
        gl={{ powerPreference: "low-power", antialias: false }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Scene3D />
      </Canvas>
    </CanvasErrorBoundary>
  );
}
