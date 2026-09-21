import React from 'react';
import { Layers, Sparkles, Star, GitFork, AlertCircle, ExternalLink, Trash2, Edit3, CheckCircle2, Clock, Zap, ArrowRight, Tag, Users, ShieldAlert } from 'lucide-react';
import { ProjectTechStack, JiraIssue, Developer } from '../types';
import { soundFx } from '../utils/audio';

interface ProjectDetailModalProps {
  project: ProjectTechStack | null;
  isOpen: boolean;
  onClose: () => void;
  issues: JiraIssue[];
  currentUser: Developer;
  onEditProject: (project: ProjectTechStack) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenTaskGenerator: (projectKey: string) => void;
  onCreateTask: (projectName: string) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  isOpen,
  onClose,
  issues,
  currentUser,
  onEditProject,
  onDeleteProject,
  onOpenTaskGenerator,
  onCreateTask,
}) => {
  if (!isOpen || !project) return null;

  // Filter tasks belonging to this project (matching key or repoName or tag)
  const projectTasks = issues.filter((i) => {
    const keyMatch = project.id && i.key.startsWith(project.id.toUpperCase().slice(0, 4));
    const repoMatch = i.repo && (i.repo.includes(project.repoName) || i.repo.includes(project.fullName));
    const tagMatch = i.tags.some((t) => t.toLowerCase() === project.repoName.toLowerCase());
    return keyMatch || repoMatch || tagMatch;
  });

  const totalTasks = projectTasks.length;
  const doneTasks = projectTasks.filter((t) => t.status === 'Done').length;
  const inProgressTasks = projectTasks.filter((t) => t.status === 'In Progress').length;
  const inReviewTasks = projectTasks.filter((t) => t.status === 'In Review').length;
  const todoTasks = projectTasks.filter((t) => t.status === 'Todo' || t.status === 'Backlog').length;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${project.repoName}"? All associated tasks will be cascade deleted.`)) {
      soundFx.playSuccess();
      onDeleteProject(project.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-[1.5px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {project.repoName}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {project.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">{project.fullName}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditProject(project);
              }}
              title="Edit Project"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              title="Delete Project"
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar">
          {/* Description */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            {project.description || 'No description provided for this project.'}
          </div>

          {/* Sprint Progress HUD */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase">Sprint Delivery Progress</span>
              <span className="text-cyan-400 font-bold">{progressPct}% Complete ({doneTasks}/{totalTasks} Tasks)</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
              <div
                className="bg-amber-500 h-full transition-all duration-500"
                style={{ width: `${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}%` }}
              />
              <div
                className="bg-purple-500 h-full transition-all duration-500"
                style={{ width: `${totalTasks > 0 ? (inReviewTasks / totalTasks) * 100 : 0}%` }}
              />
            </div>

            {/* Task Counts Summary */}
            <div className="grid grid-cols-4 gap-2 pt-1 text-[11px]">
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-slate-400 block text-[10px]">Todo/Backlog</span>
                <strong className="text-slate-200">{todoTasks}</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-amber-400 block text-[10px]">In Progress</span>
                <strong className="text-amber-300">{inProgressTasks}</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-purple-400 block text-[10px]">In Review</span>
                <strong className="text-purple-300">{inReviewTasks}</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-emerald-400 block text-[10px]">Done</span>
                <strong className="text-emerald-300">{doneTasks}</strong>
              </div>
            </div>
          </div>

          {/* Tech Stack & Metadata */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
              Tech Stack & Languages
            </span>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold">
                {project.primaryLanguage}
              </span>
              {project.techStackBadges?.filter((t) => t !== project.primaryLanguage).map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 text-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Associated Tasks List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Project Sprint Tasks ({projectTasks.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCreateTask(project.repoName);
                }}
                className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
              >
                + New Task
              </button>
            </div>

            {projectTasks.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                No active tasks scoped for this project yet. Use AI to generate tasks!
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {projectTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-cyan-400 font-bold">{t.key}</span>
                      <span className="text-slate-200 truncate">{t.title}</span>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0 ${
                        t.status === 'Done'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : t.status === 'In Progress'
                          ? 'bg-amber-500/20 text-amber-300'
                          : t.status === 'In Review'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          {project.htmlUrl ? (
            <a
              href={project.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <span>View Repository</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenTaskGenerator(project.id || project.repoName);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>⚡ AI Generate Tasks</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
