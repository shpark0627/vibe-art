'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import React from 'react';

interface DashboardClientProps {
  email: string;
}

const DashboardClient: React.FC<DashboardClientProps> = ({ email }) => {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  // 이메일 첫 글자
  const initial = email.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-4">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-teal-400 flex items-center justify-center text-slate-900 font-semibold">
        {initial}
      </div>

      {/* Email (hidden on small screens) */}
      <span className="text-white/70 text-sm hidden lg:block">{email}</span>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition backdrop-blur-md"
      >
        로그아웃
      </button>
    </div>
  );
};

export default DashboardClient;
