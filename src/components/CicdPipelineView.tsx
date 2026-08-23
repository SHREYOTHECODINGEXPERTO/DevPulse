import React, { useState } from 'react';
import { PipelineRun } from '../types';
import { 
  PlayCircle, 
  CheckCircle2, 
  Clock, 
  RotateCw, 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  Server,
  Layers,
  ChevronDown
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { triggerCodeCelebration } from '../utils/celebration';

interface CicdPipelineViewProps {
  pipelines: PipelineRun[];
  onTriggerPipeline: (pipelineId: string) => void;
}

export const CicdPipelineView: React.FC<CicdPipelineViewProps> = ({
  pipelines,
  onTriggerPipeline,
}) => {
  const [selectedLogsPipeline, setSelectedLogsPipeline] = useState<PipelineRun | null>(pipelines[0] || null);

  const handleTrigger = (p: PipelineRun) => {
    triggerCodeCelebration({ particleCount: 50, spread: 75 });
    onTriggerPipeline(p.id);
  };

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <PlayCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              CI/CD Workflows & Fleet Telemetry
              <span className="font-handjet text-lg text-emerald-400 font-bold">
                [99.4% HEALTH]
              </span>
            </h3>
            <p className="text-xs font-mono text-slate-400">
              Automated container orchestration, e2e test suites, and canary deployments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Coverage: </span>
            <span className="font-handjet text-base text-emerald-300 font-bold">96.8%</span>
          </div>
        </div>
      </div>

      {/* Grid of Pipelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {pipelines.map((pipe) => {
          const isSuccess = pipe.status === 'success';
          const isRunning = pipe.status === 'running';

          return (
            <div
              key={pipe.id}
              className="glass-panel-interactive rounded-2xl p-4 sm:p-5 border border-slate-800 relative flex flex-col justify-between"
            >
              <div>
                {/* Top Status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                      pipe.environment === 'Production'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : pipe.environment === 'Staging'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {pipe.environment}
                    </span>
                    <span className="text-xs font-mono text-cyan-400 font-semibold">{pipe.service}</span>
                  </div>

                  <span className="text-xs font-mono text-slate-400">{pipe.duration}</span>
                </div>

                {/* Commit Msg */}
                <h4 className="text-xs sm:text-sm font-semibold text-slate-100 font-mono mb-2">
                  {pipe.commitMessage}
                </h4>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-3">
                  <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">
                    {pipe.commitHash}
                  </span>
                  <span>&middot;</span>
                  <span>{pipe.branch}</span>
                  <span>&middot;</span>
                  <span>by {pipe.author}</span>
                </div>

                {/* Test Suite Progress Bar */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Test Suite: {pipe.testsPassed}/{pipe.testsTotal} passed</span>
                    <span className="font-handjet text-sm text-emerald-400">{pipe.coverage}% cov</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        isRunning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${(pipe.testsPassed / pipe.testsTotal) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  {isSuccess ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Deployed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-400">
                      <Clock className="w-3.5 h-3.5 animate-spin" /> Building...
                    </span>
                  )}
                  <span className="text-slate-500">&middot; {pipe.startedAt}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedLogsPipeline(pipe)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-300 border border-slate-800 flex items-center gap-1"
                  >
                    <Terminal className="w-3 h-3 text-cyan-400" />
                    <span>Logs</span>
                  </button>

                  <button
                    onClick={() => handleTrigger(pipe)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 border border-cyan-500/30 flex items-center gap-1"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Re-run</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Deployment Log Stream Console */}
      {selectedLogsPipeline && (
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-200 font-bold">Build & Deployment Stream: {selectedLogsPipeline.service}</span>
              <span className="text-emerald-400">({selectedLogsPipeline.commitHash})</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Exit Code: 0</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/80 font-mono text-[11px] leading-relaxed text-slate-300 space-y-1 max-h-48 overflow-y-auto">
            <p className="text-slate-500">[00:00:01] 🚀 Initializing build runner container in cluster us-east-1...</p>
            <p className="text-slate-400">[00:00:14] 📦 Restored package cache (421MB in 1.4s)</p>
            <p className="text-cyan-400">[00:00:32] ⚙️ Compiling Rust / TypeScript binaries with target: x86_64-unknown-linux-gnu</p>
            <p className="text-slate-300">[00:01:05] 🧪 Running test suites (342 unit tests, 48 integration tests)...</p>
            <p className="text-emerald-400">[00:01:48] ✅ All {selectedLogsPipeline.testsTotal} tests passed (coverage: {selectedLogsPipeline.coverage}%)</p>
            <p className="text-slate-400">[00:02:10] 🔐 SBOM signed with Cosign key & published to OCI registry</p>
            <p className="text-emerald-300 font-bold">[00:02:14] 🎉 Container rollout complete across 12 pods. Zero downtime.</p>
          </div>
        </div>
      )}

    </div>
  );
};
