import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';

interface DoodleParticle {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

export const CodingDoodles: React.FC = () => {
  const [particles, setParticles] = useState<DoodleParticle[]>([]);
  const [pacmanScore, setPacmanScore] = useState(120);
  const [consoleClicks, setConsoleClicks] = useState(0);

  const triggerDoodleBurst = (e: React.MouseEvent, symbol: string, type: 'retro' | 'pacman' | 'laser' | 'normal' = 'normal') => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();

    if (type === 'pacman') {
      soundFx.playPacmanDot();
      setPacmanScore((s) => s + 10);
    } else if (type === 'laser') {
      soundFx.playArcadeLaser();
    } else if (type === 'retro') {
      soundFx.playRetroPowerUp();
      setConsoleClicks((c) => c + 1);
      confetti({ particleCount: 25, spread: 50, origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: rect.top / window.innerHeight } });
    } else {
      soundFx.playClick(880, 0.05);
    }

    const newP: DoodleParticle = {
      id: Date.now() + Math.random(),
      x: rect.left + rect.width / 2,
      y: rect.top,
      text: symbol,
      color: type === 'pacman' ? 'text-amber-300' : type === 'laser' ? 'text-rose-300' : 'text-cyan-300',
    };

    setParticles((prev) => [...prev.slice(-10), newP]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newP.id));
    }, 1200);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {/* Background Cyber Grid & Vignette */}
      <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-cyan-950/20 via-slate-950/80 to-slate-950 pointer-events-none" />
      
      {/* Ambient Neon Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '4s' }} />

      {/* GAMING DOODLE 1: Pixelated Floating Game Console (Game Boy / Cyber Console) */}
      <motion.div
        className="pointer-events-auto absolute bottom-20 right-6 hidden md:flex flex-col items-center p-3 rounded-2xl bg-slate-900/90 border-2 border-cyan-400/40 backdrop-blur-xl shadow-2xl shadow-cyan-500/20 cursor-pointer group hover:scale-105 transition-all"
        animate={{ y: [0, -12, 0], rotate: [0, 1.5, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        onClick={(e) => triggerDoodleBurst(e, '+50 XP // LEVEL UP', 'retro')}
        title="Click to power up Game Boy Console"
      >
        {/* Pixel Console Top Bezel */}
        <div className="w-24 h-2 bg-slate-800 rounded-t-sm mb-1.5 flex justify-between px-1 items-center">
          <span className="w-1 h-1 bg-rose-500 rounded-full animate-ping" />
          <span className="text-[7px] font-mono text-cyan-400 font-bold">GAMEBOY.VIBE</span>
        </div>

        {/* Pixel Screen (CRT Matrix) */}
        <div className="w-24 h-14 bg-emerald-950/80 border border-emerald-500/50 rounded p-1 flex flex-col justify-between overflow-hidden relative shadow-inner">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:100%_3px] pointer-events-none" />
          <div className="flex justify-between items-center text-[7px] font-mono text-emerald-400 font-bold">
            <span>HI-SCORE</span>
            <span>{8420 + consoleClicks * 50}</span>
          </div>
          <div className="text-center font-handjet text-lg font-bold text-emerald-300 tracking-wider">
            &lt;DEV:8BIT&gt;
          </div>
          <div className="flex justify-between text-[7px] font-mono text-emerald-500">
            <span>READY</span>
            <span className="animate-pulse">▶ 1P</span>
          </div>
        </div>

        {/* Console Controls (D-pad & Buttons) */}
        <div className="w-24 mt-2 flex justify-between items-center px-1">
          {/* D-Pad */}
          <div className="relative w-7 h-7">
            <div className="absolute top-0 left-2.5 w-2 h-7 bg-slate-700 rounded-sm" />
            <div className="absolute top-2.5 left-0 w-7 h-2 bg-slate-700 rounded-sm" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-slate-600 rounded-full" />
            </div>
          </div>

          {/* Action Buttons A & B */}
          <div className="flex gap-1.5 transform rotate-[-15deg]">
            <button
              onClick={(e) => triggerDoodleBurst(e, 'B-DASH!', 'laser')}
              className="w-3.5 h-3.5 rounded-full bg-rose-500 hover:bg-rose-400 text-[6px] font-bold text-slate-950 flex items-center justify-center shadow"
            >
              B
            </button>
            <button
              onClick={(e) => triggerDoodleBurst(e, 'A-JUMP! 10X', 'pacman')}
              className="w-3.5 h-3.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-[6px] font-bold text-slate-950 flex items-center justify-center shadow"
            >
              A
            </button>
          </div>
        </div>

        <span className="text-[8px] font-mono text-slate-400 mt-1">CLICK CONSOLE</span>
      </motion.div>

      {/* GAMING DOODLE 2: Pixelated Pac-Man Chomping Floating <div> & </> Syntax */}
      <motion.div
        className="pointer-events-auto absolute top-20 left-10 md:left-32 hidden sm:flex items-center gap-3 p-2.5 rounded-2xl bg-slate-900/80 border border-amber-400/40 backdrop-blur-md cursor-pointer hover:border-amber-400 shadow-lg shadow-amber-500/10"
        animate={{ x: [0, 30, 0], y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        onClick={(e) => triggerDoodleBurst(e, `WAKA WAKA! +${pacmanScore} PTS`, 'pacman')}
        title="Click Pac-Man to chomp dots!"
      >
        {/* Pixel Pac-Man SVG */}
        <div className="relative w-7 h-7 flex items-center justify-center">
          <svg viewBox="0 0 32 32" className="w-7 h-7 fill-amber-400 animate-pulse">
            <path d="M 16 0 A 16 16 0 1 0 32 16 L 16 16 Z" />
          </svg>
          <span className="absolute top-1 right-2 w-1 h-1 bg-slate-950 rounded-full" />
        </div>

        {/* Trail of Dots & Syntax */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
            &lt;div&gt;
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px] border border-cyan-500/30">
            &lt;/&gt;
          </span>
        </div>

        <span className="font-handjet text-sm font-bold text-amber-300 pl-1 border-l border-amber-500/30">
          {pacmanScore} PTS
        </span>
      </motion.div>

      {/* GAMING DOODLE 3: Floating Pixelated <div> & <span> Syntax Signs */}
      <motion.div
        className="pointer-events-auto absolute top-40 right-16 hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-purple-500/40 backdrop-blur-md text-xs font-mono text-purple-300 cursor-pointer hover:scale-105 transition-transform"
        animate={{ y: [0, 10, 0], rotate: [0, -2, 0] }}
        transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 1 }}
        onClick={(e) => triggerDoodleBurst(e, 'display: flex; justify-content: center;', 'normal')}
        title="CSS Div Centering Spell"
      >
        <span className="font-handjet text-base text-purple-400 font-bold">&lt;div class="center"&gt;</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-200">
          margin: 0 auto;
        </span>
        <span className="font-handjet text-base text-purple-400 font-bold">&lt;/div&gt;</span>
      </motion.div>

      {/* GAMING DOODLE 4: Pixelated 8-bit Space Invader Sprite */}
      <motion.div
        className="pointer-events-auto absolute bottom-44 left-16 hidden md:flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/80 border border-rose-500/40 backdrop-blur-md text-xs font-mono text-rose-300 cursor-pointer hover:border-rose-400 shadow-md shadow-rose-500/10"
        animate={{ y: [0, -8, 0], x: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 0.5 }}
        onClick={(e) => triggerDoodleBurst(e, 'PEW PEW! // SPACE INVADER DESTROYED', 'laser')}
        title="Click Invader for Laser"
      >
        {/* Pixel Invader SVG */}
        <div className="w-6 h-5 relative flex items-center justify-center">
          <svg viewBox="0 0 16 12" className="w-6 h-5 fill-rose-400">
            <path d="M4 0h8v2H4zM2 2h12v2H2zM0 4h16v4H0zM2 8h2v2H2zm4 0h4v2H6zm6 0h2v2h-2zM0 10h2v2H0zm14 0h2v2h-2zM4 4h2v2H4zm6 0h2v2h-2z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-handjet text-xs font-bold text-rose-300">BUG INVADER #8BIT</span>
          <span className="text-[9px] text-slate-400">CLICK TO LASER</span>
        </div>
      </motion.div>

      {/* Floating dynamic particles when clicked */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -50, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            className={`fixed pointer-events-none z-50 px-2.5 py-1 rounded-xl bg-slate-950/90 border border-white/20 backdrop-blur-md font-mono text-xs font-bold ${p.color} shadow-2xl`}
            style={{ left: p.x - 50, top: p.y - 15 }}
          >
            🕹️ {p.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Futuristic Background Vector Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path
          d="M 50 150 Q 300 20 600 180 T 1200 120"
          fill="none"
          stroke="url(#cyberGrad)"
          strokeWidth="1.5"
          strokeDasharray="6 6"
        />
        <path
          d="M 100 800 Q 400 650 800 780 T 1400 700"
          fill="none"
          stroke="url(#cyberGrad)"
          strokeWidth="1"
          strokeDasharray="4 8"
        />
      </svg>
    </div>
  );
};
