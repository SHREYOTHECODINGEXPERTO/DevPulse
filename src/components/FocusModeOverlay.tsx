import React, { useState, useEffect } from 'react';
import { DeviceTelemetry } from '../types';
import { soundFx } from '../utils/audio';
import { 
  Zap, 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Flame, 
  CheckSquare, 
  Square, 
  Plus, 
  EyeOff, 
  Cpu, 
  Battery, 
  BatteryCharging,
  Clock,
  Terminal
} from 'lucide-react';

interface FocusModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: DeviceTelemetry;
}

export const FocusModeOverlay: React.FC<FocusModeOverlayProps> = ({
  isOpen,
  onClose,
  telemetry,
}) => {
  const [seconds, setSeconds] = useState(25 * 60); // 25 min default Pomodoro
  const [isRunning, setIsRunning] = useState(true);
  const [audioMuted, setAudioMuted] = useState(false);
  const [tasks, setTasks] = useState([
    { id: '1', text: 'Refactor GitHub webhooks & stream parser', done: false },
    { id: '2', text: 'Optimize bundle size & verify esbuild output', done: true },
    { id: '3', text: 'Ship sprint 24 code review approvals', done: false },
  ]);
  const [newTaskInput, setNewTaskInput] = useState('');

  // Timer loop
  useEffect(() => {
    if (!isOpen || !isRunning) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          soundFx.playSuccess();
          return 25 * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isRunning]);

  // Esc key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const minutes = Math.floor(seconds / 60);
  const remainingSecs = seconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;

  const toggleTask = (id: string) => {
    soundFx.playPacmanDot();
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    soundFx.playClick(700, 0.04);
    setTasks((prev) => [
      ...prev,
      { id: Date.now().toString(), text: newTaskInput.trim(), done: false },
    ]);
    setNewTaskInput('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-between p-6 text-white font-mono animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Zap className="w-5 h-5 fill-current animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-widest uppercase text-white">
                Hyper-Focus Mode & Distraction Blocker
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                10X FLOW STATE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Notifications silenced &middot; Deep coding session in progress
            </p>
          </div>
        </div>

        {/* Top Hardware Telemetry Pills */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 border-r border-white/10 pr-4">
            <span>Latency: <span className="text-emerald-400 font-bold">{telemetry.rttLatency}ms</span></span>
            <span>Focus: <span className="text-cyan-400 font-bold">{telemetry.realTimeFocusScore}%</span></span>
            <span>Battery: <span className="text-amber-400 font-bold">{telemetry.batteryLevel !== null ? `${telemetry.batteryLevel}%` : 'AC'}</span></span>
          </div>

          <button
            onClick={() => {
              soundFx.playClick(400, 0.04);
              onClose();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 text-xs font-bold transition-colors"
          >
            <span>Exit Focus</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Giant Timer & Focus HUD */}
      <div className="my-auto flex flex-col items-center text-center space-y-6 max-w-lg w-full">
        {/* Glow Halo */}
        <div className="relative">
          <div className="absolute -inset-8 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
          
          <div className="font-handjet text-8xl sm:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-400 tracking-wider select-none">
            {timeFormatted}
          </div>
        </div>

        <div className="text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Sprint 24 &middot; Deep Work Interval</span>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              soundFx.playClick(600, 0.05);
              setIsRunning(!isRunning);
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/30 transition-all hover:scale-105"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Flow</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              soundFx.playClick(450, 0.04);
              setSeconds(25 * 60);
            }}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
            title="Reset to 25m"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* In-Session Quick Tasks Checklist */}
        <div className="w-full bg-slate-900/60 rounded-2xl p-4 border border-white/10 text-left space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-cyan-400" />
              Focus Sprint Objectives:
            </span>
            <span className="text-[10px] text-slate-500">
              {tasks.filter((t) => t.done).length}/{tasks.length} Completed
            </span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`flex items-center gap-2.5 p-2 rounded-xl border transition-colors cursor-pointer text-xs ${
                  task.done
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 line-through opacity-70'
                    : 'bg-white/5 border-white/5 text-slate-200 hover:border-cyan-500/30'
                }`}
              >
                {task.done ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 flex-shrink-0" />
                )}
                <span className="truncate">{task.text}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddTask} className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Add quick sprint note..."
              value={newTaskInput}
              onChange={(e) => setNewTaskInput(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold"
            >
              Add
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Bar: Keystrokes & Ambient Sound */}
      <div className="w-full max-w-5xl flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>Active Keystrokes: <span className="text-cyan-300 font-bold">{telemetry.keystrokesCount}</span></span>
          <span>Today Logged: <span className="text-sky-300 font-bold">{telemetry.weeklyLoggedHours}h</span></span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">Press ESC anytime to exit</span>
        </div>
      </div>
    </div>
  );
};
