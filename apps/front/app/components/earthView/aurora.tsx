import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AuroraPoint } from '@/types/aurora';

interface AuroraProps {
  auroraData: AuroraPoint[];
  visible?: boolean;
}

// Vertex shader for aurora effect
const auroraVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader for aurora glow effect
const auroraFragmentShader = `
  uniform float time;
  uniform sampler2D auroraTexture;
  uniform float opacity;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  // Simplex noise function for aurora movement
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    // Sample aurora probability from texture
    vec4 auroraValue = texture2D(auroraTexture, vUv);
    float probability = auroraValue.r;
    
    if (probability < 0.05) {
      discard;
    }
    
    // Create animated noise for aurora movement
    float noise1 = snoise(vec3(vUv * 3.0, time * 0.3)) * 0.5 + 0.5;
    float noise2 = snoise(vec3(vUv * 6.0, time * 0.5 + 100.0)) * 0.5 + 0.5;
    float combinedNoise = mix(noise1, noise2, 0.5);
    
    // Aurora colors - green to purple gradient
    vec3 greenAurora = vec3(0.2, 1.0, 0.4);
    vec3 blueAurora = vec3(0.3, 0.6, 1.0);
    vec3 purpleAurora = vec3(0.8, 0.3, 1.0);
    
    // Mix colors based on probability and noise
    vec3 auroraColor = mix(greenAurora, blueAurora, combinedNoise);
    auroraColor = mix(auroraColor, purpleAurora, probability * noise2);
    
    // Calculate glow intensity
    float glowIntensity = probability * (0.6 + 0.4 * combinedNoise);
    
    // Edge glow effect
    float edgeFactor = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
    glowIntensity *= (1.0 + edgeFactor * 0.5);
    
    // Final color with glow
    vec3 finalColor = auroraColor * glowIntensity * 1.5;
    float alpha = glowIntensity * opacity * (0.4 + 0.6 * combinedNoise);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

/**
 * Convert aurora data points to a texture for the shader
 */
function createAuroraTexture(auroraData: AuroraPoint[]): THREE.DataTexture {
  // Create a 360x180 texture (1 degree resolution)
  const width = 360;
  const height = 180;
  const data = new Float32Array(width * height * 4);

  // Initialize with zeros
  data.fill(0);

  // Fill texture with aurora data
  for (const point of auroraData) {
    // Convert longitude (-180 to 180) to x (0 to 360)
    let x = Math.round(point.longitude + 180);
    if (x >= width) x = width - 1;
    if (x < 0) x = 0;

    // Convert latitude (-90 to 90) to y (0 to 180), inverted
    let y = Math.round(90 - point.latitude);
    if (y >= height) y = height - 1;
    if (y < 0) y = 0;

    const idx = (y * width + x) * 4;
    const probability = point.aurora / 100; // Normalize to 0-1

    // Store probability in red channel
    data[idx] = probability;
    data[idx + 1] = probability;
    data[idx + 2] = probability;
    data[idx + 3] = 1;

    // Spread to nearby pixels for smoother appearance
    const spread = 2;
    for (let dy = -spread; dy <= spread; dy++) {
      for (let dx = -spread; dx <= spread; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nidx = (ny * width + nx) * 4;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const falloff = Math.max(0, 1 - distance / (spread + 1));
          data[nidx] = Math.max(data[nidx], probability * falloff);
          data[nidx + 1] = Math.max(data[nidx + 1], probability * falloff);
          data[nidx + 2] = Math.max(data[nidx + 2], probability * falloff);
          data[nidx + 3] = 1;
        }
      }
    }
  }

  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);
  texture.needsUpdate = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return texture;
}

export function Aurora({ auroraData, visible = true }: AuroraProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Create aurora texture from data
  const auroraTexture = useMemo(() => {
    if (!auroraData || auroraData.length === 0) return null;
    return createAuroraTexture(auroraData);
  }, [auroraData]);

  // Shader uniforms
  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      auroraTexture: { value: auroraTexture },
      opacity: { value: 0.8 },
    }),
    [auroraTexture]
  );

  // Animate the aurora
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  if (!auroraTexture || !visible) return null;

  return (
    <mesh ref={meshRef}>
      {/* Slightly larger sphere than Earth to create aurora layer above surface */}
      <sphereGeometry args={[1.02, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={auroraVertexShader}
        fragmentShader={auroraFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.FrontSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export default Aurora;

