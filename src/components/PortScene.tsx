"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function seed(i: number) {
  const x = Math.sin(i * 9973.11) * 43758.5453;
  return x - Math.floor(x);
}

const CONTAINER_COLORS = ["#4cd9e0", "#f2a93c", "#ff5a5f", "#2b6a8f", "#3b8fa1"];

function Water() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (ref.current) {
      const m = ref.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.15 + Math.sin(state.clock.elapsedTime * 0.6) * 0.05;
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -25]}>
      <planeGeometry args={[120, 60]} />
      <meshStandardMaterial color="#0f2138" emissive="#15304f" emissiveIntensity={0.15} roughness={0.4} metalness={0.7} />
    </mesh>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 25]}>
      <planeGeometry args={[120, 100]} />
      <meshStandardMaterial color="#1c2c4a" roughness={0.9} />
    </mesh>
  );
}

function Ship() {
  const ref = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = -0.2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.008;
    }
  });
  return (
    <group ref={ref} position={[-14, 0, -14]}>
      <mesh>
        <boxGeometry args={[22, 1.6, 5]} />
        <meshStandardMaterial color="#0a1a2e" roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.9, 0]}>
        <boxGeometry args={[21, 0.6, 4.4]} />
        <meshStandardMaterial color="#3a2020" />
      </mesh>
      <mesh position={[-8, 2.2, 0]}>
        <boxGeometry args={[3, 3, 4]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
      <mesh position={[-8, 4, 0]}>
        <boxGeometry args={[2, 1.2, 3]} />
        <meshStandardMaterial color="#f2a93c" emissive="#f2a93c" emissiveIntensity={0.6} />
      </mesh>
      {Array.from({ length: 24 }).map((_, i) => {
        const col = i % 8;
        const row = Math.floor(i / 8);
        return (
          <mesh key={i} position={[col * 2 - 6, 1.2 + row * 1.1, i % 2 ? 1.2 : -1.2]}>
            <boxGeometry args={[1.8, 1, 2.2]} />
            <meshStandardMaterial color={CONTAINER_COLORS[i % CONTAINER_COLORS.length]} roughness={0.7} />
          </mesh>
        );
      })}
      <mesh position={[-8, 5.2, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 1, 8]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
    </group>
  );
}

function GantryCrane({ x = 0 }: { x?: number }) {
  const hookRef = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (hookRef.current) {
      const t = state.clock.elapsedTime * 0.4;
      hookRef.current.position.y = 5 + Math.sin(t) * 3;
      hookRef.current.position.x = Math.sin(t * 0.5) * 3;
    }
  });
  return (
    <group position={[x, 0, -6]}>
      {[[-4, 0, -2], [4, 0, -2], [-4, 0, 2], [4, 0, 2]].map((p, i) => (
        <mesh key={i} position={[p[0], 5, p[2]]}>
          <boxGeometry args={[0.4, 10, 0.4]} />
          <meshStandardMaterial color="#e8b74a" />
        </mesh>
      ))}
      <mesh position={[0, 10, 0]}>
        <boxGeometry args={[14, 0.5, 0.6]} />
        <meshStandardMaterial color="#e8b74a" />
      </mesh>
      <mesh position={[0, 10.4, 0]}>
        <boxGeometry args={[14, 0.3, 5]} />
        <meshStandardMaterial color="#c99b3a" />
      </mesh>
      <group ref={hookRef}>
        <mesh position={[0, 4.5, 0]}>
          <boxGeometry args={[0.1, 4, 0.1]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <boxGeometry args={[2.4, 1.2, 5.5]} />
          <meshStandardMaterial color="#4cd9e0" emissive="#4cd9e0" emissiveIntensity={0.15} />
        </mesh>
      </group>
      <mesh position={[7, 10.8, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ff5a5f" emissive="#ff5a5f" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

function ContainerYard() {
  const positions = useMemo(() => {
    const arr: [number, number, number, number][] = [];
    for (let x = 0; x < 10; x++) {
      for (let z = 0; z < 6; z++) {
        const stack = 1 + Math.floor(seed(x * 100 + z) * 3);
        for (let y = 0; y < stack; y++) {
          arr.push([
            x * 2.4 - 11,
            0.5 + y * 1.05,
            z * 2.6 + 8,
            Math.floor(seed(x * 7 + z * 13 + y) * CONTAINER_COLORS.length),
          ]);
        }
      }
    }
    return arr;
  }, []);
  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} position={[p[0], p[1], p[2]]}>
          <boxGeometry args={[2.2, 1, 2.4]} />
          <meshStandardMaterial color={CONTAINER_COLORS[p[3]]} roughness={0.75} />
        </mesh>
      ))}
    </group>
  );
}

