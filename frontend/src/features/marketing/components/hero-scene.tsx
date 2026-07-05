"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";

/**
 * Aurora particle field — the landing hero's WebGL scene.
 *
 * Implementation notes (per Three.js performance best practice):
 * - THREE.Points + one custom ShaderMaterial → a single draw call for ~12k
 *   particles; all wave motion runs on the GPU in the vertex shader.
 * - Animation via direct uniform mutation in useFrame (no React state).
 * - Additive blending + soft round sprites → glow without post-processing.
 * - Pointer feeds a uniform; the wave crests rise around the cursor.
 */

const COUNT_X = 180;
const COUNT_Z = 70;
const SPREAD_X = 46;
const SPREAD_Z = 22;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  varying float vIntensity;
  varying vec3 vColor;

  // Champagne palette: bronze base -> ivory sheen -> gold crests
  const vec3 BRONZE = vec3(0.42, 0.35, 0.22);
  const vec3 IVORY  = vec3(0.86, 0.83, 0.74);
  const vec3 GOLD   = vec3(0.92, 0.78, 0.47);

  void main() {
    vec3 pos = position;

    // Layered travelling waves
    float wave =
        sin(pos.x * 0.28 + uTime * 0.9) * 0.55
      + sin(pos.z * 0.45 - uTime * 0.7) * 0.45
      + sin((pos.x + pos.z) * 0.18 + uTime * 0.5) * 0.6;

    // Cursor swell: crests rise near the pointer (pointer in world x/z)
    float dist = distance(pos.xz, uPointer);
    float swell = smoothstep(9.0, 0.0, dist) * 1.6;
    pos.y += wave + swell;

    float height = (wave + swell + 1.6) / 3.2; // 0..1-ish
    vIntensity = clamp(height, 0.0, 1.0);

    // Blend color across width + height (monochrome-warm, gold on crests)
    float xMix = (position.x / ${SPREAD_X.toFixed(1)}) + 0.5;
    vec3 base = mix(BRONZE, IVORY, clamp(xMix * 0.85 + 0.1, 0.0, 1.0));
    vColor = mix(base, GOLD, vIntensity * 0.65);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = (1.2 + vIntensity * 2.6) * (34.0 / -mvPosition.z);
  }
`;

const fragmentShader = /* glsl */ `
  varying float vIntensity;
  varying vec3 vColor;

  void main() {
    // Soft round sprite
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float alpha = smoothstep(0.5, 0.05, d) * (0.25 + vIntensity * 0.75);
    gl_FragColor = vec4(vColor, alpha);
  }
`;

function ParticleField() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const positions = useMemo(() => {
    const array = new Float32Array(COUNT_X * COUNT_Z * 3);
    let i = 0;
    for (let x = 0; x < COUNT_X; x++) {
      for (let z = 0; z < COUNT_Z; z++) {
        array[i++] = (x / (COUNT_X - 1) - 0.5) * SPREAD_X;
        array[i++] = 0;
        array[i++] = (z / (COUNT_Z - 1) - 0.5) * SPREAD_Z;
      }
    }
    return array;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
    }),
    [],
  );

  useFrame((state) => {
    const material = materialRef.current;
    if (!material) return;
    material.uniforms.uTime!.value = state.clock.elapsedTime;
    // Map normalized pointer (-1..1) into the field's world x/z
    const target = material.uniforms.uPointer!.value as THREE.Vector2;
    target.lerp(
      new THREE.Vector2(
        state.pointer.x * (SPREAD_X / 2),
        -state.pointer.y * (SPREAD_Z / 2),
      ),
      0.06,
    );
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
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

/** Full-bleed canvas. Mount client-side only (dynamic import, ssr: false). */
export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 5.2, 13], fov: 52 }}
      gl={{
        powerPreference: "high-performance",
        antialias: false,
        alpha: true,
        stencil: false,
      }}
      aria-hidden
    >
      <ParticleField />
    </Canvas>
  );
}
