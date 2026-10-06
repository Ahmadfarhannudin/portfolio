/* eslint-disable react/no-unknown-property */
'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';

import cardGLB from './card.glb';
import lanyard from './lanyard.png';

import * as THREE from 'three';
import './Lanyard.css';

extend({ MeshLineGeometry, MeshLineMaterial });

const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT  = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

function isImageReady(img) {
  return img && img.width > 0 && img.height > 0 && (img.complete === undefined || img.complete);
}

function drawFitted(ctx, img, rect, W, H, imageFit) {
  if (!isImageReady(img)) return;
  const rx = rect.x * W, ry = rect.y * H, rw = rect.w * W, rh = rect.h * H;
  const pick  = imageFit === 'contain' ? Math.min : Math.max;
  const scale = pick(rw / img.width, rh / img.height);
  const dw = img.width * scale, dh = img.height * scale;
  const dx = rx + (rw - dw) / 2, dy = ry + (rh - dh) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rx, ry, rw, rh);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

// ─── Pixel-grid transition engine ──────────────────────────────────────────
// Mirrors Reactbits PixelTransition exactly:
//   Phase 1 – pixels appear in random order covering the card face
//   Phase 2 – underlying content swaps
//   Phase 3 – pixels disappear in random order revealing new content
//
// Works by painting solid-colour squares onto the canvas texture in the same
// shuffled stagger cadence GSAP uses on DOM divs in the reference component.

class PixelGridTransition {
  /**
   * @param {CanvasRenderingContext2D} ctx       – card texture canvas context
   * @param {{ x,y,w,h }}             uvRect     – normalised UV region to animate
   * @param {number}                  canvasW
   * @param {number}                  canvasH
   * @param {number}                  gridSize   – cells per axis (e.g. 7 → 49 cells)
   * @param {string}                  pixelColor – fill colour for pixel blocks
   * @param {number}                  stepMs     – total cover or uncover duration (ms)
   */
  constructor(ctx, uvRect, canvasW, canvasH, gridSize, pixelColor, stepMs) {
    this.ctx        = ctx;
    this.uvRect     = uvRect;
    this.W          = canvasW;
    this.H          = canvasH;
    this.gridSize   = gridSize;
    this.pixelColor = pixelColor;
    this.stepMs     = stepMs;

    // Pixel dimensions in canvas pixels
    const rx = uvRect.x * canvasW, ry = uvRect.y * canvasH;
    const rw = uvRect.w * canvasW, rh = uvRect.h * canvasH;
    this.rx = rx; this.ry = ry; this.rw = rw; this.rh = rh;
    this.cellW = rw / gridSize;
    this.cellH = rh / gridSize;

    this._buildOrder();

    // State
    this.phase      = 'idle';   // 'cover' | 'uncover' | 'idle'
    this.t0         = 0;
    this.onMidpoint = null;     // called once the grid is fully covered
    this.onDone     = null;
  }

