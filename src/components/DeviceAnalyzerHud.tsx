import React from 'react';
import { DeviceTelemetry } from '../types';
import { 
  Cpu, 
  HardDrive, 
  Battery, 
  BatteryCharging, 
  Wifi, 
  Activity, 
  Flame, 
  Clock, 
  Sparkles,
  Zap,
  Gauge,
  Terminal,
  Monitor
} from 'lucide-react';

interface DeviceAnalyzerHudProps {
  telemetry: DeviceTelemetry;
  activeReposCount: number;
  totalCommits: number;
}

export const DeviceAnalyzerHud: React.FC<DeviceAnalyzerHudProps> = ({
  telemetry,
  activeReposCount,
  totalCommits,
}) => {
  const getFocusBadgeColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 60) return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
    if (score >= 40) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getFocusStatusText = (score: number) => {
    if (score >= 85) return 'HYPER FOCUS (10X)';
    if (score >= 65) return 'IN FLOW STATE';
    if (score >= 45) return 'WARMING UP';
    return 'DISTRACTED / IDLE';
  };

  // Format today coding seconds as HH:MM:SS
  const formatCodingTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 relative overflow-hidden space-y-4">
      {/* Top Telemetry Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white">
                Real-Time Hardware Telemetry & Live Coding Engine
              </h4>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE SENSORS</span>
              </div>
            </div>
            <p className="text-[10px] font-mono text-slate-500">
              Hardware concurrency, memory heap, battery state, network RTT, and active coding stopwatch
            </p>
          </div>
        </div>

        {/* Real-time Focus Score & Active Coding Stopwatch Pill */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active Coding Time Stopwatch */}
          <div className="px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <div className="text-left font-mono">
              <div className="text-[8px] uppercase tracking-wider text-cyan-400/80">
                Time Spent Coding Today
              </div>
              <div className="font-handjet text-2xl font-bold leading-none text-cyan-300">
                {formatCodingTime(telemetry.todayCodingSeconds || 3840)}
              </div>
            </div>
          </div>

          {/* Real-time Focus Score */}
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2.5 ${getFocusBadgeColor(telemetry.realTimeFocusScore)}`}>
            <Zap className="w-4 h-4 fill-current animate-pulse" />
            <div className="text-left font-mono">
              <div className="text-[8px] uppercase tracking-wider opacity-80">
                {getFocusStatusText(telemetry.realTimeFocusScore)}
              </div>
              <div className="font-handjet text-2xl font-bold leading-none">
                {telemetry.realTimeFocusScore}% FOCUS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Real-Time Hardware Analyzers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. CPU Cores & Concurrency */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">CPU Cores</span>
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="my-1.5">
            <span className="font-handjet text-3xl font-bold text-cyan-300">
              {telemetry.cpuCores} CORES
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-400 truncate">Hardware Concurrency</span>
        </div>

        {/* 2. Device Memory & JS Heap (RAM) */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Memory & Heap</span>
            <HardDrive className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="my-1.5">
            <span className="font-handjet text-3xl font-bold text-purple-300">
              {telemetry.usedHeapMb || 52} MB
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-400 truncate">
            {telemetry.totalHeapMb || 128}MB / ~{telemetry.deviceMemoryGb}GB RAM
          </span>
        </div>

        {/* 3. Real-Time Network & Latency */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Network RTT</span>
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="my-1.5">
            <span className="font-handjet text-3xl font-bold text-emerald-300">
              {telemetry.rttLatency} ms
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-400 truncate">{telemetry.networkType} &middot; {telemetry.downlinkSpeed} Mbps</span>
        </div>

        {/* 4. Battery / Power Level */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Battery State</span>
            {telemetry.isCharging ? (
              <BatteryCharging className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            ) : (
              <Battery className="w-3.5 h-3.5 text-amber-400" />
            )}
          </div>
          <div className="my-1.5">
            <span className="font-handjet text-3xl font-bold text-amber-300">
              {telemetry.batteryLevel !== null ? `${telemetry.batteryLevel}%` : 'AC POWER'}
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-400 truncate">
            {telemetry.isCharging ? '⚡ Charging Active' : telemetry.batteryLevel !== null ? 'On Battery' : 'Wall Connected'}
          </span>
        </div>

        {/* 5. Weekly Logged Hours */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Weekly Logged</span>
            <Clock className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="my-1.5">
            <span className="font-handjet text-3xl font-bold text-sky-300">
              {telemetry.weeklyLoggedHours}h
            </span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-sky-400" 
              style={{ width: `${Math.min(100, (telemetry.weeklyLoggedHours / 40) * 100)}%` }} 
            />
          </div>
        </div>

        {/* 6. Active Git Repos & Commits */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Active Repos</span>
            <Activity className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="my-1.5">
            <span className="font-handjet text-3xl font-bold text-rose-300">
              {activeReposCount} REPOS
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-400 truncate">{totalCommits} recorded commits</span>
        </div>
      </div>
    </div>
  );
};

