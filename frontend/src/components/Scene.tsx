"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
uniform float uTime;
varying vec3 vPosition;
varying float vElevation;

// Pseudo-random noise function
float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// 2D Noise
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

void main() {
  vec3 pos = position;
  
  // Moving noise for rolling terrain effect
  vec2 noisePos = pos.xy * 0.12 + vec2(0.0, uTime * -0.4);
  float elevation = noise(noisePos) * 5.5;
  
  pos.z += elevation;
  vElevation = elevation;
  vPosition = pos;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = `
varying vec3 vPosition;
varying float vElevation;

void main() {
  // Match the Hero gradient (Red -> Orange -> White)
  vec3 lowColor = vec3(0.8, 0.0, 0.0);  // Deep Red for valleys
  vec3 midColor = vec3(1.0, 0.4, 0.0);  // Vibrant Orange for mids
  vec3 highColor = vec3(1.0, 1.0, 1.0); // Pure White for peaks
  
  // Adjust smoothstep so white only hits at the absolute tallest crests
  vec3 color = mix(lowColor, midColor, smoothstep(-1.0, 2.0, vElevation));
  color = mix(color, highColor, smoothstep(2.5, 5.0, vElevation));
  
  // Create grid lines (wireframe effect)
  vec2 grid = fract(vPosition.xy * 1.5);
  float lineThickness = 0.08;
  float isLine = step(grid.x, lineThickness) + step(grid.y, lineThickness);
  
  if (isLine < 0.1) discard; // Only render the grid lines
  
  // Fade out deeply in the distance
  float alpha = smoothstep(20.0, 5.0, length(vPosition.xy));
  
  gl_FragColor = vec4(color * (1.0 + vElevation * 0.2), alpha * 0.85);
}
`;

export function Scene({ status, progress }: { status: string; progress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }
  }), []);

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;
    
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    meshRef.current.rotation.z -= delta * 0.02; // Slow majestic rotation
  });

  return (
    <group rotation={[-Math.PI / 2.05, 0, 0]} position={[0, -4.0, -8]}>
      <mesh ref={meshRef}>
        <planeGeometry args={[50, 50, 150, 150]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent={true}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
