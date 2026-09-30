'use client';

import React, { useEffect, useId, useSyncExternalStore } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const emptySubscribe = () => () => {};

export const InteractiveGridBg: React.FC = () => {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const gridPatternId = useId();

  // Smooth out mouse tracking for organic responsiveness
  const smoothX = useSpring(mouseX, { stiffness: 45, damping: 25 });
  const smoothY = useSpring(mouseY, { stiffness: 45, damping: 25 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      if (innerWidth && innerHeight) {
        mouseX.set(e.clientX / innerWidth);
        mouseY.set(e.clientY / innerHeight);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#030712]"
      aria-hidden="true"
    >
      {/* 1. Deep Space Radial Core Backdrop */}
      <div 
        className="absolute inset-0 opacity-80"
        style={{
          background: 'radial-gradient(ellipse 90% 80% at 50% -20%, rgba(30, 27, 75, 0.4), rgba(3, 7, 18, 0.95))'
        }}
      />

      {/* 2. Floating Animated Neon Violet Orb (#8B5CF6) */}
      <motion.div
        className="absolute -top-[10%] left-[15%] w-[580px] h-[580px] rounded-full filter blur-[110px] opacity-35 mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, #8B5CF6 0%, rgba(139, 92, 246, 0.4) 40%, transparent 70%)',
        }}
        animate={{
          x: [0, 80, -60, 0],
          y: [0, 90, 40, 0],
          scale: [1, 1.15, 0.95, 1],
          opacity: [0.35, 0.5, 0.3, 0.35],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 3. Floating Animated Neon Cyan Orb (#06B6D4) */}
      <motion.div
        className="absolute top-[35%] -right-[5%] w-[640px] h-[640px] rounded-full filter blur-[130px] opacity-30 mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, #06B6D4 0%, rgba(6, 182, 212, 0.4) 45%, transparent 75%)',
        }}
        animate={{
          x: [0, -90, 50, 0],
          y: [0, 110, -70, 0],
          scale: [1, 1.2, 0.9, 1],
          opacity: [0.3, 0.48, 0.25, 0.3],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      {/* 4. Deep Violet Counter-Orb (Lower Left for Balanced Cyber Aura) */}
      <motion.div
        className="absolute -bottom-[15%] left-[25%] w-[520px] h-[520px] rounded-full filter blur-[120px] opacity-25 mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, #7C3AED 0%, rgba(124, 58, 237, 0.3) 50%, transparent 75%)',
        }}
        animate={{
          x: [0, 60, -50, 0],
          y: [0, -70, 30, 0],
          scale: [0.95, 1.1, 1, 0.95],
          opacity: [0.2, 0.35, 0.2, 0.2],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 5. Dynamic Interactive Mouse-Follower Neon Flare */}
      {mounted && (
        <motion.div
          className="absolute w-[420px] h-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full filter blur-[90px] opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.7) 0%, rgba(6, 182, 212, 0.4) 40%, transparent 70%)',
            left: smoothX.get() ? `${smoothX.get() * 100}%` : '50%',
            top: smoothY.get() ? `${smoothY.get() * 100}%` : '50%',
          }}
        />
      )}

      {/* 6. Subtle Cyberpunk Radial Mesh Grid */}
      <div 
        className="absolute inset-0 opacity-[0.22]"
        style={{
          maskImage: 'radial-gradient(ellipse 75% 70% at 50% 35%, black 25%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 35%, black 25%, transparent 85%)',
        }}
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id={gridPatternId}
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="rgba(148, 163, 184, 0.35)"
                strokeWidth="0.75"
              />
              <circle cx="0" cy="0" r="1.2" fill="rgba(6, 182, 212, 0.7)" />
              <circle cx="48" cy="0" r="1.2" fill="rgba(139, 92, 246, 0.6)" />
              <circle cx="0" cy="48" r="1.2" fill="rgba(139, 92, 246, 0.6)" />
              <circle cx="48" cy="48" r="1.2" fill="rgba(6, 182, 212, 0.7)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${gridPatternId})`} />
        </svg>
      </div>

      {/* 7. Subtle Cyber Scanline Horizon Bar */}
      <motion.div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"
        animate={{
          top: ['0%', '100%'],
          opacity: [0, 0.7, 0.7, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* 8. Vignette Edge Falloff */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 160px 40px rgba(3, 7, 18, 0.85)'
        }}
      />
    </div>
  );
};
