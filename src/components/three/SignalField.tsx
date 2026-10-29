"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import useMediaQuery from "@/components/motion/useMediaQuery";

// A sheet of points receding to the horizon, swelling with noise like a slow data stream.
// The pointer lifts and ripples the sheet beneath it; with no pointer, a target drifts on its own.

const COLS = 220;
const ROWS = 120;
const WIDTH = 64;
const DEPTH = 44;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uPointerStrength;
  uniform float uPixelRatio;
  attribute float aSeed;
  varying float vAlpha;
  varying float vHeat;

  // 2D simplex noise, Ashima Arts (MIT).
  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec3 p = position;
    float t = uTime * 0.09;

    float swell = snoise(vec2(p.x * 0.055 + t, p.z * 0.08 - t * 1.4)) * 1.05
                + snoise(vec2(p.x * 0.19 - t * 0.7, p.z * 0.21 + t * 0.3)) * 0.22;
    float stream = sin(p.x * 0.3 - uTime * 0.55 + p.z * 0.05) * 0.09;

    float d = distance(p.xz, uPointer);
    float lift = exp(-d * d * 0.07) * 1.1 * uPointerStrength;
    float ripple = sin(d * 1.9 - uTime * 2.6) * exp(-d * 0.38) * 0.32 * uPointerStrength;

    p.y += swell + stream + lift + ripple;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float depth = -mv.z;
    gl_PointSize = (1.6 + aSeed * 1.1 + lift * 1.8) * uPixelRatio * (14.0 / depth);

    float edge = 1.0 - smoothstep(WIDTH_HALF * 0.55, WIDTH_HALF, abs(p.x));
    vAlpha = smoothstep(46.0, 9.0, depth) * smoothstep(1.5, 5.0, depth) * edge;
    vHeat = clamp(lift * 0.9 + abs(ripple) * 1.4 + max(swell - 0.55, 0.0) * 0.9, 0.0, 1.0);
  }
`.replaceAll("WIDTH_HALF", (WIDTH / 2).toFixed(1));

const fragmentShader = /* glsl */ `
  uniform vec3 uBone;
  uniform vec3 uBrand;
  varying float vAlpha;
  varying float vHeat;

  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float soft = smoothstep(0.5, 0.05, r);
    vec3 color = mix(uBone, uBrand, vHeat);
    gl_FragColor = vec4(color, soft * vAlpha * (0.55 + vHeat * 0.45));
  }
`;

// Scratch objects for the frame loop; there is only ever one field on the page.
const raycaster = new THREE.Raycaster();
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const hit = new THREE.Vector3();
const target = new THREE.Vector2(0, -4);
const lookAt = new THREE.Vector3(0, 0, -8);

// A stable per-point value in [0, 1).
const seed = (i: number) => {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

function Field({ reduce }: { reduce: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(COLS * ROWS * 3);
    const seeds = new Float32Array(COLS * ROWS);
    let i = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        positions[i * 3] = (c / (COLS - 1) - 0.5) * WIDTH;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = -(r / (ROWS - 1)) * DEPTH + 6;
        seeds[i] = seed(i);
        i++;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, -4) },
      uPointerStrength: { value: 0 },
      uPixelRatio: { value: 1 },
      uBone: { value: new THREE.Color("#e6e7ec") },
      uBrand: { value: new THREE.Color("#a079ff") },
    }),
    [],
  );

  // The pointer lives on the window: the canvas sits under the page and never receives events.
  const pointer = useRef({ ndc: new THREE.Vector2(), active: false, lastMove: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.current.ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      pointer.current.active = true;
      pointer.current.lastMove = performance.now();
    };
    const onLeave = () => { pointer.current.active = false; };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    const { camera, gl } = state;
    const time = state.clock.elapsedTime;
    u.uTime.value = reduce ? 12 : time;
    u.uPixelRatio.value = gl.getPixelRatio();

    // Follow the pointer while it has moved recently; otherwise wander on a slow lissajous.
    const p = pointer.current;
    const following = p.active && performance.now() - p.lastMove < 2500;
    if (following) {
      raycaster.setFromCamera(p.ndc, camera);
      if (raycaster.ray.intersectPlane(plane, hit)) target.set(hit.x, hit.z);
    } else {
      target.set(Math.sin(time * 0.21) * 11, -6 + Math.sin(time * 0.33) * 5);
    }
    const k = 1 - Math.exp(-delta * (following ? 5 : 1.2));
    u.uPointer.value.lerp(target, k);
    u.uPointerStrength.value += ((reduce ? 0 : following ? 1 : 0.6) - u.uPointerStrength.value) * k;

    // Scrolling down tips the camera up and over the field.
    const scroll = Math.min(window.scrollY / window.innerHeight, 1.2);
    camera.position.y = 2.5 + scroll * 2.2;
    camera.position.z = 9 - scroll * 1.5;
    lookAt.y = -scroll * 1.6;
    camera.lookAt(lookAt);
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function SignalField({ className }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!wrap.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrap}
      className={`${className ?? ""} transition-opacity duration-2400 ease-out ${ready ? "opacity-100" : "opacity-0"}`}
    >
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 2.5, 9], fov: 52, near: 0.1, far: 80 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        frameloop={!visible ? "never" : reduce ? "demand" : "always"}
        onCreated={() => setReady(true)}
      >
        <Field reduce={reduce} />
      </Canvas>
    </div>
  );
}