  _buildOrder() {
    const total = this.gridSize * this.gridSize;
    this.order  = Array.from({ length: total }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = total - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.order[i], this.order[j]] = [this.order[j], this.order[i]];
    }
    this.uncoverOrder = [...this.order].reverse(); // separate random order for uncover
    for (let i = this.order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.uncoverOrder[i], this.uncoverOrder[j]] = [this.uncoverOrder[j], this.uncoverOrder[i]];
    }
  }

  /**
   * Start a full cover→swap→uncover cycle.
   * @param {function} onMidpoint  called when grid is fully covered (swap content now)
   * @param {function} onDone      called when grid is fully cleared
   */
  start(onMidpoint, onDone) {
    this._buildOrder();   // fresh shuffle every time
    this.phase      = 'cover';
    this.t0         = performance.now();
    this.onMidpoint = onMidpoint;
    this.onDone     = onDone;
    this._midpointFired = false;
  }

  /** Call from useFrame – returns true if a texture upload is needed this frame */
  tick(baseCanvas, now) {
    if (this.phase === 'idle') return false;

    const elapsed  = now - this.t0;
    const total    = this.gridSize * this.gridSize;
    const stagger  = this.stepMs / total;   // ms per cell

    if (this.phase === 'cover') {
      const visible = Math.min(total, Math.floor(elapsed / stagger) + 1);

      // Only redraw the front UV rect area instead of the whole texture atlas
      this.ctx.drawImage(
        baseCanvas,
        this.rx, this.ry, this.rw, this.rh,
        this.rx, this.ry, this.rw, this.rh
      );
      this.ctx.fillStyle = this.pixelColor;
      for (let i = 0; i < visible; i++) {
        const idx = this.order[i];
        const col = idx % this.gridSize;
        const row = Math.floor(idx / this.gridSize);
        this.ctx.fillRect(
          this.rx + col * this.cellW,
          this.ry + row * this.cellH,
          this.cellW + 0.5,   // +0.5 plugs sub-pixel gaps
          this.cellH + 0.5
        );
      }

      if (visible >= total && !this._midpointFired) {
        this._midpointFired = true;
        if (this.onMidpoint) this.onMidpoint();
        // Immediately start uncover from current time
        this.phase = 'uncover';
        this.t0    = performance.now();
      }
      return true;
    }

    if (this.phase === 'uncover') {
      const hidden = Math.min(total, Math.floor(elapsed / stagger) + 1);

      // Draw the new base in the front UV rect
      this.ctx.drawImage(
        baseCanvas,
        this.rx, this.ry, this.rw, this.rh,
        this.rx, this.ry, this.rw, this.rh
      );
      // Paint the remaining (not-yet-hidden) pixels
      const remaining = total - hidden;
      this.ctx.fillStyle = this.pixelColor;
      for (let i = 0; i < remaining; i++) {
        const idx = this.uncoverOrder[i];
        const col = idx % this.gridSize;
        const row = Math.floor(idx / this.gridSize);
        this.ctx.fillRect(
          this.rx + col * this.cellW,
          this.ry + row * this.cellH,
          this.cellW + 0.5,
          this.cellH + 0.5
        );
      }

      if (hidden >= total) {
        this.phase = 'idle';
        if (this.onDone) this.onDone();
      }
      return true;
    }

    return false;
  }
}

// ───────────────────────────────────────────────────────────────────────────

function PauseWhenOffscreen({ active }) {
  const { invalidate } = useThree();
  useEffect(() => { if (active) invalidate(); }, [active, invalidate]);
  return null;
}

