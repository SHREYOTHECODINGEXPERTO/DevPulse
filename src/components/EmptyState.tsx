import React from 'react';
import { Terminal, Plus, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-12 border border-slate-800 text-center flex flex-col items-center justify-center space-y-3">
      <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 mb-2">
        <Terminal className="w-7 h-7" />
      </div>
      <h4 className="text-base font-bold text-slate-100 font-mono">{title}</h4>
      <p className="text-xs text-slate-400 max-w-md font-sans-ui leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold font-mono text-xs shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
