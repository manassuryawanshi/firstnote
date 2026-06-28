"use client";

import { Canvas } from "@react-three/fiber";
import { Scene } from "@/components/Scene";

export default function BackgroundScene() {
  return (
    <Canvas 
      camera={{ position: [0, 2, 5], fov: 75 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: "high-performance" }}
    >
      <Scene status="Idle" progress={0} />
    </Canvas>
  );
}