export default function Lanyard({
  position      = [0, 0, 30],
  gravity       = [0, -40, 0],
  fov           = 20,
  transparent   = true,
  frontImage    = null,
  backImage     = null,
  imageFit      = 'cover',
  lanyardImage  = null,
  lanyardWidth  = 1,
  cardScale     = 2.25,
  hoverImage    = null,
  // Reactbits-style pixel grid settings
  gridSize      = 7,           // cells per axis
  pixelColor    = '#ffffff',   // colour of pixel blocks during transition
  transitionMs  = 300,         // cover OR uncover duration (total for all cells)
}) {
  const wrapperRef = useRef(null);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { root: null, rootMargin: '120px 0px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="lanyard-wrapper" ref={wrapperRef}>
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1 : 1.25]}
        frameloop={inView ? 'always' : 'never'}
        gl={{
          alpha: transparent,
          antialias: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl }) =>
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)
        }
      >
        <PauseWhenOffscreen active={inView} />
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60} paused={!inView}>
          <Band
            isMobile={isMobile}
            inView={inView}
            frontImage={frontImage}
            backImage={backImage}
            imageFit={imageFit}
            lanyardImage={lanyardImage}
            lanyardWidth={lanyardWidth}
            cardScale={cardScale}
            hoverImage={hoverImage}
            gridSize={gridSize}
            pixelColor={pixelColor}
            transitionMs={transitionMs}
          />
        </Physics>
        <Environment blur={0.75} resolution={isMobile ? 128 : 256} frames={1}>
          <Lightformer intensity={2}  color="white" position={[0,  -1,  5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3}  color="white" position={[-1, -1,  1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3}  color="white" position={[1,   1,  1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}

// ─── Band (physics rope + card) ────────────────────────────────────────────

function Band({
  maxSpeed      = 50,
  minSpeed      = 0,
  isMobile      = false,
  frontImage    = null,
  backImage     = null,
  imageFit      = 'cover',
  lanyardImage  = null,
  lanyardWidth  = 1,
  cardScale     = 2.25,
  hoverImage    = null,
  gridSize      = 7,
  pixelColor    = '#ffffff',
  transitionMs  = 300,
}) {
  const band = useRef(), fixed = useRef(), j1 = useRef(), j2 = useRef(),
        j3   = useRef(), card  = useRef();
  const vec  = new THREE.Vector3(), ang = new THREE.Vector3(),
        rot  = new THREE.Vector3(), dir = new THREE.Vector3();
  const segmentProps = {
    type: 'dynamic', canSleep: true, colliders: false,
    angularDamping: 4, linearDamping: 4
  };

  const { nodes, materials } = useGLTF(cardGLB);
  const texture  = useTexture(lanyardImage || lanyard);
  const frontTex = useTexture(frontImage   || BLANK_PIXEL);
  const backTex  = useTexture(backImage    || BLANK_PIXEL);
  const hoverTex = useTexture(hoverImage   || BLANK_PIXEL);

  const [, forceUpdate] = useState(0);

  const layersRef = useRef(null);
  const [cardMap, setCardMap] = useState(() => materials.base.map);
  const pixelTransitionEnabled = !!hoverImage;
  const [curve] = useState(
    () => new THREE.CatmullRomCurve3([
      new THREE.Vector3(), new THREE.Vector3(),
      new THREE.Vector3(), new THREE.Vector3(),
    ])
  );
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);
  const draggedRef = useRef(false);

  // ── Pause flag: true = engine tidak boleh tick ─────────────────────────
  const pixelPausedRef = useRef(false);

  // ── Rope geometry skip: jangan rebuild meshline kalau tali nyaris diam ──
  const lastRopePosRef = useRef(null);
  const ropeFrameRef = useRef(0);

  // ── Settle sensor state ────────────────────────────────────────────────
  const waitingToSettleRef  = useRef(false);
  const settleFrameCountRef = useRef(0);
  const SETTLE_FRAMES       = 12;    // frame stabil berturut-turut
  const SETTLE_LIN_THRESH   = 0.25;  // m/s linear
  const SETTLE_ANG_THRESH   = 0.25;  // rad/s angular

  useEffect(() => {
    const imgs     = [[frontImage, frontTex], [hoverImage, hoverTex]];
    const cleanups = [];
    imgs.forEach(([src, tex]) => {
      const img = tex.image;
      if (src && img && !(img.width > 0 && img.height > 0)) {
        const handle = () => forceUpdate(n => n + 1);
        img.addEventListener?.('load', handle);
        cleanups.push(() => img.removeEventListener?.('load', handle));
      }
    });
    return () => cleanups.forEach(fn => fn());
  }, [frontImage, hoverImage, frontTex, hoverTex]);

  useEffect(() => {
    const baseMap = materials.base.map;
    if (!baseMap?.image?.width) return;
    const w = baseMap.image.width;
    const h = baseMap.image.height;

    const baseCanvas = document.createElement('canvas');
    baseCanvas.width  = w;
    baseCanvas.height = h;
    const baseCtx = baseCanvas.getContext('2d');
    baseCtx.drawImage(baseMap.image, 0, 0, w, h);
    if (backImage) drawFitted(baseCtx, backTex.image, BACK_UV_RECT, w, h, imageFit);

    const canvasA = document.createElement('canvas');
    canvasA.width  = w;
    canvasA.height = h;
    const ctxA = canvasA.getContext('2d');
    ctxA.drawImage(baseCanvas, 0, 0);
    if (frontImage && isImageReady(frontTex.image))
      drawFitted(ctxA, frontTex.image, FRONT_UV_RECT, w, h, imageFit);

    const canvasB = document.createElement('canvas');
    canvasB.width  = w;
    canvasB.height = h;
    const ctxB = canvasB.getContext('2d');
    ctxB.drawImage(baseCanvas, 0, 0);
    if (hoverImage && isImageReady(hoverTex.image))
      drawFitted(ctxB, hoverTex.image, FRONT_UV_RECT, w, h, imageFit);

    const outCanvas = document.createElement('canvas');
    outCanvas.width  = w;
    outCanvas.height = h;
    const outCtx = outCanvas.getContext('2d');
    outCtx.drawImage(canvasA, 0, 0);

    const tex = new THREE.CanvasTexture(outCanvas);
    tex.colorSpace      = THREE.SRGBColorSpace;
    tex.flipY           = baseMap.flipY;
    tex.anisotropy      = 4;
    tex.generateMipmaps = false;
    tex.minFilter       = THREE.LinearFilter;
    tex.magFilter       = THREE.LinearFilter;
    tex.needsUpdate     = true;

    layersRef.current = {
      outCanvas, outCtx,
      baseA: canvasA,
      baseB: canvasB,
      currentBase: 'A',
      w, h, texture: tex,
    };

    setCardMap(tex);
  }, [frontImage, backImage, hoverImage, imageFit,
      frontTex, backTex, hoverTex, materials.base.map]);

  // ── Pixel-grid engine ──────────────────────────────────────────────────
  const pixelEngineRef = useRef(null);

  useEffect(() => {
    const L = layersRef.current;
    if (!L) return;
    pixelEngineRef.current = new PixelGridTransition(
      L.outCtx, FRONT_UV_RECT, L.w, L.h, gridSize, pixelColor, transitionMs
    );
  }, [layersRef.current, gridSize, pixelColor, transitionMs]);

  // ── Engine helpers ─────────────────────────────────────────────────────
  const transitionInProgress = useRef(false);
  const pixelFrameRef        = useRef(0);

  const pausePixelEngine = useCallback(() => {
    pixelPausedRef.current = true;
    const engine = pixelEngineRef.current;
    if (engine) engine.phase = 'idle';
    transitionInProgress.current = false;
  }, []);

  const resumePixelEngine = useCallback(() => {
    pixelPausedRef.current = false;
  }, []);

  const snapToBase = useCallback((base) => {
    const L = layersRef.current;
    if (!L) return;
    L.outCtx.drawImage(base === 'B' ? L.baseB : L.baseA, 0, 0);
    L.currentBase = base;
    L.texture.needsUpdate = true;
  }, []);

  const triggerTransition = useCallback((toBase) => {
    if (pixelPausedRef.current) return;
    const L      = layersRef.current;
    const engine = pixelEngineRef.current;
    if (!L || !engine) return;
    if (transitionInProgress.current) return;
    if (L.currentBase === toBase) return;

    transitionInProgress.current = true;
    engine.start(
      () => {
        if (pixelPausedRef.current) {
          engine.phase = 'idle';
          transitionInProgress.current = false;
          return;
        }
        L.outCtx.drawImage(toBase === 'B' ? L.baseB : L.baseA, 0, 0);
        L.currentBase = toBase;
      },
      () => { transitionInProgress.current = false; }
    );
  }, []);

  const handlePointerOverCard = useCallback(() => {
    if (!pixelTransitionEnabled || draggedRef.current) return;
    triggerTransition('B');
  }, [pixelTransitionEnabled, triggerTransition]);

  const handlePointerOutCard = useCallback(() => {
    if (!pixelTransitionEnabled || draggedRef.current) return;
    triggerTransition('A');
  }, [pixelTransitionEnabled, triggerTransition]);

  // ── useFrame ───────────────────────────────────────────────────────────
  useFrame((state, delta) => {
    // Physics drag
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();

      // Project pointer ke plane kedalaman z milik card agar halus & tidak mental di mobile
      const cardZ = card.current ? card.current.translation().z : 0;
      const distance = (cardZ - state.camera.position.z) / dir.z;
      vec.copy(state.camera.position).add(dir.multiplyScalar(distance));

      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());

      const targetX = vec.x - dragged.x;
      const targetY = vec.y - dragged.y;
      const targetZ = vec.z - dragged.z;

      // Restrain posisi ekstrem agar tali tidak acak-acakan di layar sentuh
      card.current?.setNextKinematicTranslation({
        x: Math.max(-8, Math.min(8, targetX)),
        y: Math.max(-8, Math.min(6, targetY)),
        z: Math.max(-5, Math.min(5, targetZ)),
      });
    }

    // Physics rope
    if (fixed.current && j3.current && band.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current) return;
        if (!ref.current.lerped)
          ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDist = Math.max(
          0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation()))
        );
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDist * (maxSpeed - minSpeed))
        );
      });
      // Skip rebuild geometri tali kalau posisi nyaris tidak berubah (hemat GPU)
      const jp = j3.current.translation();
      const last = lastRopePosRef.current;
      const moved = !last || Math.abs(jp.x - last.x) + Math.abs(jp.y - last.y) + Math.abs(jp.z - last.z) > 0.004;
      ropeFrameRef.current = (ropeFrameRef.current + 1) % 2;
      // Di mobile: update geometri tiap 2 frame saja saat bergerak
      const doUpdate = moved && (!isMobile || ropeFrameRef.current === 0 || !last);
      if (doUpdate) {
        curve.points[0].copy(jp);
        curve.points[1].copy(j2.current.lerped ?? j2.current.translation());
        curve.points[2].copy(j1.current.lerped ?? j1.current.translation());
        curve.points[3].copy(fixed.current.translation());
        band.current.geometry.setPoints(curve.getPoints(isMobile ? 8 : 12));
        lastRopePosRef.current = { x: jp.x, y: jp.y, z: jp.z };
      }
      if (card.current) {
        ang.copy(card.current.angvel());
        rot.copy(card.current.rotation());
        card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
      }
    }

    // ── Settle sensor ─────────────────────────────────────────────────────
    if (waitingToSettleRef.current && card.current) {
      const lv = card.current.linvel();
      const av = card.current.angvel();

      const linSpeed = Math.sqrt(lv.x * lv.x + lv.y * lv.y + lv.z * lv.z);
      const angSpeed = Math.sqrt(av.x * av.x + av.y * av.y + av.z * av.z);

      if (linSpeed < SETTLE_LIN_THRESH && angSpeed < SETTLE_ANG_THRESH) {
        settleFrameCountRef.current += 1;
      } else {
        // Masih bergerak — reset counter
        settleFrameCountRef.current = 0;
      }

      if (settleFrameCountRef.current >= SETTLE_FRAMES) {
        // Kartu sudah benar-benar diam ✓
        waitingToSettleRef.current  = false;
        settleFrameCountRef.current = 0;
        resumePixelEngine();
        // Trigger animasi pixel sekali sebagai sinyal "kartu sudah siap"
        triggerTransition('B');
      }
    }

    // ── Pixel engine tick ─────────────────────────────────────────────────
    if (pixelPausedRef.current) return;

    pixelFrameRef.current = (pixelFrameRef.current + 1) % 2;
    if (pixelFrameRef.current !== 0) return;

    const L      = layersRef.current;
    const engine = pixelEngineRef.current;
    if (L && engine && pixelTransitionEnabled) {
      const baseCanvas = L.currentBase === 'A' ? L.baseA : L.baseB;
      const dirty = engine.tick(baseCanvas, performance.now());
      if (dirty) L.texture.needsUpdate = true;
    }
  });

  useRopeJoint(fixed, j1, [[0,0,0],[0,0,0],1]);
  useRopeJoint(j1,   j2, [[0,0,0],[0,0,0],1]);
  useRopeJoint(j2,   j3, [[0,0,0],[0,0,0],1]);
  const jointOffset = isMobile ? 1.82 * (cardScale / 2.25) : 1.5 * (cardScale / 2.25);
  useSphericalJoint(j3, card, [[0,0,0],[0,jointOffset,0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8 * (cardScale / 2.25), 1.125 * (cardScale / 2.25), 0.01]} />
          <group
            scale={cardScale}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => {
              hover(true);
              handlePointerOverCard();
            }}
            onPointerOut={() => {
              hover(false);
              if (!draggedRef.current) handlePointerOutCard();
            }}
            onPointerUp={e => {
              e.target.releasePointerCapture(e.pointerId);
              draggedRef.current = false;
              drag(false);

              // Snap langsung ke foto asli, tanpa animasi pixel
              snapToBase('A');

              // Mulai settle sensor — engine masih pause sampai kartu diam
              waitingToSettleRef.current  = true;
              settleFrameCountRef.current = 0;
            }}
            onPointerDown={e => {
              e.target.setPointerCapture(e.pointerId);
              draggedRef.current = true;

              // Batalkan settle yang mungkin sedang berjalan
              waitingToSettleRef.current  = false;
              settleFrameCountRef.current = 0;

              // Pause engine, pertahankan gambar yang sedang tampil
              pausePixelEngine();

              // Hitung titik drag di bidang kedalaman kartu (anti-lompat)
              const cam = e.camera;
              vec.set(
                (e.clientX / window.innerWidth) * 2 - 1,
                -(e.clientY / window.innerHeight) * 2 + 1,
                0.5
              ).unproject(cam);
              dir.copy(vec).sub(cam.position).normalize();
              const cardZ = card.current ? card.current.translation().z : 0;
              const distance = (cardZ - cam.position.z) / dir.z;
              vec.copy(cam.position).add(dir.multiplyScalar(distance));

              drag(new THREE.Vector3().copy(vec).sub(card.current.translation()));
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={4}
                clearcoat={0}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry}  material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}