function Warehouse() {
  return (
    <group position={[6, 0, 30]}>
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[18, 6, 12]} />
        <meshStandardMaterial color="#243b5c" roughness={0.85} />
      </mesh>
      <mesh position={[0, 6.3, 0]}>
        <boxGeometry args={[18.4, 0.6, 12.4]} />
        <meshStandardMaterial color="#1a2a44" />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-7 + i * 2.8, 4, 6.05]}>
          <boxGeometry args={[1.6, 1, 0.1]} />
          <meshStandardMaterial color="#f2a93c" emissive="#f2a93c" emissiveIntensity={1.4} />
        </mesh>
      ))}
      {[-6, -2, 2, 6].map((x, i) => (
        <mesh key={i} position={[x, 1.5, -6.05]}>
          <boxGeometry args={[2.4, 3, 0.1]} />
          <meshStandardMaterial color="#0f1a30" />
        </mesh>
      ))}
    </group>
  );
}

function Truck({ color = "#4cd9e0", withContainer = true }: { color?: string; withContainer?: boolean }) {
  return (
    <group>
      <mesh position={[1.4, 0.7, 0]}>
        <boxGeometry args={[1.4, 1.4, 1.4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {withContainer && (
        <mesh position={[-1, 1.1, 0]}>
          <boxGeometry args={[3.6, 1.6, 1.6]} />
          <meshStandardMaterial color={CONTAINER_COLORS[1]} />
        </mesh>
      )}
      {[-1.8, -0.4, 1.5].map((wx, i) => (
        <group key={i}>
          <mesh position={[wx, 0.25, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.3, 10]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          <mesh position={[wx, 0.25, -0.8]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.3, 10]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function MovingTrucks() {
  const trucksRef = useRef<THREE.Group[]>([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    trucksRef.current.forEach((g, i) => {
      if (!g) return;
      const speed = 0.08 + i * 0.02;
      const progress = (t * speed + i * 0.33) % 1;
      const z = 8 + progress * 44;
      g.position.set(-4 + (i % 2) * 0.5, 0, z);
      g.rotation.y = -Math.PI / 2;
    });
  });
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <group
          key={i}
          ref={(el) => {
            if (el) trucksRef.current[i] = el;
          }}
        >
          <Truck color={i === 0 ? "#4cd9e0" : i === 1 ? "#f2a93c" : "#ff5a5f"} withContainer={i !== 2} />
        </group>
      ))}
    </group>
  );
}

function Road() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4, -0.35, 30]}>
        <planeGeometry args={[5, 50]} />
        <meshStandardMaterial color="#0a1424" />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-4, -0.34, 10 + i * 4]}>
          <planeGeometry args={[0.2, 1.5]} />
          <meshStandardMaterial color="#f2a93c" emissive="#f2a93c" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Gate() {
  return (
    <group position={[-4, 0, 52]}>
      <mesh position={[-3, 2, 0]}>
        <boxGeometry args={[0.6, 4, 0.6]} />
        <meshStandardMaterial color="#2d3f5c" />
      </mesh>
      <mesh position={[3, 2, 0]}>
        <boxGeometry args={[0.6, 4, 0.6]} />
        <meshStandardMaterial color="#2d3f5c" />
      </mesh>
      <mesh position={[0, 4, 0]}>
        <boxGeometry args={[7, 0.4, 0.6]} />
        <meshStandardMaterial color="#4cd9e0" emissive="#4cd9e0" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function Quay() {
  return (
    <mesh position={[0, -0.2, -7]}>
      <boxGeometry args={[80, 0.6, 8]} />
      <meshStandardMaterial color="#28405f" roughness={0.9} />
    </mesh>
  );
}

function Beacons() {
  const refs = useRef<THREE.Mesh[]>([]);
  useFrame((state) => {
    refs.current.forEach((m, i) => {
      if (m) {
        const mat = m.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 1 + Math.sin(state.clock.elapsedTime * 2 + i) * 1;
      }
    });
  });
  const positions: [number, number, number, string][] = [
    [-30, 0.5, -10, "#ff5a5f"],
    [30, 0.5, -10, "#4cd9e0"],
    [0, 0.3, -22, "#f2a93c"],
    [-20, 0.3, -20, "#4cd9e0"],
  ];
  return (
    <group>
      {positions.map((p, i) => (
        <mesh
          key={i}
          position={[p[0], p[1], p[2]]}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.25, 8, 8]} />
          <meshStandardMaterial color={p[3]} emissive={p[3]} emissiveIntensity={1.5} />
        </mesh>
      ))}
    </group>
  );
}

