import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import "./3d-globe.css";

/* =========================================================
   DEFAULT CONFIG
========================================================= */
const DEFAULT_CONFIG = {
  radius: 1.4,
  globeColor: "#ffffff",
  textureUrl: "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
  bumpMapUrl: "https://threejs.org/examples/textures/planets/earth_normal_2048.jpg",
  showAtmosphere: false,
  atmosphereColor: "#67b7ff",
  atmosphereIntensity: 0,
  atmosphereBlur: 0,
  bumpScale: 0.045,
  autoRotateSpeed: 0.22,
  enableZoom: true,
  enablePan: false,
  minDistance: 4.2,
  maxDistance: 7,
  markerSize: 0.055,
  backgroundColor: null,

  /* Arc lines */
  showArcs: true,
  arcs: null,
  arcColor: "#38bdf8",
  arcOpacity: 0.45,
  arcHeight: 0.42,
  arcSpeed: 0.35,
  arcPulseColor: "#7fe3ff",
  arcPulseSize: 0.04,
  arcEndpointGlow: true,
  arcEndpointGlowColor: "#7fe3ff",
  arcEndpointGlowSpeed: 1.4,

  /* Fly-in saat marker diklik */
  homeDistance: 5.3,
  focusDistanceOffset: 1.45,
  focusMinDistance: 1.9,
  focusSpeed: 3.2,
};

/* =========================================================
   HELPERS
========================================================= */
function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

function getMapsUrl(marker) {
  // 1) Link Maps manual (paling presisi), kalau diisi
  if (marker.mapsUrl) return marker.mapsUrl;

  // 2) Nama tempat + koordinat: Maps menampilkan kartu tempat
  //    (foto, ulasan) dan hasilnya dibiaskan ke lokasi yang benar
  if (marker.mapsQuery) {
    const name = encodeURIComponent(marker.mapsQuery);
    return `https://www.google.com/maps/place/${name}/@${marker.lat},${marker.lng},14z`;
  }

  // 3) Cadangan: koordinat saja
  return `https://www.google.com/maps/search/?api=1&query=${marker.lat},${marker.lng}`;
}

/* =========================================================
   EARTH
========================================================= */
function EarthTexture({ config }) {
  const earthTexture = useLoader(THREE.TextureLoader, config.textureUrl);
  const normalTexture = useLoader(THREE.TextureLoader, config.bumpMapUrl);

  useEffect(() => {
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.anisotropy = 8;
    earthTexture.wrapS = THREE.ClampToEdgeWrapping;
    earthTexture.wrapT = THREE.ClampToEdgeWrapping;
    earthTexture.needsUpdate = true;

    normalTexture.wrapS = THREE.ClampToEdgeWrapping;
    normalTexture.wrapT = THREE.ClampToEdgeWrapping;
    normalTexture.needsUpdate = true;
  }, [earthTexture, normalTexture]);

  return (
    <mesh>
      <sphereGeometry args={[config.radius, 160, 160]} />
      <meshPhongMaterial
        map={earthTexture}
        normalMap={normalTexture}
        bumpMap={normalTexture}
        bumpScale={config.bumpScale}
        normalScale={new THREE.Vector2(0.3, 0.3)}
        color="#ffffff"
        shininess={8}
        specular="#222222"
      />
    </mesh>
  );
}

