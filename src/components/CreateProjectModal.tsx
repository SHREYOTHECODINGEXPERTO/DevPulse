import React, { useState, useEffect } from 'react';
import { Layers, Sparkles, Loader2, Check, Plus, AlertCircle, Code, Globe, Tag } from 'lucide-react';
import { devPulseApi } from '../utils/api';
import { soundFx } from '../utils/audio';
import { triggerCodeCelebration } from '../utils/celebration';
import { ProjectTechStack, Developer } from '../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectSaved: (project: ProjectTechStack) => void;
  currentUser: Developer;
  editingProject?: ProjectTechStack | null;
}

const COMMON_LANGUAGES = ['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'Ruby', 'Kotlin', 'Swift'];
const COMMON_TAGS = ['React', 'Next.js', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'TailwindCSS', 'GraphQL', 'Docker', 'Kubernetes', 'Redis', 'AWS'];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectSaved,
  currentUser,
  editingProject,
}) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [primaryLanguage, setPrimaryLanguage] = useState('TypeScript');
  const [techStackBadges, setTechStackBadges] = useState<string[]>(['React', 'TypeScript', 'Node.js']);
  const [status, setStatus] = useState<'Active Sprint' | 'In Progress' | 'Completed' | 'Maintained'>('Active Sprint');
  const [repoUrl, setRepoUrl] = useState('');
  const [customTagInput, setCustomTagInput] = useState('');

  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.repoName || editingProject.fullName || '');
      setKey(editingProject.id?.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'PROJ');
      setDescription(editingProject.description || '');
      setPrimaryLanguage(editingProject.primaryLanguage || 'TypeScript');
      setTechStackBadges(editingProject.techStackBadges || ['React', 'TypeScript']);
      setStatus(editingProject.status || 'Active Sprint');
      setRepoUrl(editingProject.htmlUrl || '');
    } else {
      setName('');
      setKey('');
      setDescription('');
      setPrimaryLanguage('TypeScript');
      setTechStackBadges(['React', 'TypeScript', 'Node.js']);
      setStatus('Active Sprint');
      setRepoUrl('');
    }
  }, [editingProject, isOpen]);

  if (!isOpen) return null;

  // Auto-generate key when name changes if not manually set
  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingProject) {
      const generatedKey = val
        .trim()
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()
        .slice(0, 6);
      if (generatedKey) setKey(generatedKey);
    }
  };

  // AI-Assisted Description Generation
  const handleGenerateAIDescription = async () => {
    if (!name.trim()) {
      setErrorMsg('Please enter a project name first.');
      return;
    }

    setIsGeneratingDesc(true);
    setErrorMsg(null);
    soundFx.playClick(600, 0.04);

    try {
      const res = await devPulseApi.generateAIProjectDescription({
        name,
        key,
        primaryLanguage,
        techStack: techStackBadges,
      });

      if (res.success && res.data?.description) {
        setDescription(res.data.description);
        if (res.data.recommendedTechStack && res.data.recommendedTechStack.length > 0) {
          const merged = Array.from(new Set([...techStackBadges, ...res.data.recommendedTechStack]));
          setTechStackBadges(merged);
        }
        soundFx.playSuccess();
        triggerCodeCelebration({ particleCount: 35, spread: 50 });
      }
    } catch (err: any) {
      setErrorMsg('AI generation error: ' + err.message);
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleToggleTag = (tag: string) => {
    soundFx.playClick(700, 0.02);
    setTechStackBadges((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTagInput.trim()) {
      e.preventDefault();
      const val = customTagInput.trim();
      if (!techStackBadges.includes(val)) {
        setTechStackBadges((prev) => [...prev, val]);
        soundFx.playClick(800, 0.02);
      }
      setCustomTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Project name is required.');
      return;
    }

    const cleanKey = (key || name.slice(0, 5)).toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!cleanKey) {
      setErrorMsg('A valid project key is required.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    soundFx.playSuccess();

    const projectPayload: ProjectTechStack = {
      id: editingProject?.id || `proj-${cleanKey.toLowerCase()}-${Date.now()}`,
      repoName: name.trim(),
      fullName: `${currentUser.handle || 'org'}/${name.trim().toLowerCase().replace(/\s+/g, '-')}`,
      description: description.trim() || 'Software workspace managed by DevPulse.',
      primaryLanguage,
      languages: [primaryLanguage, ...techStackBadges.filter((t) => t !== primaryLanguage)],
      frameworks: techStackBadges,
      techStackBadges,
      stars: editingProject?.stars || 0,
      forks: editingProject?.forks || 0,
      openIssues: editingProject?.openIssues || 0,
      defaultBranch: editingProject?.defaultBranch || 'main',
      status,
      lastPushedAt: new Date().toISOString(),
      commitsThisMonth: editingProject?.commitsThisMonth || 12,
      commitsToday: editingProject?.commitsToday || 2,
      htmlUrl: repoUrl || `https://github.com/${currentUser.handle || 'dev'}/${name.trim().toLowerCase().replace(/\s+/g, '-')}`,
    };

    try {
      // Sync to backend API
      if (editingProject) {
        devPulseApi.updateProject(editingProject.id, {
          name: projectPayload.repoName,
          key: cleanKey,
          description: projectPayload.description,
          primaryLanguage,
          techStackBadges,
          status,
        }).catch((e) => console.warn('[Backend Sync]', e));
      } else {
        devPulseApi.createProject({
          name: projectPayload.repoName,
          key: cleanKey,
          description: projectPayload.description,
          primaryLanguage,
          techStackBadges,
          status,
          ownerId: currentUser.id,
          memberIds: [currentUser.id],
        }).catch((e) => console.warn('[Backend Sync]', e));
      }

      triggerCodeCelebration({ particleCount: 65, spread: 75 });
      onProjectSaved(projectPayload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl max-h-[90vh] flex flex-col bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-[1.5px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Layers className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                {editingProject ? 'Edit Project Workspace' : 'Create New Project'}
              </h3>
              <p className="text-xs text-slate-400">
                Configure repository workspace, tech stack, and sprint tracking.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar">
            {/* Name & Key */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Project / Repository Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Telemetry Core Engine"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Key Prefix *
                </label>
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                  placeholder="e.g. TELE"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-cyan-300 font-bold placeholder-slate-500 focus:outline-none focus:border-cyan-500 uppercase"
                />
              </div>
            </div>

            {/* Description with AI Generator Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  Project Description
                </label>
                <button
                  type="button"
                  onClick={handleGenerateAIDescription}
                  disabled={isGeneratingDesc || !name.trim()}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isGeneratingDesc ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Generating AI Description...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>AI Generate Description</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="High-throughput telemetry and continuous integration workspace..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
              />
            </div>

            {/* Primary Language & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Primary Language
                </label>
                <select
                  value={primaryLanguage}
                  onChange={(e) => setPrimaryLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {COMMON_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Sprint Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Active Sprint">Active Sprint</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Maintained">Maintained</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Tech Stack Badges */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Tech Stack Badges ({techStackBadges.length} selected)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_TAGS.map((tag) => {
                  const isSelected = techStackBadges.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              <div className="pt-1">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={handleAddCustomTag}
                  placeholder="Type custom tech tag & press Enter..."
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{editingProject ? 'Save Changes' : 'Create Project Workspace'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
