'use client';

import React from 'react';

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
}

const BorderBeam = React.forwardRef<HTMLDivElement, BorderBeamProps>(
  (
    {
      className,
      size = 80,
      duration = 10,
      delay = 0,
      colorFrom = '#06b6d4',
      colorTo = '#14b8a6',
    },
    ref
  ) => {
    const id = React.useId();
    const cleanId = id.replace(/:/g, '').replace(/-/g, '');

    return (
      <>
        <style>{`
          @keyframes beam${cleanId} {
            0% {
              left: -${size}px;
              top: -${size}px;
            }
            25% {
              left: calc(100%);
              top: -${size}px;
            }
            50% {
              left: calc(100%);
              top: calc(100%);
            }
            75% {
              left: -${size}px;
              top: calc(100%);
            }
            100% {
              left: -${size}px;
              top: -${size}px;
            }
          }
        `}</style>
        <div
          ref={ref}
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
          style={{
            WebkitMaskImage: `
              radial-gradient(circle, transparent 30%, black 100%)
            `,
            maskImage: `
              radial-gradient(circle, transparent 30%, black 100%)
            `,
          } as React.CSSProperties}
        >
          <div
            style={{
              position: 'absolute',
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${colorTo} 0%, ${colorFrom} 70%, transparent 100%)`,
              filter: `blur(1px) drop-shadow(0 0 8px ${colorTo})`,
              animation: `beam${cleanId} ${duration}s infinite linear`,
              animationDelay: `${delay}s`,
              opacity: 0.9,
            }}
          />
        </div>
      </>
    );
  }
);

BorderBeam.displayName = 'BorderBeam';

export { BorderBeam };
