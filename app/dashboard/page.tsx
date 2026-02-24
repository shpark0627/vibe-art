'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardNavbar from '@/components/dashboard/Navbar';
import { PromptArea } from '@/components/dashboard/PromptArea';
import * as THREE from 'three';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [user, loading, router]);

  useEffect(() => {
    const container = containerRef.current as HTMLDivElement | null;
    if (!container || container.offsetParent === null) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    container.appendChild(renderer.domElement);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0.0 },
        iResolution: { value: new THREE.Vector2(width, height) }
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;

        void main() {
          vec2 fragCoord = gl_FragCoord.xy;
          vec2 uv = fragCoord / iResolution.xy;

          // 격자 크기
          float gridSize = 60.0;

          // 정규화된 격자 좌표
          vec2 grid = mod(fragCoord, gridSize) / gridSize;

          // 격자선 두께
          float lineWidth = 0.08;

          // 가로선과 세로선
          float hLine = smoothstep(lineWidth, 0.0, abs(grid.y - 0.5) * 2.0);
          float vLine = smoothstep(lineWidth, 0.0, abs(grid.x - 0.5) * 2.0);
          float gridLine = max(hLine, vLine);

          // 배경색
          vec3 bgColor = vec3(0.03, 0.06, 0.12);

          // 격자선 색상
          vec3 lineColor = vec3(0.06, 0.72, 0.83);

          // 시간에 따른 색상 변화
          vec3 alternateColor = vec3(0.08, 0.72, 0.65);
          float colorShift = sin(iTime * 0.3) * 0.5 + 0.5;
          lineColor = mix(lineColor, alternateColor, colorShift);

          // 교점 강조
          float intersection = hLine * vLine;
          lineColor = mix(lineColor, vec3(0.06, 0.82, 0.93), intersection * 0.4);

          // 최종 색상
          vec3 finalColor = mix(bgColor, lineColor, gridLine);

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let frameId: number;
    const animate = () => {
      material.uniforms.iTime.value += 0.016;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;
      renderer.setSize(newWidth, newHeight);
      material.uniforms.iResolution.value.set(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Three.js Canvas Background */}
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col">
        <DashboardNavbar email={email} />

        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <PromptArea
            placeholder="AI 썸네일 디자인을 설명해주세요..."
            onSearch={(query) => {
              console.log('Search query:', query);
            }}
          />
        </main>
      </div>
    </div>
  );
}