import React, { useState } from 'react';
import { Developer, MemeAvatar } from '../types';
import { GENZ_MEME_AVATARS, FUNNY_GENZ_DESIGNATIONS, FUNNY_STATUSES } from '../utils/memeAvatars';
import { soundFx } from '../utils/audio';
import { fetchGitHubUser } from '../utils/github';
import { triggerCodeCelebration } from '../utils/celebration';
import { 
  User, 
  Sparkles, 
  Check, 
  X, 
  Flame, 
  Github, 
  Camera, 
  Smile, 
  Briefcase, 
  Terminal,
  Zap,
  Loader2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Upload
} from 'lucide-react';

interface UserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Developer;
  onSaveUser?: (updatedUser: Developer) => void;
  onSaveProfile?: (updatedUser: Developer) => void;
}

export const UserLoginModal: React.FC<UserLoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveUser,
  onSaveProfile,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [handle, setHandle] = useState(currentUser.handle);
  const [role, setRole] = useState(currentUser.role);
  const [team, setTeam] = useState(currentUser.team);
  const [status, setStatus] = useState(currentUser.status);
  const [bio, setBio] = useState(currentUser.bio);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar);
  const [githubUsername, setGithubUsername] = useState(currentUser.githubUsername || currentUser.githubHandle || currentUser.handle || '');
  const [githubToken, setGithubToken] = useState(currentUser.githubToken || '');
  const [selectedMemeId, setSelectedMemeId] = useState<string>('gigachad_dev');
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [activeTab, setActiveTab] = useState<'github' | 'memes' | 'custom' | 'upload'>('github');
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [githubFetchError, setGithubFetchError] = useState<string | null>(null);
  const [githubSuccessMsg, setGithubSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectMeme = (meme: MemeAvatar) => {
    soundFx.playPacmanDot();
    setSelectedMemeId(meme.id);
    setAvatarUrl(meme.url);
  };

  const handleApplyCustomAvatar = () => {
    if (customAvatarInput.trim()) {
      setAvatarUrl(customAvatarInput.trim());
      soundFx.playClick(800, 0.05);
    }
  };

  const handleUseGithubPfp = (ghHandle?: string) => {
    const target = (ghHandle || githubUsername || handle).trim().replace(/^@/, '');
    if (target) {
      const pfpUrl = `https://github.com/${target}.png`;
      setAvatarUrl(pfpUrl);
      soundFx.playClick(750, 0.04);
      setGithubSuccessMsg(`Using GitHub PFP: @${target}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
          soundFx.playSuccess();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Real-time GitHub Profile Fetcher
  const handleFetchRealGitHubProfile = async () => {
    const targetHandle = (githubUsername || handle).trim().replace(/^@/, '');
    if (!targetHandle) {
      setGithubFetchError('Please enter a GitHub username.');
      return;
    }

    setIsFetchingGithub(true);
    setGithubFetchError(null);
    setGithubSuccessMsg(null);
    soundFx.playClick(600, 0.04);

    try {
      const userProfile = await fetchGitHubUser(targetHandle, githubToken || undefined);
      
      setName(userProfile.name || userProfile.login);
      setHandle(userProfile.login);
      setGithubUsername(userProfile.login);
      const ghPfp = userProfile.avatar_url || `https://github.com/${userProfile.login}.png`;
      setAvatarUrl(ghPfp);
      if (userProfile.bio) {
        setBio(userProfile.bio);
      }
      if (userProfile.company) {
        setTeam(userProfile.company.replace(/^@/, ''));
      }

      setGithubSuccessMsg(`Connected @${userProfile.login}! (${userProfile.public_repos} public repos, ${userProfile.followers} followers)`);
      triggerCodeCelebration({ particleCount: 40, spread: 60 });
    } catch (err: any) {
      setGithubFetchError(err.message || 'Could not find GitHub user');
      soundFx.playClick(200, 0.08);
    } finally {
      setIsFetchingGithub(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trigger coding symbols celebration instead of standard colorful confetti
    triggerCodeCelebration({ particleCount: 55, spread: 75 });

    const cleanGh = (githubUsername || handle).trim().replace(/^@/, '');
    
    // If active tab was github and avatar hasn't been set, connect to GitHub avatar
    let finalAvatar = avatarUrl;
    if ((activeTab === 'github' || !finalAvatar) && cleanGh) {
      finalAvatar = `https://github.com/${cleanGh}.png`;
    }

    const updated: Developer = {
      ...currentUser,
      name: name.trim() || cleanGh || 'Developer',
      handle: handle.trim().replace(/^@/, '') || cleanGh || 'dev',
      role: role.trim() || 'Software Engineer',
      team: team.trim() || 'Engineering Squad',
      status: status,
      bio: bio.trim() || 'Building software, solving problems, and shipping code.',
      avatar: finalAvatar,
      githubUsername: cleanGh,
      githubHandle: cleanGh,
      githubToken: githubToken.trim() || undefined,
    };

    const saveFn = onSaveUser || onSaveProfile;
    if (saveFn) {
      saveFn(updated);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900/95 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 overflow-hidden max-h-[90vh] flex flex-col font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                Connect Real User & GitHub Account
              </h3>
              <p className="text-[10px] text-slate-400">
                Log in with your real GitHub handle, avatar, designation, and live repos
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick(400, 0.04);
              onClose();
            }}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-5 pr-1">
          
          {/* Real GitHub Account Connection Panel */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-purple-950/30 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase">
                <Github className="w-4 h-4 text-cyan-400" />
                <span>Real GitHub Account Sync</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                LIVE API
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-xs text-cyan-400">@</span>
                <input
                  type="text"
                  placeholder="Enter real GitHub username (e.g. sssshreya444 or torvalds)"
                  value={githubUsername}
                  onChange={(e) => {
                    setGithubUsername(e.target.value);
                    setGithubFetchError(null);
                  }}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="button"
                onClick={handleFetchRealGitHubProfile}
                disabled={isFetchingGithub || !githubUsername.trim()}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
              >
                {isFetchingGithub ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Fetch GitHub</span>
                  </>
                )}
              </button>
            </div>

            {githubFetchError && (
              <div className="flex items-center gap-2 text-[11px] text-rose-400 bg-rose-950/40 border border-rose-800/60 p-2 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{githubFetchError}</span>
              </div>
            )}

            {githubSuccessMsg && (
              <div className="flex items-center gap-2 text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 p-2 rounded-lg">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{githubSuccessMsg}</span>
              </div>
            )}
          </div>

          {/* Avatar Preview & Source Picker */}
          <div className="space-y-3">
            {/* Avatar Source Tabs */}
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Profile Picture / Avatar Source</span>
              </label>

              <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5 text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('github');
                    handleUseGithubPfp();
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                    activeTab === 'github' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Github className="w-3 h-3" />
                  <span>GitHub PFP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('memes')}
                  className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                    activeTab === 'memes' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smile className="w-3 h-3" />
                  <span>Meme PFP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('custom')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activeTab === 'custom' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Custom URL
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                    activeTab === 'upload' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload</span>
                </button>
              </div>
            </div>

            {/* Current Active Preview */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 p-[2px] shadow-lg shadow-cyan-500/20">
                  <img
                    src={avatarUrl || `https://github.com/${(githubUsername || handle || 'developer').trim().replace(/^@/, '')}.png`}
                    alt="Selected PFP"
                    className="w-full h-full rounded-full object-cover bg-slate-900"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://github.com/${(githubUsername || handle || 'developer').trim().replace(/^@/, '')}.png`;
                    }}
                  />
                  <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-slate-950">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                </div>

                <div className="space-y-0.5 text-xs">
                  <div className="text-white font-bold">{name || 'Your Name'}</div>
                  <div className="text-cyan-400 text-[11px]">@{handle || githubUsername || 'username'}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-sm">{role || 'Software Engineer'} &middot; {team || 'Engineering'}</div>
                  <div className="text-[9px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{status}</span>
                  </div>
                </div>
              </div>

              {(githubUsername || handle) && (
                <button
                  type="button"
                  onClick={() => handleUseGithubPfp()}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 border border-cyan-500/30 transition-all shrink-0"
                >
                  <RefreshCw className="w-3 h-3 text-cyan-400" />
                  <span>Sync GitHub PFP</span>
                </button>
              )}
            </div>

            {/* GitHub Tab Quick Action */}
            {activeTab === 'github' && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-cyan-500/20 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-slate-300 text-[11px]">
                    Using GitHub avatar from <strong className="text-cyan-300">https://github.com/{(githubUsername || handle || 'username').trim().replace(/^@/, '')}.png</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleUseGithubPfp()}
                  className="px-2.5 py-1 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-bold border border-cyan-500/40"
                >
                  Apply PFP
                </button>
              </div>
            )}

            {/* Meme Gallery Grid */}
            {activeTab === 'memes' && (
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                {GENZ_MEME_AVATARS.map((meme) => {
                  const isSelected = avatarUrl === meme.url;
                  return (
                    <button
                      key={meme.id}
                      type="button"
                      onClick={() => handleSelectMeme(meme)}
                      className={`relative rounded-xl overflow-hidden aspect-square border transition-all group ${
                        isSelected
                          ? 'border-cyan-400 ring-2 ring-cyan-400/40 scale-105 shadow-md shadow-cyan-500/30'
                          : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                      }`}
                      title={`${meme.name} - ${meme.vibe}`}
                    >
                      <img
                        src={meme.url}
                        alt={meme.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-1">
                        <span className="text-[8px] text-white font-bold leading-tight truncate">
                          {meme.name.split(' ')[0]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Custom URL */}
            {activeTab === 'custom' && (
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Paste direct image URL (https://...)"
                  value={customAvatarInput}
                  onChange={(e) => setCustomAvatarInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomAvatar}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase"
                >
                  Apply
                </button>
              </div>
            )}

            {/* Direct File Upload */}
            {activeTab === 'upload' && (
              <div className="p-4 rounded-xl bg-white/5 border border-dashed border-white/20 text-center">
                <label className="cursor-pointer flex flex-col items-center justify-center gap-2">
                  <Upload className="w-6 h-6 text-cyan-400" />
                  <span className="text-xs text-slate-300 font-semibold">Click to upload photo from your computer</span>
                  <span className="text-[10px] text-slate-500">PNG, JPG, WEBP, GIF up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* User Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Display Name */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shreya Sharma"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Handle */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                Developer Handle / Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-cyan-400">@</span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/^@/, '');
                    setHandle(clean);
                    if (!githubUsername) setGithubUsername(clean);
                  }}
                  placeholder="shreya_dev"
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Designation / Role */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Designation / Role</span>
                <span className="text-cyan-400 text-[9px]">Pick preset or type custom</span>
              </label>

              <select
                onChange={(e) => {
                  if (e.target.value) setRole(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 mb-2"
              >
                <option value="">-- Choose Designation Preset --</option>
                <option value="Lead Software Engineer">Lead Software Engineer</option>
                <option value="Full-Stack Engineer">Full-Stack Engineer</option>
                <option value="Frontend Architect">Frontend Architect</option>
                <option value="Backend & Cloud Engineer">Backend & Cloud Engineer</option>
                <option value="AI / ML Systems Engineer">AI / ML Systems Engineer</option>
                {FUNNY_GENZ_DESIGNATIONS.map((desig) => (
                  <option key={desig} value={desig}>
                    {desig}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Custom title e.g. Full-Stack Engineer & System Architect"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Team / Squad */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                Team / Squad
              </label>
              <input
                type="text"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                placeholder="Core Platform & Architecture"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Presence Status */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                Presence Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Developer['status'])}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-emerald-400 focus:outline-none focus:border-cyan-500"
              >
                {FUNNY_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Bio */}
            <div className="sm:col-span-2">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                Developer Bio / Status Quote
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Building software, solving problems, and shipping code."
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Optional GitHub Token */}
            <div className="sm:col-span-2">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                Optional GitHub Personal Access Token (for 5,000 req/hr rate limit & private repos)
              </label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (stored securely in local browser storage)"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-tighter shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save & Connect Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

