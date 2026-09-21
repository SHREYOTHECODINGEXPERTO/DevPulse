import React, { useState } from 'react';
import { Developer, MemeAvatar } from '../types';
import { CURRENT_DEV } from '../data/mockData';
import { GENZ_MEME_AVATARS } from '../utils/memeAvatars';
import { soundFx } from '../utils/audio';
import { fetchGitHubUser } from '../utils/github';
import { triggerCodeCelebration } from '../utils/celebration';
import { devPulseApi } from '../utils/api';
import { 
  Terminal, 
  Github, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  Loader2, 
  Zap, 
  UserPlus, 
  KeyRound,
  Radio,
  User,
  Mail,
  Briefcase,
  Users
} from 'lucide-react';

interface SignInPortalProps {
  onSignInSuccess: (user: Developer, token?: string) => Promise<void> | void;
}

export const SignInPortal: React.FC<SignInPortalProps> = ({ onSignInSuccess }) => {
  const [authMethod, setAuthMethod] = useState<'github' | 'register'>('github');
  
  // GitHub Sign-In Form State
  const [ghUsername, setGhUsername] = useState('');
  const [ghToken, setGhToken] = useState('');
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);
  const [ghError, setGhError] = useState<string | null>(null);

  // Custom Account Form State
  const [customName, setCustomName] = useState('');
  const [customHandle, setCustomHandle] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customRole, setCustomRole] = useState('Full-Stack Software Engineer');
  const [customTeam, setCustomTeam] = useState('Core Engineering Squad');
  const [customStatus, setCustomStatus] = useState<Developer['status']>('In the Zone');
  const [customBio, setCustomBio] = useState('Building high-performance software and architecting systems.');
  const [customGithubHandle, setCustomGithubHandle] = useState('');
  const [customAvatar, setCustomAvatar] = useState('');
  const [avatarMode, setAvatarMode] = useState<'github' | 'url' | 'memes'>('github');
  const [customAvatarUrlInput, setCustomAvatarUrlInput] = useState('');

  // Handle GitHub Sign-In
  const handleGitHubSubmit = async (e?: React.FormEvent, customPreset?: string) => {
    if (e) e.preventDefault();
    const handleToUse = (customPreset || ghUsername).trim().replace(/^@/, '');
    if (!handleToUse) {
      setGhError('Please enter your GitHub username.');
      return;
    }

    if (customPreset) setGhUsername(customPreset);

    setIsSyncingGithub(true);
    setGhError(null);
    soundFx.playClick(600, 0.04);

    try {
      const userProfile = await fetchGitHubUser(handleToUse, ghToken.trim() || undefined);
      
      const newDevUser: Developer = {
        ...CURRENT_DEV,
        id: `dev_${userProfile.login}`,
        name: userProfile.name || userProfile.login,
        handle: userProfile.login,
        avatar: userProfile.avatar_url || `https://github.com/${userProfile.login}.png`,
        bio: userProfile.bio || `Software engineer & open-source contributor @${userProfile.login}`,
        team: userProfile.company ? userProfile.company.replace(/^@/, '') : 'Core Engineering',
        role: 'Full-Stack Software Engineer',
        status: 'In the Zone',
        githubUsername: userProfile.login,
        githubHandle: userProfile.login,
        githubToken: ghToken.trim() || undefined,
      };

      // Register / persist in backend database
      devPulseApi.createUser({
        name: newDevUser.name,
        handle: newDevUser.handle,
        email: `${newDevUser.handle}@devpulse.io`,
        role: newDevUser.role,
        team: newDevUser.team,
        status: newDevUser.status,
        bio: newDevUser.bio,
        avatar: newDevUser.avatar,
      }).catch((err) => console.warn('[Backend User Registration]', err));

      triggerCodeCelebration({ particleCount: 65, spread: 80 });
      await onSignInSuccess(newDevUser, ghToken.trim() || undefined);
    } catch (err: any) {
      console.error(err);
      setGhError(err.message || 'Could not verify GitHub account. Please try again.');
      soundFx.playClick(200, 0.08);
    } finally {
      setIsSyncingGithub(false);
    }
  };

  // Handle Custom Profile Submit
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerCodeCelebration({ particleCount: 60, spread: 75 });

    const cleanHandle = customHandle.trim().replace(/^@/, '') || 'developer';
    const cleanGh = customGithubHandle.trim().replace(/^@/, '') || cleanHandle;

    let finalAvatar = customAvatar;
    if (!finalAvatar) {
      if (avatarMode === 'github' && cleanGh) {
        finalAvatar = `https://github.com/${cleanGh}.png`;
      } else {
        finalAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanHandle}`;
      }
    }

    const newDev: Developer = {
      ...CURRENT_DEV,
      id: `dev_${cleanHandle}_${Date.now()}`,
      name: customName.trim() || cleanHandle,
      handle: cleanHandle,
      role: customRole.trim() || 'Software Engineer',
      team: customTeam.trim() || 'Engineering Squad',
      status: customStatus,
      bio: customBio.trim() || `Developer @${cleanHandle} building systems on DevPulse.`,
      avatar: finalAvatar,
      githubUsername: cleanGh,
      githubHandle: cleanGh,
    };

    // Register & persist user in backend MongoDB / store
    devPulseApi.createUser({
      name: newDev.name,
      handle: newDev.handle,
      email: customEmail.trim() || `${cleanHandle}@devpulse.io`,
      role: newDev.role,
      team: newDev.team,
      status: newDev.status,
      bio: newDev.bio,
      avatar: newDev.avatar,
    }).catch((err) => console.warn('[Backend User Registration]', err));

    await onSignInSuccess(newDev);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 relative font-mono flex flex-col justify-center items-center px-4 py-8 overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Background ambient glowing grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Authentication Container */}
      <div className="relative w-full max-w-2xl z-10 space-y-6">
        
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs shadow-lg shadow-cyan-500/10">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-bold tracking-widest uppercase">Real-Time Developer Workspace</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>

          <div className="flex items-center justify-center gap-3 pt-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-emerald-500 p-[1.5px] shadow-xl shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Terminal className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <h1 className="font-handjet text-4xl sm:text-5xl font-bold tracking-widest bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
              DEVPULSE
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Log in to stream your real-time telemetry, live GitHub repositories, sprint Kanban board, and AI developer intelligence.
          </p>
        </div>

        {/* Security Shield Notice */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex items-center justify-between text-xs text-slate-300 shadow-xl">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-white">Live Session Protected:</strong> Please sign in with your real account to view your telemetry and workspace.
            </span>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
            UNAUTHENTICATED
          </span>
        </div>

        {/* Auth Method Selector Tabs */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
          
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick(600, 0.03);
                setAuthMethod('github');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg transition-all font-bold ${
                authMethod === 'github'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Github className="w-4 h-4 text-cyan-400" />
              <span>Connect GitHub Account</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick(600, 0.03);
                setAuthMethod('register');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg transition-all font-bold ${
                authMethod === 'register'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>Custom Developer Sign-In</span>
            </button>
          </div>

          {/* METHOD 1: REAL GITHUB SIGN-IN */}
          {authMethod === 'github' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Info banner */}
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-slate-300 space-y-1">
                <div className="flex items-center justify-between text-cyan-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    Live GitHub REST Data Streaming
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                    REAL-TIME SYNC
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Enter your real GitHub username. Your real public repositories, commit history, language breakdown, and pull requests will stream directly into the dashboard.
                </p>
              </div>

              {/* GitHub Credentials Form */}
              <form onSubmit={(e) => handleGitHubSubmit(e)} className="space-y-4 pt-1">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1.5 font-bold">
                    Your GitHub Username
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs text-cyan-400 font-bold">@</span>
                    <input
                      type="text"
                      required
                      value={ghUsername}
                      onChange={(e) => {
                        setGhUsername(e.target.value);
                        setGhError(null);
                      }}
                      placeholder="e.g. shreyakar or your_github_username"
                      className="w-full pl-8 pr-12 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                    />
                    {ghUsername.trim() && (
                      <div className="absolute right-3 w-6 h-6 rounded-full overflow-hidden border border-cyan-500/40">
                        <img
                          src={`https://github.com/${ghUsername.trim().replace(/^@/, '')}.png`}
                          alt="preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center justify-between">
                    <span className="font-bold">GitHub Personal Access Token (PAT)</span>
                    <span className="text-slate-500 text-[10px]">(Optional - 5,000 req/hr rate limit)</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={ghToken}
                      onChange={(e) => setGhToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                    />
                  </div>
                </div>

                {ghError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{ghError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSyncingGithub || !ghUsername.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
                >
                  {isSyncingGithub ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Fetching Real-Time GitHub Telemetry...</span>
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4 fill-slate-950" />
                      <span>Sign In & Stream Real Data</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* METHOD 2: CUSTOM DEVELOPER PROFILE REGISTRATION */}
          {authMethod === 'register' && (
            <form onSubmit={handleCustomSubmit} className="space-y-4 animate-in fade-in duration-200 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1 font-bold">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shreya Kar"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1 font-bold">
                    Developer Handle *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-emerald-400 font-bold">@</span>
                    <input
                      type="text"
                      required
                      placeholder="shreyakar"
                      value={customHandle}
                      onChange={(e) => setCustomHandle(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1 font-bold">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      placeholder="shreya@devpulse.io"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1 font-bold">
                    GitHub Handle (Optional Link)
                  </label>
                  <div className="relative">
                    <Github className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="shreyakar"
                      value={customGithubHandle}
                      onChange={(e) => setCustomGithubHandle(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1 font-bold">
                    Role / Title
                  </label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1 font-bold">
                    Squad / Team
                  </label>
                  <div className="relative">
                    <Users className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={customTeam}
                      onChange={(e) => setCustomTeam(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1 font-bold">
                  Bio
                </label>
                <textarea
                  rows={2}
                  value={customBio}
                  onChange={(e) => setCustomBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Create Account & Open Workspace</span>
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
