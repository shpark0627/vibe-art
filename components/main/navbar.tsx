'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { useState } from 'react';

const Navbar = () => {
  const { user, loading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
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
        {loading ? (
          <div className="px-6 py-2 text-white/60 text-sm">로딩 중...</div>
        ) : user ? (
          <>
            <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
              <PopoverPrimitive.Trigger asChild>
                <button className="text-white/70 hover:text-white transition text-sm hidden lg:block cursor-pointer">
                  {user.email}
                </button>
              </PopoverPrimitive.Trigger>
              <PopoverPrimitive.Portal>
                <PopoverPrimitive.Content
                  align="end"
                  sideOffset={8}
                  className="z-50 w-48 rounded-lg bg-slate-900 dark:bg-[#303030] p-2 text-white dark:text-white shadow-lg outline-none animate-in data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 border border-white/10"
                >
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-4 py-2 rounded-md hover:bg-white/10 transition text-sm"
                  >
                    My Page
                  </Link>
                  <PopoverPrimitive.Arrow className="fill-slate-900 dark:fill-[#303030]" />
                </PopoverPrimitive.Content>
              </PopoverPrimitive.Portal>
            </PopoverPrimitive.Root>
            <button
              onClick={signOut}
              className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition backdrop-blur-md"
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link
              href="/auth"
              className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition backdrop-blur-md"
            >
              로그인
            </Link>
            <button className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-900 text-sm font-semibold hover:shadow-lg hover:shadow-cyan-400/50 transition">
              무료로 시작하기
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