/* =========================================================
   MARKER
========================================================= */
function GlobeMarker({ marker, radius, markerSize, isFocused, onClick, onHover }) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef(null);

  const position = useMemo(
    () => latLngToVector3(marker.lat, marker.lng, radius + 0.035),
    [marker.lat, marker.lng, radius]
  );

  const handlePointerOver = useCallback(
    (event) => {
      event.stopPropagation();
      setHovered(true);
      onHover?.(marker);
      document.body.style.cursor = "pointer";
    },
    [marker, onHover]
  );

  const handlePointerOut = useCallback(
    (event) => {
      event.stopPropagation();
      setHovered(false);
      onHover?.(null);
      document.body.style.cursor = "default";
    },
    [onHover]
  );

  const handleClick = useCallback(
    (event) => {
      event.stopPropagation();
      const world = new THREE.Vector3();
      groupRef.current?.getWorldPosition(world);
      onClick?.(marker, world);
    },
    [marker, onClick]
  );

  const active = hovered || isFocused;

  return (
    <group ref={groupRef} position={position}>
      {/* Marker glow */}
      <mesh
        scale={active ? 2 : 1.6}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[markerSize, 16, 16]} />
        <meshBasicMaterial
          color="#75caff"
          transparent
          opacity={active ? 0.3 : 0.13}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Main marker */}
      <mesh
        scale={active ? 1.3 : 1}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[markerSize, 20, 20]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Tooltip (disembunyikan saat fokus) */}
      {hovered && !isFocused && (
        <Html
          center
          distanceFactor={5}
          position={[0, 0.12, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="globe-marker-tooltip">
            {marker.image && <img src={marker.image} alt="" />}
            <span>{marker.label}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

/* =========================================================
   ARC LINES (garis tebal + ekor komet)
========================================================= */
function buildArcCurve(fromMarker, toMarker, radius, arcHeight) {
  const start = latLngToVector3(fromMarker.lat, fromMarker.lng, radius + 0.02);
  const end = latLngToVector3(toMarker.lat, toMarker.lng, radius + 0.02);

  const chordLength = start.distanceTo(end);
  const mid = start.clone().add(end).multiplyScalar(0.5);

  mid.normalize().multiplyScalar(radius + 0.02 + chordLength * arcHeight);

  return new THREE.QuadraticBezierCurve3(start, mid, end);
}

function ArcLine({ curve, color, opacity, pulseColor, pulseSize, speed, phase }) {
  const TRAIL = 14;

  const points = useMemo(() => curve.getPoints(80), [curve]);

  const headRef = useRef(null);
  const haloRef = useRef(null);
  const trailRefs = useRef([]);

  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * speed + phase) % 1;
    const head = curve.getPoint(t);

    if (headRef.current) headRef.current.position.copy(head);
    if (haloRef.current) {
      haloRef.current.position.copy(head);
      haloRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 6) * 0.15);
    }

    for (let i = 0; i < TRAIL; i++) {
      const mesh = trailRefs.current[i];
      if (!mesh) continue;

      const tt = t - (i + 1) * 0.013;
      if (tt <= 0) {
        mesh.visible = false;
        continue;
      }

      mesh.visible = true;
      mesh.position.copy(curve.getPoint(tt));

      const k = 1 - (i + 1) / (TRAIL + 1);
      mesh.scale.setScalar(0.35 + k * 0.65);
      mesh.material.opacity = k * 0.75;
    }
  });

  return (
    <>
      {/* Glow lebar di bawah garis */}
      <Line
        points={points}
        color={color}
        transparent
        opacity={opacity * 0.35}
        lineWidth={6}
        depthWrite={false}
      />

      {/* Garis utama */}
      <Line
        points={points}
        color={color}
        transparent
        opacity={Math.min(1, opacity * 1.6)}
        lineWidth={2.2}
        depthWrite={false}
      />

      {/* Ekor komet */}
      {Array.from({ length: TRAIL }).map((_, i) => (
        <mesh key={i} ref={(el) => (trailRefs.current[i] = el)}>
          <sphereGeometry args={[pulseSize * 0.85, 10, 10]} />
          <meshBasicMaterial
            color={pulseColor}
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Halo kepala */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[pulseSize * 2.6, 16, 16]} />
        <meshBasicMaterial
          color={pulseColor}
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Kepala (putih panas) */}
      <mesh ref={headRef}>
        <sphereGeometry args={[pulseSize, 16, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

/* =========================================================
   ENDPOINT GLOW
========================================================= */
function EndpointPulse({ marker, radius, color, speed, phase }) {
  const ringRef = useRef(null);
  const coreRef = useRef(null);

  const position = useMemo(
    () => latLngToVector3(marker.lat, marker.lng, radius + 0.024),
    [marker.lat, marker.lng, radius]
  );

  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), position.clone().normalize());
    return q;
  }, [position]);

  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * speed + phase) % 1;

    if (ringRef.current) {
      ringRef.current.scale.setScalar(1 + t * 2.4);
      ringRef.current.material.opacity = Math.max(0, 1 - t) * 0.6;
    }

    if (coreRef.current) {
      coreRef.current.material.opacity =
        0.75 + Math.sin(clock.elapsedTime * 3 + phase * 10) * 0.25;
    }
  });

  return (
    <group position={position} quaternion={quaternion}>
      <mesh ref={ringRef}>
        <ringGeometry args={[0.02, 0.027, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={coreRef}>
        <circleGeometry args={[0.018, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function ArcsLayer({ markers, config }) {
  const arcPairs = useMemo(() => {
    if (config.arcs && config.arcs.length) return config.arcs;

    const pairs = [];
    for (let i = 0; i < markers.length - 1; i++) pairs.push([i, i + 1]);
    return pairs;
  }, [config.arcs, markers]);

  const endpointIndices = useMemo(() => {
    const set = new Set();
    arcPairs.forEach(([a, b]) => {
      set.add(a);
      set.add(b);
    });
    return Array.from(set);
  }, [arcPairs]);

  const curves = useMemo(
    () =>
      arcPairs.map(([a, b]) =>
        markers[a] && markers[b]
          ? buildArcCurve(markers[a], markers[b], config.radius, config.arcHeight)
          : null
      ),
    [arcPairs, markers, config.radius, config.arcHeight]
  );

  if (!config.showArcs || markers.length < 2) return null;

  return (
    <>
      {config.arcEndpointGlow &&
        endpointIndices.map((idx, i) => {
          const marker = markers[idx];
          if (!marker) return null;
          return (
            <EndpointPulse
              key={`endpoint-${idx}`}
              marker={marker}
              radius={config.radius}
              color={config.arcEndpointGlowColor}
              speed={config.arcEndpointGlowSpeed}
              phase={i * 0.35}
            />
          );
        })}

      {arcPairs.map(([fromIndex, toIndex], index) => {
        const curve = curves[index];
        if (!curve) return null;
        return (
          <ArcLine
            key={`arc-${fromIndex}-${toIndex}-${index}`}
            curve={curve}
            color={config.arcColor}
            opacity={config.arcOpacity}
            pulseColor={config.arcPulseColor}
            pulseSize={config.arcPulseSize}
            speed={config.arcSpeed}
            phase={index * 0.27}
          />
        );
      })}
    </>
  );
}

/* =========================================================
   LIGHTING
========================================================= */
function GlobeLighting() {
  return (
    <>
      <ambientLight intensity={1.35} />
      <directionalLight position={[5, 3, 5]} intensity={3.3} />
      <directionalLight position={[-4, -2, -4]} intensity={0.55} color="#4c9ddd" />
      <pointLight position={[0, 2, 5]} intensity={0.8} color="#ffffff" />
    </>
  );
}

/* =========================================================
   CAMERA RIG (animasi masuk / keluar globe)
========================================================= */
function CameraRig({ focus, config }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls);

  const mode = useRef("idle"); // idle | focusing | returning
  const target = useRef({ dir: new THREE.Vector3(0, 0, 1), dist: config.homeDistance });

  useEffect(() => {
    if (focus) {
      target.current = {
        dir: focus.dir.clone().normalize(),
        dist: focus.dist,
      };
      mode.current = "focusing";
      if (controls) {
        controls.enabled = false;
        controls.minDistance = config.focusMinDistance;
      }
    } else if (mode.current === "focusing") {
      target.current = {
        dir: camera.position.clone().normalize(),
        dist: config.homeDistance,
      };
      mode.current = "returning";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, controls]);

  useFrame((_, delta) => {
    if (mode.current === "idle") return;

    const k = 1 - Math.exp(-delta * config.focusSpeed);

    const curDist = camera.position.length();
    const curDir = camera.position.clone().normalize();

    const full = new THREE.Quaternion().setFromUnitVectors(curDir, target.current.dir);
    const step = new THREE.Quaternion().slerp(full, k);
    const newDir = curDir.applyQuaternion(step).normalize();

    const newDist = curDist + (target.current.dist - curDist) * k;

    camera.position.copy(newDir.multiplyScalar(newDist));
    camera.lookAt(0, 0, 0);

    if (
      mode.current === "returning" &&
      Math.abs(newDist - target.current.dist) < 0.03
    ) {
      mode.current = "idle";
      if (controls) {
        controls.enabled = true;
        controls.minDistance = config.minDistance;
        controls.update?.();
      }
    }
  });

  return null;
}

/* =========================================================
   GLOBE SCENE
========================================================= */
function GlobeScene({ markers, config, focus, onMarkerClick, onMarkerHover }) {
  const globeGroup = useRef(null);

  // Globe berhenti berputar selama mode fokus
  useFrame((_, delta) => {
    if (!globeGroup.current || focus) return;
    globeGroup.current.rotation.y += delta * config.autoRotateSpeed;
  });

  return (
    <>
      <GlobeLighting />

      <group ref={globeGroup}>
        <Suspense fallback={null}>
          <EarthTexture config={config} />
        </Suspense>

        <ArcsLayer markers={markers} config={config} />

        {markers.map((marker, index) => (
          <GlobeMarker
            key={marker.id || `${marker.label}-${index}`}
            marker={marker}
            radius={config.radius}
            markerSize={config.markerSize}
            isFocused={focus?.marker === marker}
            onClick={onMarkerClick}
            onHover={onMarkerHover}
          />
        ))}
      </group>

      <OrbitControls
        makeDefault
        enablePan={config.enablePan}
        enableZoom={config.enableZoom}
        minDistance={config.minDistance}
        maxDistance={config.maxDistance}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.45}
        zoomSpeed={0.5}
      />

      <CameraRig focus={focus} config={config} />
    </>
  );
}

/* =========================================================
   RESIZE GUARD
========================================================= */
function ResizeGuard() {
  useEffect(() => {
    const handle = () => window.dispatchEvent(new Event("resize"));
    const t1 = setTimeout(handle, 60);
    const t2 = setTimeout(handle, 350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return null;
}

/* =========================================================
   LOADING
========================================================= */
function GlobeLoading() {
  return (
    <div className="globe-loading">
      <div className="globe-loading-dot" />
      <span>Loading globe...</span>
    </div>
  );
}

/* =========================================================
   MAIN GLOBE3D
========================================================= */
export function Globe3D({
  markers = [],
  config = {},
  className = "",
  onMarkerClick,
  onMarkerHover,
}) {
  const finalConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);

  const [loaded, setLoaded] = useState(false);
  const [focus, setFocus] = useState(null); // { marker, dir, dist }

  const handleCreated = useCallback(({ gl }) => {
    gl.setClearColor(0x000000, 0);
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.1;
    setLoaded(true);
  }, []);

  const handleMarkerClick = useCallback(
    (marker, worldPos) => {
      setFocus({
        marker,
        dir: worldPos.clone().normalize(),
        dist: finalConfig.radius + finalConfig.focusDistanceOffset,
      });
      document.body.style.cursor = "default";
      onMarkerClick?.(marker);
    },
    [finalConfig.radius, finalConfig.focusDistanceOffset, onMarkerClick]
  );

  const closeFocus = useCallback(() => setFocus(null), []);

  // Esc untuk keluar dari fokus
  useEffect(() => {
    if (!focus) return;
    const onKey = (e) => e.key === "Escape" && closeFocus();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus, closeFocus]);

  return (
    <div className={`globe3d-container ${className}`}>
      {!loaded && <GlobeLoading />}

      <Canvas
        dpr={[1, 1.25]}
        style={{ width: "100%", height: "100%", display: "block" }}
        resize={{ scroll: false, debounce: 0 }}
        camera={{ position: [0, 0, finalConfig.homeDistance], fov: 38, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
          stencil: false,
        }}
        onCreated={handleCreated}
      >
        <ResizeGuard />
        <GlobeScene
          markers={markers}
          config={finalConfig}
          focus={focus}
          onMarkerClick={handleMarkerClick}
          onMarkerHover={onMarkerHover}
        />
      </Canvas>

      {/* Vignette halus: kesan "masuk" ke dalam globe */}
      <div className="globe-focus-vignette" data-active={focus ? "true" : "false"} />

      {/* Kartu info marker */}
      {focus && (
        <div className="globe-focus-card" key={focus.marker.id ?? focus.marker.label}>
          {focus.marker.image && <img src={focus.marker.image} alt={focus.marker.label} />}

          <div className="globe-focus-text">
            {focus.marker.location && <small>{focus.marker.location}</small>}
            <strong>{focus.marker.label}</strong>

            <a
              className="globe-focus-maps"
              href={getMapsUrl(focus.marker)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Lihat di Maps
            </a>
          </div>

          <button
            type="button"
            className="globe-focus-close"
            onClick={closeFocus}
            aria-label="Keluar dari fokus"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default Globe3D;