function CameraRig({ progress }: { progress: React.RefObject<number> }) {
  const camPath = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 32, 40),
        new THREE.Vector3(-14, 14, 8),
        new THREE.Vector3(2, 10, -2),
        new THREE.Vector3(6, 9, 10),
        new THREE.Vector3(-6, 8, 24),
        new THREE.Vector3(-4, 12, 55),
        new THREE.Vector3(10, 30, 50),
      ]),
    []
  );
  const targetPath = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-14, 2, -14),
        new THREE.Vector3(0, 4, -6),
        new THREE.Vector3(0, 1, 12),
        new THREE.Vector3(6, 3, 30),
        new THREE.Vector3(-4, 1, 55),
        new THREE.Vector3(0, 2, 20),
      ]),
    []
  );

  const smoothed = useRef(0);

  useFrame((state) => {
    smoothed.current += ((progress.current ?? 0) - smoothed.current) * 0.08;
    const t = Math.max(0, Math.min(1, smoothed.current));
    const pos = camPath.getPoint(t);
    const tgt = targetPath.getPoint(t);
    state.camera.position.lerp(pos, 0.15);
    state.camera.lookAt(tgt);
  });
  return null;
}

export function PortScene({ progressRef }: { progressRef: React.RefObject<number> }) {
  return (
    <Canvas
      shadows={false}
      dpr={[1, 1.6]}
      camera={{ position: [0, 32, 40], fov: 42 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#0b1220"]} />
      <fog attach="fog" args={["#0b1220", 40, 130]} />
      <ambientLight intensity={0.35} color="#6a8ab0" />
      <directionalLight position={[20, 40, 10]} intensity={0.5} color="#8fb3d9" />
      <pointLight position={[6, 6, 30]} intensity={2} distance={30} color="#f2a93c" />
      <pointLight position={[-14, 4, -14]} intensity={1.5} distance={22} color="#4cd9e0" />
      <pointLight position={[0, 8, -6]} intensity={1.2} distance={20} color="#4cd9e0" />

      <Suspense fallback={null}>
        <Water />
        <Ground />
        <Quay />
        <Ship />
        <GantryCrane x={-4} />
        <GantryCrane x={8} />
        <ContainerYard />
        <Warehouse />
        <Road />
        <MovingTrucks />
        <Gate />
        <Beacons />
      </Suspense>

      <CameraRig progress={progressRef} />
    </Canvas>
  );
}
