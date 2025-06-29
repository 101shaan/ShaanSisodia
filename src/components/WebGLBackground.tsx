import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

const NoiseShader = () => {
  const meshRef = useRef<Mesh>(null);

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float u_time;
    uniform vec2 u_resolution;
    varying vec2 vUv;
    
    // Simplex noise function
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g; g.x = a0.x * x0.x + h.x * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    void main() {
      vec2 st = vUv * 2.0;
      float noise1 = snoise(st + u_time * 0.15) * 0.5 + 0.5;
      float noise2 = snoise(st * 2.0 + u_time * 0.1) * 0.5 + 0.5;
      float noise3 = snoise(st * 4.0 - u_time * 0.05) * 0.5 + 0.5;
      
      float combined = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
      
      vec3 color1 = vec3(0.043, 0.047, 0.063); // #0B0C10
      vec3 color2 = vec3(0.0, 0.678, 0.710); // #00ADB5
      vec3 color3 = vec3(0.086, 0.086, 0.086); // #161616
      
      vec3 finalColor = mix(color1, color3, combined);
      finalColor = mix(finalColor, color2 * 0.1, combined * 0.3);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;
  

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_resolution: { value: [window.innerWidth, window.innerHeight] },
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as any;
      material.uniforms.u_time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} scale={[2, 2, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

const WebGLBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
      >
        <NoiseShader />
      </Canvas>
    </div>
  );
};

export default WebGLBackground;