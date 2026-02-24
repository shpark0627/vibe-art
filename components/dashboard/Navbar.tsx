'use client';

import React from 'react';
import DashboardClient from './DashboardClient';

interface DashboardNavbarProps {
  email: string;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ email }) => {
  return (
    <header className="sticky top-0 z-40">
      <div className="flex items-center justify-between px-8 py-6 lg:px-12">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="2" fill="currentColor" className="text-cyan-300" />
            <path
              d="M12 2v4M12 18v4M5 12H1M23 12h-4M5.64 5.64l2.83 2.83M15.53 15.53l2.83 2.83M18.36 5.64l-2.83 2.83M8.47 15.53l-2.83 2.83"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-white/60"
            />
          </svg>
          <span className="text-white font-semibold">
            create nailart <span className="text-cyan-300">AI</span>
          </span>
        </div>

        {/* User Actions */}
        <DashboardClient email={email} />
      </div>
    </header>
  );
};

export default DashboardNavbar;
