import confetti from 'canvas-confetti';
import { soundFx } from './audio';

// Authentic Coding & Developer Symbols for Celebrations
export const CODE_SYMBOLS = [
  '</>',
  '{ }',
  '=>',
  '$_',
  'git push',
  'npm run',
  '200 OK',
  'const',
  'async',
  'λ',
  '[ ]',
  '/* */',
  ';',
  '===',
  '0101',
  '⚡',
  '&&',
  '<Dev/>',
  '#include',
  'return 0;',
];

// High-tech terminal & cyberpunk developer color palette (no clown/rainbow confetti)
export const CODE_COLORS = [
  '#00f0ff', // Cyber Cyan
  '#10b981', // Terminal Emerald Green
  '#00ff66', // Matrix Green
  '#38bdf8', // Sky Blue
  '#a855f7', // Hacker Purple
  '#f59e0b', // Code Amber
  '#ffffff', // Crisp White
];

/**
 * Creates canvas-confetti text shapes from coding symbols
 */
function createCodingTextShapes() {
  if (typeof window === 'undefined' || typeof confetti.shapeFromText !== 'function') {
    return undefined;
  }

  try {
    return [
      confetti.shapeFromText({ text: '</>', scalar: 2.2 }),
      confetti.shapeFromText({ text: '{ }', scalar: 2.2 }),
      confetti.shapeFromText({ text: '=>', scalar: 2.0 }),
      confetti.shapeFromText({ text: '$_', scalar: 2.0 }),
      confetti.shapeFromText({ text: 'git', scalar: 1.8 }),
      confetti.shapeFromText({ text: '200', scalar: 1.8 }),
      confetti.shapeFromText({ text: 'λ', scalar: 2.2 }),
      confetti.shapeFromText({ text: ';', scalar: 2.8 }),
      confetti.shapeFromText({ text: '⚡', scalar: 2.0 }),
      confetti.shapeFromText({ text: 'const', scalar: 1.6 }),
      confetti.shapeFromText({ text: '[ ]', scalar: 2.0 }),
    ];
  } catch (err) {
    console.warn('Could not create custom confetti text shapes:', err);
    return undefined;
  }
}

let cachedShapes: any[] | undefined = undefined;

/**
 * Triggers a burst of coding symbols, syntax glyphs, and neon dev tokens
 * Replaces generic colorful confetti with an authentic coding burst!
 */
export function triggerCodeCelebration(options?: {
  particleCount?: number;
  origin?: { x?: number; y?: number };
  spread?: number;
  playSound?: boolean;
}) {
  const {
    particleCount = 50,
    origin = { x: 0.5, y: 0.6 },
    spread = 80,
    playSound = true,
  } = options || {};

  if (playSound) {
    soundFx.playRetroPowerUp();
  }

  if (typeof window === 'undefined') return;

  if (!cachedShapes) {
    cachedShapes = createCodingTextShapes();
  }

  // 1. Fire canvas-confetti with coding text shapes and terminal palette
  try {
    if (cachedShapes && cachedShapes.length > 0) {
      confetti({
        shapes: cachedShapes,
        colors: CODE_COLORS,
        particleCount: Math.min(particleCount, 45),
        spread: spread,
        origin: origin,
        scalar: 1.8,
        drift: 0,
        ticks: 240,
        gravity: 0.85,
        startVelocity: 35,
      });
    } else {
      // Fallback if shapeFromText isn't supported in browser environment
      confetti({
        colors: CODE_COLORS,
        particleCount: particleCount,
        spread: spread,
        origin: origin,
        scalar: 1.2,
        ticks: 200,
        gravity: 0.8,
      });
    }
  } catch (err) {
    console.warn('Confetti burst error:', err);
  }

  // 2. Spawn floating glowing DOM coding tokens for extra tactile fidelity
  spawnFloatingCodeTokens(origin.x ?? 0.5, origin.y ?? 0.6);
}

/**
 * Spawns dynamic HTML floating code badges (e.g. `const saved = true;`, `git push origin main`, `status: 200 OK`)
 * that float up and dissolve smoothly with cyber glow.
 */
function spawnFloatingCodeTokens(originX: number, originY: number) {
  if (typeof document === 'undefined') return;

  const containerId = 'devpulse-code-celebration-container';
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.position = 'fixed';
    container.style.inset = '0';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '99999';
    container.style.overflow = 'hidden';
    document.body.appendChild(container);
  }

  const tokenPhrases = [
    '</>',
    '{ status: 200 }',
    'git commit -m "feat"',
    'const sync = true;',
    '=> { shipped }',
    '⚡ 0 errors, 0 warnings',
    'λ build_success()',
    'npm run deploy:prod',
    '[OK] 100% SLA',
    '$_ push --verified',
  ];

  const colors = [
    { text: '#00f0ff', border: 'rgba(0, 240, 255, 0.4)', bg: 'rgba(2, 6, 23, 0.85)' },
    { text: '#10b981', border: 'rgba(16, 185, 129, 0.4)', bg: 'rgba(2, 6, 23, 0.85)' },
    { text: '#38bdf8', border: 'rgba(56, 189, 248, 0.4)', bg: 'rgba(2, 6, 23, 0.85)' },
    { text: '#a855f7', border: 'rgba(168, 85, 247, 0.4)', bg: 'rgba(2, 6, 23, 0.85)' },
    { text: '#f59e0b', border: 'rgba(245, 158, 11, 0.4)', bg: 'rgba(2, 6, 23, 0.85)' },
  ];

  const count = 7;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const phrase = tokenPhrases[Math.floor(Math.random() * tokenPhrases.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const startX = originX * window.innerWidth + (Math.random() - 0.5) * 200;
    const startY = originY * window.innerHeight + (Math.random() - 0.5) * 80;
    const destX = startX + (Math.random() - 0.5) * 300;
    const destY = startY - 140 - Math.random() * 180;
    const rotation = (Math.random() - 0.5) * 25;

    el.innerText = phrase;
    el.style.position = 'absolute';
    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;
    el.style.fontFamily = 'monospace, ui-monospace, "Fira Code", monospace';
    el.style.fontSize = '12px';
    el.style.fontWeight = 'bold';
    el.style.color = color.text;
    el.style.backgroundColor = color.bg;
    el.style.border = `1px solid ${color.border}`;
    el.style.borderRadius = '8px';
    el.style.padding = '4px 10px';
    el.style.boxShadow = `0 4px 20px ${color.border}`;
    el.style.transform = `translate(-50%, -50%) scale(0.5) rotate(${rotation}deg)`;
    el.style.opacity = '0';
    el.style.transition = 'all 1.4s cubic-bezier(0.16, 1, 0.3, 1)';
    el.style.backdropFilter = 'blur(8px)';

    container.appendChild(el);

    // Trigger floating animation
    requestAnimationFrame(() => {
      el.style.transform = `translate(-50%, -50%) scale(1) translate(${destX - startX}px, ${destY - startY}px) rotate(${rotation * 1.5}deg)`;
      el.style.opacity = '1';

      setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = `translate(-50%, -50%) scale(0.8) translate(${destX - startX}px, ${destY - startY - 60}px) rotate(${rotation * 2}deg)`;
        setTimeout(() => {
          if (el.parentNode) el.parentNode.removeChild(el);
        }, 1200);
      }, 1000);
    });
  }
}
