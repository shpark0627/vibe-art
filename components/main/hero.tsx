'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Hero = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;

        #define NUM_OCTAVES 3

        float rand(vec2 n) {
          return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 u = fract(p);
          u = u*u*(3.0-2.0*u);

          float res = mix(
            mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
            mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x), u.y);
          return res * res;
        }

        float fbm(vec2 x) {
          float v = 0.0;
          float a = 0.3;
          vec2 shift = vec2(100);
          mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
          for (int i = 0; i < NUM_OCTAVES; ++i) {
            v += a * noise(x);
            x = rot * x * 2.0 + shift;
            a *= 0.4;
          }
          return v;
        }

        void main() {
          vec2 shake = vec2(sin(iTime * 1.2) * 0.005, cos(iTime * 2.1) * 0.005);
          vec2 p = ((gl_FragCoord.xy + shake * iResolution.xy) - iResolution.xy * 0.5) / iResolution.y * mat2(6.0, -4.0, 4.0, 6.0);
          vec2 v;
          vec4 o = vec4(0.0);

          float f = 2.0 + fbm(p + vec2(iTime * 5.0, 0.0)) * 0.5;

          for (float i = 0.0; i < 35.0; i++) {
            v = p + cos(i * i + (iTime + p.x * 0.08) * 0.025 + i * vec2(13.0, 11.0)) * 3.5 + vec2(sin(iTime * 3.0 + i) * 0.003, cos(iTime * 3.5 - i) * 0.003);
            float tailNoise = fbm(v + vec2(iTime * 0.5, i)) * 0.3 * (1.0 - (i / 35.0));
            vec4 auroraColors = vec4(
              0.1 + 0.3 * sin(i * 0.2 + iTime * 0.4),
              0.3 + 0.5 * cos(i * 0.3 + iTime * 0.5),
              0.7 + 0.3 * sin(i * 0.4 + iTime * 0.3),
              1.0
            );
            vec4 currentContribution = auroraColors * exp(sin(i * i + iTime * 0.8)) / length(max(v, vec2(v.x * f * 0.015, v.y * 1.5)));
            float thinnessFactor = smoothstep(0.0, 1.0, i / 35.0) * 0.6;
            o += currentContribution * (1.0 + tailNoise * 0.8) * thinnessFactor;
          }

          o = tanh(pow(o / 100.0, vec4(1.6)));
          gl_FragColor = o * 1.5;
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
      renderer.setSize(window.innerWidth, window.innerHeight);
      material.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
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

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden">
      {/* Three.js Canvas Background */}
      <div className="absolute inset-0 z-0" />

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col">
        {/* NavBar */}
        <nav className="flex items-center justify-between px-8 py-6 lg:px-12">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="2" fill="currentColor" className="text-cyan-300" />
              <path d="M12 2v4M12 18v4M5 12H1M23 12h-4M5.64 5.64l2.83 2.83M15.53 15.53l2.83 2.83M18.36 5.64l-2.83 2.83M8.47 15.53l-2.83 2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-white/60" />
            </svg>
            <span className="text-white font-semibold">
              create nailart <span className="text-cyan-300">AI</span>
            </span>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-8">
            <a href="#" className="text-white/70 hover:text-white transition text-sm">기능 소개</a>
            <a href="#" className="text-white/70 hover:text-white transition text-sm">요금제</a>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4">
            <button className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition backdrop-blur-md">
              로그인
            </button>
            <button className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-900 text-sm font-semibold hover:shadow-lg hover:shadow-cyan-400/50 transition">
              무료로 시작하기
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="flex-1 flex items-center justify-center px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-12 max-w-6xl mx-auto w-full">
            {/* Left Side */}
            <div className="flex flex-col justify-center">
              {/* AI Badge */}
              <div className="flex items-center gap-2 mb-6 w-fit">
                <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2l-1 5h5l-3.5 4 1 5-3.5-2.5-3.5 2.5 1-5-3.5-4h5l-1-5z" fill="currentColor" />
                </svg>
                <span className="text-sm text-white/80 font-medium">AI 기반 썸네일 생성</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                <span className="text-white">클릭을 부르는</span>
                <br />
                <span className="bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent">유튜브 썸네일</span>
                <br />
                <span className="text-white">AI로 단 10초만에</span>
              </h1>

              {/* Subtitle */}
              <p className="text-white/60 text-lg mb-8 leading-relaxed">
                AI가 트렌드와 클릭률을 분석해서 만드는 완벽한 썸네일. 더 이상 고민하지 마세요.
              </p>

              {/* CTA Buttons */}
              <div className="flex items-center gap-4 mb-12">
                <button className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-900 font-semibold hover:shadow-lg hover:shadow-cyan-400/50 transition">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 5v14l11-7z" />
                  </svg>
                  무료로 시작하기
                </button>
                <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition backdrop-blur-md">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  데모 보기
                </button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <svg className="w-10 h-10 rounded-full border-2 border-white/20 bg-gradient-to-br from-blue-500 to-blue-600" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="20" fill="currentColor" />
                    <circle cx="15" cy="15" r="3" fill="white" />
                  </svg>
                  <svg className="w-10 h-10 rounded-full border-2 border-white/20 bg-gradient-to-br from-purple-500 to-purple-600" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="20" fill="currentColor" />
                    <circle cx="15" cy="15" r="3" fill="white" />
                  </svg>
                  <svg className="w-10 h-10 rounded-full border-2 border-white/20 bg-gradient-to-br from-pink-500 to-pink-600" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="20" fill="currentColor" />
                    <circle cx="15" cy="15" r="3" fill="white" />
                  </svg>
                </div>
                <p className="text-white/80 text-sm font-medium">2,400+ 크리에이터</p>
              </div>
            </div>

            {/* Right Side - Glassmorphism Panel */}
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-sm">
                {/* Glass Panel */}
                <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 overflow-hidden h-96">
                  {/* Status Bar */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    </div>
                    <span className="text-xs text-white/70">AI가 생성하는 중...</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1 bg-white/10 rounded-full mb-6 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 w-2/3 rounded-full" />
                  </div>

                  {/* Card Stack */}
                  <div className="relative h-56">
                    {/* Tech Card - Front */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-xl p-4 flex flex-col justify-between border border-white/10 shadow-2xl">
                      <div>
                        <svg className="w-8 h-8 text-cyan-400 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M2 8h20M2 12h20M2 16h20M6 4v16M18 4v16" />
                          <circle cx="12" cy="12" r="2" />
                        </svg>
                        <p className="text-white text-sm font-semibold">최신 기술</p>
                      </div>
                      <p className="text-white/70 text-xs leading-relaxed">AI로 만드는 완벽한 썸네일</p>
                    </div>

                    {/* Gaming Card - Back Right */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-slate-900 to-slate-900 rounded-xl p-4 flex flex-col justify-between border border-white/10 shadow-2xl transform translate-x-4 translate-y-4 opacity-80">
                      <div>
                        <svg className="w-8 h-8 text-yellow-400 mb-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M13 2l-1 5h5l-3.5 4 1 5-3.5-2.5-3.5 2.5 1-5-3.5-4h5l-1-5z" />
                        </svg>
                        <p className="text-white text-sm font-semibold">게임</p>
                      </div>
                      <p className="text-white/70 text-xs leading-relaxed">100만뷰 게임 썸네일</p>
                    </div>

                    {/* Cooking Card - Back Left */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-slate-900 to-slate-900 rounded-xl p-4 flex flex-col justify-between border border-white/10 shadow-2xl transform -translate-x-4 translate-y-4 opacity-80">
                      <div>
                        <svg className="w-8 h-8 text-green-400 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        <p className="text-white text-sm font-semibold">음식</p>
                      </div>
                      <p className="text-white/70 text-xs leading-relaxed">구독자 터지는 레시피</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="flex items-center justify-center gap-8 px-8 py-12 lg:px-12 flex-wrap">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2l-1 5h5l-3.5 4 1 5-3.5-2.5-3.5 2.5 1-5-3.5-4h5l-1-5z" />
            </svg>
            <span className="text-white/80 text-sm font-medium">10초 생성</span>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="8" cy="8" r="1" />
              <circle cx="16" cy="8" r="1" />
              <circle cx="8" cy="16" r="1" />
              <circle cx="16" cy="16" r="1" />
              <circle cx="12" cy="12" r="1" />
            </svg>
            <span className="text-white/80 text-sm font-medium">100+ 스타일</span>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
            <span className="text-white/80 text-sm font-medium">클릭률 3배</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
