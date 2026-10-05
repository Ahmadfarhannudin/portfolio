import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { useRef } from 'react';
import { Vector3 } from 'three';
import './Globe3D.css';

const Globe3D = ({ markers = [], config = {}, className = '' }) => {
  const {
    atmosphereColor = '#4da6ff',
    autoRotateSpeed = 0.3,
    size = 400
  } = config;

  return (
    <div className={`globe-container ${className}`} style={{ width: size, height: size }}>
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 45 }}
        gl={{ alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 3, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-5, -3, -5]} intensity={0.4} color={atmosphereColor} />

        <Sphere args={[1, 64, 64]}>
          <MeshDistortMaterial
            color="#1a3a5c"
            attach="material"
            distort={0.2}
            speed={2}
            roughness={0.4}
            metalness={0.6}
          />
        </Sphere>

        <Atmosphere color={atmosphereColor} />
        <MarkerLayer markers={markers} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={1.8}
          maxDistance={4.5}
          autoRotate={autoRotateSpeed > 0}
          autoRotateSpeed={autoRotateSpeed}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
};

const Atmosphere = ({ color }) => (
  <Sphere args={[1.15, 64, 64]}>
    <meshBasicMaterial color={color} transparent opacity={0.12} side={2} />
  </Sphere>
);

const MarkerLayer = ({ markers }) => {
  const groupRef = useRef();
  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.001;
  });

  return (
    <group ref={groupRef}>
      {markers.map((m, i) => (
        <Marker key={i} lat={m.lat} lng={m.lng} label={m.label} />
      ))}
    </group>
  );
};

const Marker = ({ lat, lng }) => {
  const pos = latLngToVec3(lat, lng, 1.02);
  return (
    <mesh position={[pos.x, pos.y, pos.z]}>
      <sphereGeometry args={[0.015, 16, 16]} />
      <meshBasicMaterial color="#ff6b6b" />
    </mesh>
  );
};

const latLngToVec3 = (lat, lng, r) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
};

export default Globe3D;