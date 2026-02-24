'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const AuthPage = () => {
    const containerRef = useRef(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err) {
            setError(err instanceof Error ? err.message : '로그인 실패');
            setLoading(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError?.status === 400) {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });
                if (signUpError) throw signUpError;
                setError('');
            } else if (signInError) {
                throw signInError;
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '로그인 실패');
            setLoading(false);
        }
    };

    useEffect(() => {
        const container = containerRef.current as HTMLDivElement | null;
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
        <div ref={containerRef} className="relative w-full min-h-screen overflow-hidden">
            {/* Three.js Canvas Background */}
            <div className="absolute inset-0 z-0" />

            {/* UI Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4">
                {/* Back to Home Button */}
                <div className="absolute top-6 left-8 lg:left-12">
                    <a href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        <span className="text-sm">돌아가기</span>
                    </a>
                </div>

                {/* Auth Card */}
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2 mb-12">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="2" fill="currentColor" className="text-cyan-300" />
                            <path d="M12 2v4M12 18v4M5 12H1M23 12h-4M5.64 5.64l2.83 2.83M15.53 15.53l2.83 2.83M18.36 5.64l-2.83 2.83M8.47 15.53l-2.83 2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-white/60" />
                        </svg>
                        <span className="text-white font-semibold">
                            create nailart <span className="text-cyan-300">AI</span>
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-white mb-3 text-center">
                        시작하기
                    </h1>
                    <p className="text-white/60 text-center text-sm mb-8">
                        Google 계정으로 로그인하고 AI 썸네일 생성을 시작하세요
                    </p>

                    {/* Glass Card */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-6">
                        {/* Google Login Button */}
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg bg-white text-slate-900 font-semibold hover:bg-white/90 transition mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            {loading ? '로그인 중...' : 'Google로 계속하기'}
                        </button>

                        {/* Divider */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white/5 text-white/50">또는</span>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Email Form */}
                        <form onSubmit={handleEmailLogin}>
                            {/* Email Input */}
                            <div className="mb-4">
                                <label className="block text-sm text-white/80 mb-2">이메일</label>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none transition"
                                />
                            </div>

                            {/* Password Input */}
                            <div className="mb-6">
                                <label className="block text-sm text-white/80 mb-2">비밀번호</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none transition"
                                />
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-900 font-semibold hover:shadow-lg hover:shadow-cyan-400/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? '처리 중...' : '계속하기'}
                            </button>
                        </form>
                    </div>

                    {/* Terms */}
                    <p className="text-white/50 text-xs text-center">
                        로그인함으로써 당신은 우리의{' '}
                        <a href="#" className="text-cyan-300 hover:text-cyan-200 transition">
                            약관
                        </a>
                        과{' '}
                        <a href="#" className="text-cyan-300 hover:text-cyan-200 transition">
                            개인정보보호
                        </a>
                        에 동의합니다.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
