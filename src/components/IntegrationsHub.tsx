import React, { useState, useMemo, useEffect } from 'react';
import { CloudPlatformIntegration, GitHubRealRepo, GitHubRealCommit, Developer } from '../types';
import { 
  calculateLanguageStats,
  fetchGitHubRepos,
  fetchGitHubCommits
} from '../utils/github';
import { soundFx } from '../utils/audio';
import { 
  GitBranch, 
  Globe, 
  Server, 
  Cloud, 
  Database, 
  Zap, 
  Radio, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Star, 
  GitFork, 
  Play, 
  Shield,
  Layers,
  Check,
  Wifi,
  ToggleLeft,
  ToggleRight,
  Network,
  Send,
  Lock,
  Eye,
  EyeOff,
  Cpu,
  Key,
  Terminal,
  Activity,
  Code2,
  GitPullRequest,
  CheckCircle,
  Copy,
  Clock,
  Settings,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface IntegrationsHubProps {
  currentUser: Developer;
  onUpdateUserGitHub: (username: string, token?: string) => void;
  onSyncGitHubData: (repos: GitHubRealRepo[], commits: GitHubRealCommit[]) => void;
  realRepos: GitHubRealRepo[];
  realCommits: GitHubRealCommit[];
  isGitHubLoading: boolean;
  gitHubError: string | null;
}

const PRESET_GITHUB_USERS = ['shadcn', 'torvalds', 'gaearon', 'antfu', 'yyx990803', 'mrdoob'];

export const IntegrationsHub: React.FC<IntegrationsHubProps> = ({
  currentUser,
  onUpdateUserGitHub,
  onSyncGitHubData,
  realRepos,
  realCommits,
  isGitHubLoading,
  gitHubError,
}) => {
  const cleanUser = useMemo(() => {
    return (currentUser.githubHandle || currentUser.githubUsername || currentUser.handle || 'shadcn')
      .trim()
      .replace(/^@/, '');
  }, [currentUser]);

  const [gitUsernameInput, setGitUsernameInput] = useState(cleanUser);
  const [gitTokenInput, setGitTokenInput] = useState(currentUser.githubToken || '');
  const [selectedRepoFilter, setSelectedRepoFilter] = useState('');
  const [isPinging, setIsPinging] = useState<string | null>(null);
  const [simulatedDeployLog, setSimulatedDeployLog] = useState<string | null>(null);
  const [pingLatencies, setPingLatencies] = useState<Record<string, number>>({});
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Pipeline switcher tabs: Vercel, Render, Cloudflare, Supabase, GitHub, Matrix
  const [activePipelineTab, setActivePipelineTab] = useState<'vercel' | 'render' | 'cloudflare' | 'supabase' | 'github' | 'matrix'>('vercel');

  // Cloudflare WebSocket Toggle & Test State
  const [cloudflareWsEnabled, setCloudflareWsEnabled] = useState(true);
  const [wsTestStatus, setWsTestStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [wsLatency, setWsLatency] = useState<number | null>(null);
  const [wsFramesLog, setWsFramesLog] = useState<Array<{ direction: 'TX' | 'RX'; text: string; time: string }>>([
    { direction: 'RX', text: `WS Proxy Gateway ready for ${cleanUser}.dev / TLS 1.3`, time: '10:00:00' }
  ]);
  
  // Supabase CDC Broadcast Simulator state
  const [supabaseBroadcastStatus, setSupabaseBroadcastStatus] = useState<'idle' | 'broadcasting' | 'received'>('idle');
  const [supabaseBroadcastCount, setSupabaseBroadcastCount] = useState(64);
  const [cdcLogs, setCdcLogs] = useState<Array<{ table: string; event: string; record: string; timestamp: string }>>([
    { table: 'commits', event: 'INSERT', record: `{"sha":"${realCommits[0]?.sha?.substring(0, 7) || 'a1b2c3d'}","author":"${cleanUser}"}`, timestamp: '10:02:14' },
    { table: 'deployments', event: 'UPDATE', record: `{"status":"LIVE","service":"vercel-edge","env":"production"}`, timestamp: '10:05:30' }
  ]);

  // Webhook Delivery Test state
  const [webhookTestStatus, setWebhookTestStatus] = useState<'idle' | 'testing' | 'success'>('idle');
  const [webhookDeliveryLatency, setWebhookDeliveryLatency] = useState<number | null>(null);
  const [webhookEventsList, setWebhookEventsList] = useState<Array<{ event: string; repo: string; id: string; status: number; time: string }>>([
    { event: 'push', repo: realRepos[0]?.name || 'web-app', id: 'del_9281a', status: 200, time: 'Just now' },
    { event: 'pull_request', repo: realRepos[1]?.name || 'api-server', id: 'del_8412c', status: 200, time: '4m ago' },
    { event: 'workflow_run', repo: realRepos[0]?.name || 'web-app', id: 'del_7190d', status: 200, time: '12m ago' }
  ]);

  // Individual repo deployment statuses for the deployment matrix
  const [repoDeployStates, setRepoDeployStates] = useState<Record<string, { status: 'idle' | 'deploying' | 'live'; timestamp: string }>>({});

  // Sync username input if cleanUser changes externally
  useEffect(() => {
    setGitUsernameInput(cleanUser);
  }, [cleanUser]);

  // Categorize real repositories into Frontend, Backend, Database, and Edge sets
  const frontendRepos = useMemo(() => {
    const list = realRepos.filter((r) => {
      const lang = (r.language || '').toLowerCase();
      const topics = (r.topics || []).map((t) => t.toLowerCase());
      const name = r.name.toLowerCase();
      return (
        lang.includes('typescript') ||
        lang.includes('javascript') ||
        lang.includes('vue') ||
        lang.includes('html') ||
        lang.includes('css') ||
        topics.some((t) =>
          ['react', 'nextjs', 'vue', 'tailwind', 'ui', 'frontend', 'portfolio', 'vite', 'svelte', 'design-system', 'template', 'web'].includes(t)
        ) ||
        name.includes('ui') ||
        name.includes('web') ||
        name.includes('template') ||
        name.includes('portfolio') ||
        name.includes('frontend')
      );
    });
    return list.length > 0 ? list : realRepos;
  }, [realRepos]);

  const backendRepos = useMemo(() => {
    const list = realRepos.filter((r) => {
      const lang = (r.language || '').toLowerCase();
      const topics = (r.topics || []).map((t) => t.toLowerCase());
      const name = r.name.toLowerCase();
      return (
        lang.includes('python') ||
        lang.includes('rust') ||
        lang.includes('go') ||
        lang.includes('c') ||
        lang.includes('c++') ||
        lang.includes('shell') ||
        topics.some((t) =>
          ['api', 'backend', 'websocket', 'socket-io', 'server', 'docker', 'fastapi', 'microservice', 'express', 'trpc', 'prisma', 'queue', 'redis'].includes(t)
        ) ||
        name.includes('api') ||
        name.includes('server') ||
        name.includes('pipeline') ||
        name.includes('engine') ||
        name.includes('service') ||
        name.includes('proxy')
      );
    });
    return list.length > 0 ? list : realRepos;
  }, [realRepos]);

  const databaseRepos = useMemo(() => {
    const list = realRepos.filter((r) => {
      const topics = (r.topics || []).map((t) => t.toLowerCase());
      const name = r.name.toLowerCase();
      return (
        topics.some((t) =>
          ['prisma', 'postgres', 'postgresql', 'database', 'sql', 'trpc', 'supabase', 'redis', 'graphql', 'auth', 'schema'].includes(t)
        ) ||
        name.includes('data') ||
        name.includes('db') ||
        name.includes('backend') ||
        name.includes('trpc')
      );
    });
    return list.length > 0 ? list : realRepos.slice(0, Math.max(1, Math.ceil(realRepos.length / 2)));
  }, [realRepos]);

  // Selected repositories for each pipeline
  const [selectedVercelRepoName, setSelectedVercelRepoName] = useState<string>('');
  const [selectedRenderRepoName, setSelectedRenderRepoName] = useState<string>('');
  const [selectedSupabaseRepoName, setSelectedSupabaseRepoName] = useState<string>('');

  const selectedVercelRepo = useMemo(() => {
    if (selectedVercelRepoName) {
      const found = realRepos.find((r) => r.name === selectedVercelRepoName);
      if (found) return found;
    }
    return frontendRepos[0] || realRepos[0];
  }, [selectedVercelRepoName, frontendRepos, realRepos]);

  const selectedRenderRepo = useMemo(() => {
    if (selectedRenderRepoName) {
      const found = realRepos.find((r) => r.name === selectedRenderRepoName);
      if (found) return found;
    }
    return backendRepos[0] || realRepos[0];
  }, [selectedRenderRepoName, backendRepos, realRepos]);

  const selectedSupabaseRepo = useMemo(() => {
    if (selectedSupabaseRepoName) {
      const found = realRepos.find((r) => r.name === selectedSupabaseRepoName);
      if (found) return found;
    }
    return databaseRepos[0] || realRepos[0];
  }, [selectedSupabaseRepoName, databaseRepos, realRepos]);

  // Dynamically computed cloud integrations strictly from the connected GitHub account and repos
  const dynamicIntegrations = useMemo<CloudPlatformIntegration[]>(() => {
    const totalRepos = realRepos.length;
    const topFrontend = selectedVercelRepo || frontendRepos[0];
    const topBackend = selectedRenderRepo || backendRepos[0];

    return [
      {
        id: 'github',
        name: 'GitHub VCS & Webhooks',
        iconName: 'git',
        category: 'Code & VCS',
        status: 'connected',
        accountOrProject: `github.com/${cleanUser} (${totalRepos} repos)`,
        latencyMs: pingLatencies['github'] ?? 12,
        lastSync: realCommits.length > 0 ? `Commit ${realCommits[0].sha.substring(0, 7)} Synced` : 'Webhooks Active',
        activeDeployments: totalRepos,
        color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      },
      {
        id: 'vercel',
        name: 'Vercel Edge (Frontend Hosting)',
        iconName: 'vercel',
        category: 'Hosting & Edge',
        status: 'connected',
        accountOrProject: topFrontend ? `${topFrontend.name}-${cleanUser}.vercel.app` : `${cleanUser}.vercel.app`,
        latencyMs: pingLatencies['vercel'] ?? 9,
        lastSync: topFrontend ? `Updated ${new Date(topFrontend.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Live',
        activeDeployments: frontendRepos.length,
        color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      },
      {
        id: 'render',
        name: 'Render (Real-Time Node.js Server)',
        iconName: 'render',
        category: 'Compute & Database',
        status: 'connected',
        accountOrProject: topBackend ? `${topBackend.name}-api.onrender.com` : `${cleanUser}-api.onrender.com`,
        latencyMs: pingLatencies['render'] ?? 21,
        lastSync: 'Persistent WS Runner Active',
        activeDeployments: backendRepos.length,
        color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
      },
      {
        id: 'cloudflare',
        name: 'Cloudflare (DNS, Security & WS Proxy)',
        iconName: 'cloudflare',
        category: 'CDN & DNS',
        status: 'connected',
        accountOrProject: `${cleanUser}.dev / api.${cleanUser}.dev`,
        latencyMs: pingLatencies['cloudflare'] ?? 6,
        lastSync: cloudflareWsEnabled ? 'WS Proxy 100% Pass' : 'WS Proxy Disabled',
        activeDeployments: totalRepos * 2,
        color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      },
      {
        id: 'supabase',
        name: 'Supabase Realtime DB',
        iconName: 'supabase',
        category: 'Compute & Database',
        status: 'connected',
        accountOrProject: `db.${cleanUser}.supabase.co`,
        latencyMs: pingLatencies['supabase'] ?? 16,
        lastSync: 'Postgres CDC Live Stream',
        activeDeployments: Math.max(1, databaseRepos.length),
        color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      },
    ];
  }, [realRepos, frontendRepos, backendRepos, databaseRepos, selectedVercelRepo, selectedRenderRepo, cleanUser, pingLatencies, realCommits, cloudflareWsEnabled]);

  // Trigger Real GitHub API Fetch
  const handleConnectGitHub = async (e?: React.FormEvent, customHandle?: string) => {
    if (e) e.preventDefault();
    const handleToUse = (customHandle || gitUsernameInput).trim().replace(/^@/, '');
    if (!handleToUse) return;

    if (customHandle) setGitUsernameInput(customHandle);

    soundFx.playClick(750, 0.05);
    try {
      onUpdateUserGitHub(handleToUse, gitTokenInput.trim());
      const repos = await fetchGitHubRepos(handleToUse, gitTokenInput.trim());
      let commits: GitHubRealCommit[] = [];
      if (repos.length > 0) {
        const topRepo = repos[0];
        const [owner, repoName] = topRepo.full_name.split('/');
        commits = await fetchGitHubCommits(owner || handleToUse, repoName || topRepo.name, gitTokenInput.trim());
      }
      onSyncGitHubData(repos, commits);
      soundFx.playSuccess();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (err: unknown) {
      console.error(err);
    }
  };

  // Test Ping Latency to Edge Integration
  const handlePingIntegration = (integrationId: string) => {
    setIsPinging(integrationId);
    soundFx.playClick(600, 0.04);
    setTimeout(() => {
      const simulatedLatency = Math.floor(Math.random() * 12) + 5;
      setPingLatencies((prev) => ({ ...prev, [integrationId]: simulatedLatency }));
      setIsPinging(null);
      soundFx.playSuccess();
    }, 400);
  };

  // Trigger Real-Time Deploy Simulation for user's repository
  const handleSimulateDeploy = (integrationName: string, repoName?: string) => {
    const targetRepo = repoName || selectedVercelRepo?.name || selectedRenderRepo?.name || 'app';
    soundFx.playRetroPowerUp();
    setSimulatedDeployLog(`[DEPLOY PIPELINE] Triggering ${integrationName} for @${cleanUser}/${targetRepo}... Pulling commit ${realCommits[0]?.sha?.substring(0, 7) || 'HEAD'} on ${selectedVercelRepo?.default_branch || 'main'}...`);
    
    // update matrix state
    setRepoDeployStates((prev) => ({
      ...prev,
      [targetRepo]: { status: 'deploying', timestamp: 'Just now' }
    }));

    setTimeout(() => {
      setSimulatedDeployLog(`[DEPLOY PIPELINE] ✅ ${integrationName} deploy complete for ${cleanUser}/${targetRepo} (Build: 1.1s, 0 errors, 100% health, CDN cache primed).`);
      setRepoDeployStates((prev) => ({
        ...prev,
        [targetRepo]: { status: 'live', timestamp: 'Just now' }
      }));
      confetti({ particleCount: 40, spread: 55 });
    }, 1400);
  };

  // Test WebSocket Handshake through Cloudflare / Render for the user's backend repo
  const handleTestWebSocket = () => {
    setWsTestStatus('testing');
    soundFx.playClick(650, 0.03);

    const now = new Date().toLocaleTimeString();
    const repoName = selectedRenderRepo?.name || 'backend-api';
    
    setWsFramesLog((prev) => [
      ...prev.slice(-8),
      {
        direction: 'TX',
        text: `CONNECT wss://${repoName}-api.onrender.com/ws?user=@${cleanUser}&origin=${cleanUser}.dev`,
        time: now,
      },
    ]);

    setTimeout(() => {
      if (!cloudflareWsEnabled) {
        setWsTestStatus('error');
        setWsLatency(null);
        setWsFramesLog((prev) => [
          ...prev.slice(-8),
          {
            direction: 'RX',
            text: `HTTP 403 Forbidden: Cloudflare WebSockets proxy toggle is OFF. Frames dropped by edge firewall.`,
            time: new Date().toLocaleTimeString(),
          },
        ]);
      } else {
        const simulatedWsLatency = Math.floor(Math.random() * 10) + 6;
        setWsLatency(simulatedWsLatency);
        setWsTestStatus('connected');
        soundFx.playSuccess();

        setWsFramesLog((prev) => [
          ...prev.slice(-8),
          {
            direction: 'RX',
            text: `101 Switching Protocols | TLS 1.3 | Cipher: ChaCha20-Poly1305 | RTT: ${simulatedWsLatency}ms`,
            time: new Date().toLocaleTimeString(),
          },
          {
            direction: 'RX',
            text: `ACK STREAM: { user: "@${cleanUser}", repo: "${repoName}", channel: "telemetry", status: "LIVE_CONNECTED" }`,
            time: new Date().toLocaleTimeString(),
          },
        ]);
      }
    }, 600);
  };

  // Trigger Supabase Realtime CDC Broadcast
  const handleTriggerSupabaseBroadcast = () => {
    setSupabaseBroadcastStatus('broadcasting');
    soundFx.playClick(700, 0.04);

    const now = new Date().toLocaleTimeString();
    const newRecordSha = Math.random().toString(36).substring(2, 9);
    
    setTimeout(() => {
      setSupabaseBroadcastStatus('received');
      setSupabaseBroadcastCount((c) => c + 1);
      setCdcLogs((prev) => [
        {
          table: 'commits',
          event: 'INSERT',
          record: `{"sha":"${newRecordSha}","author":"${cleanUser}","repo":"${selectedSupabaseRepo?.name || 'app'}","delta":"+48 -12"}`,
          timestamp: now
        },
        ...prev.slice(0, 5)
      ]);
      soundFx.playSuccess();
      setTimeout(() => setSupabaseBroadcastStatus('idle'), 2200);
    }, 500);
  };

  // Trigger GitHub Webhook Delivery Test
  const handleTestWebhookDelivery = () => {
    setWebhookTestStatus('testing');
    soundFx.playClick(800, 0.04);

    setTimeout(() => {
      const lat = Math.floor(Math.random() * 8) + 10;
      setWebhookDeliveryLatency(lat);
      setWebhookTestStatus('success');
      setWebhookEventsList((prev) => [
        {
          event: 'push',
          repo: selectedVercelRepo?.name || 'project',
          id: `del_${Math.random().toString(36).substring(2, 7)}`,
          status: 200,
          time: 'Just now'
        },
        ...prev.slice(0, 4)
      ]);
      soundFx.playSuccess();
      setTimeout(() => setWebhookTestStatus('idle'), 3000);
    }, 550);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    soundFx.playClick(900, 0.02);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const languageStats = calculateLanguageStats(realRepos);
  const filteredRepos = realRepos.filter((r) =>
    r.name.toLowerCase().includes(selectedRepoFilter.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(selectedRepoFilter.toLowerCase())) ||
    (r.language && r.language.toLowerCase().includes(selectedRepoFilter.toLowerCase()))
  );

  const totalStarsCount = useMemo(() => {
    return realRepos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  }, [realRepos]);

  const totalForksCount = useMemo(() => {
    return realRepos.reduce((acc, r) => acc + (r.forks_count || 0), 0);
  }, [realRepos]);

  return (
    <div className="space-y-6">
      
      {/* 1. Profile Header & Real-Time Sync Bar */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={currentUser.avatar || `https://github.com/${cleanUser}.png`}
                alt={cleanUser}
                className="w-13 h-13 rounded-2xl border-2 border-cyan-500/40 object-cover shadow-md shadow-cyan-500/10"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;
                }}
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" />
              </span>
            </div>
            
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <span>Cloud & Git Operations Deck</span>
                  <span className="text-cyan-400 font-bold">@{cleanUser}</span>
                </h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  VCS CONNECTED
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {realRepos.length} LIVE REPOS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Every cloud edge target, WebSocket proxy, and serverless pipeline is synchronized with @{cleanUser}'s active repositories
              </p>
            </div>
          </div>

          {/* Quick Metrics Header */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              <span className="text-slate-400">Stars:</span>
              <span className="text-amber-300 font-bold">{totalStarsCount}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <GitFork className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-slate-400">Forks:</span>
              <span className="text-purple-300 font-bold">{totalForksCount}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold">Edge Telemetry 100%</span>
            </div>
          </div>
        </div>

        {/* GitHub Preset Switchers */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          <span className="text-slate-400 text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Quick Switch GitHub Profile:
          </span>
          {PRESET_GITHUB_USERS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleConnectGitHub(undefined, preset)}
              className={`px-2.5 py-1 rounded-lg border text-xs transition-all cursor-pointer ${
                cleanUser.toLowerCase() === preset.toLowerCase()
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold shadow-sm shadow-cyan-500/10'
                  : 'bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border-white/10 hover:border-cyan-500/30'
              }`}
            >
              @{preset}
            </button>
          ))}
        </div>

        {/* Live GitHub Account Sync Input Form */}
        <form onSubmit={(e) => handleConnectGitHub(e)} className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
          <div className="md:col-span-4">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              GitHub Username / Handle (Public API)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-cyan-400 font-mono font-bold">@</span>
              <input
                type="text"
                value={gitUsernameInput}
                onChange={(e) => setGitUsernameInput(e.target.value)}
                placeholder="e.g. username or organization"
                className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950/90 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="md:col-span-5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Personal Access Token <span className="text-slate-500">(Optional for private repos & 5,000 req/hr)</span>
            </label>
            <input
              type="password"
              value={gitTokenInput}
              onChange={(e) => setGitTokenInput(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="md:col-span-3 flex items-end">
            <button
              type="submit"
              disabled={isGitHubLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-tighter shadow-md shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGitHubLoading ? 'animate-spin' : ''}`} />
              <span>{isGitHubLoading ? 'Syncing...' : 'Fetch Live GitHub Profile'}</span>
            </button>
          </div>
        </form>

        {gitHubError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{gitHubError}</span>
          </div>
        )}

        {simulatedDeployLog && (
          <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse flex-shrink-0" />
              <span className="truncate">{simulatedDeployLog}</span>
            </div>
            <button 
              onClick={() => setSimulatedDeployLog(null)}
              className="text-slate-500 hover:text-slate-300 ml-2 text-[10px] cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* 2. Interactive Five-Pipeline Architecture & Deployment Control */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-cyan-500/30 space-y-5 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2 flex-wrap">
                <span>Cloud Platforms & Git Deploy Engine</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                  ACTIVE FOR @{cleanUser}
                </span>
              </h4>
              <p className="text-xs text-slate-400 font-mono">
                5-Tier Stack: Vercel (Edge UI) &bull; Render (Node/WS API) &bull; Cloudflare (DNS & WS Proxy) &bull; Supabase (Realtime DB) &bull; GitHub VCS
              </p>
            </div>
          </div>

          {/* Pipeline switcher tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs flex-wrap">
            <button
              onClick={() => {
                soundFx.playClick(500, 0.02);
                setActivePipelineTab('vercel');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activePipelineTab === 'vercel' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Vercel Edge ({frontendRepos.length})
            </button>
            <button
              onClick={() => {
                soundFx.playClick(500, 0.02);
                setActivePipelineTab('render');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activePipelineTab === 'render' ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Render API ({backendRepos.length})
            </button>
            <button
              onClick={() => {
                soundFx.playClick(500, 0.02);
                setActivePipelineTab('cloudflare');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activePipelineTab === 'cloudflare' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3. Cloudflare & WS Proxy
            </button>
            <button
              onClick={() => {
                soundFx.playClick(500, 0.02);
                setActivePipelineTab('supabase');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activePipelineTab === 'supabase' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              4. Supabase CDC DB
            </button>
            <button
              onClick={() => {
                soundFx.playClick(500, 0.02);
                setActivePipelineTab('github');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activePipelineTab === 'github' ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              5. GitHub Webhooks
            </button>
            <button
              onClick={() => {
                soundFx.playClick(500, 0.02);
                setActivePipelineTab('matrix');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activePipelineTab === 'matrix' ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Fleet Matrix
            </button>
          </div>
        </div>

        {/* Tab 1: Vercel Frontend Pipeline */}
        {activePipelineTab === 'vercel' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in duration-150">
            <div className="lg:col-span-7 space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  1. Vercel Edge Frontend: Connected to @{cleanUser} ({frontendRepos.length} Deployable Repos)
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Vercel listens to push webhooks on GitHub to automatically build and deploy your frontend projects to its globally distributed edge network.
                </p>
              </div>

              {/* Repo Selector for Vercel */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Select Connected GitHub Repository to Inspect Vercel Deploy:
                </label>
                <div className="flex gap-2 flex-wrap">
                  {frontendRepos.slice(0, 6).map((repo) => (
                    <button
                      key={repo.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick(600, 0.02);
                        setSelectedVercelRepoName(repo.name);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
                        selectedVercelRepo?.name === repo.name
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                          : 'bg-white/5 text-slate-400 border-white/5 hover:text-slate-200'
                      }`}
                    >
                      {repo.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <div>
                    <span className="font-bold text-white">Repository Linked: <code className="text-cyan-300">{cleanUser}/{selectedVercelRepo?.name}</code></span>
                    <p className="text-slate-400 text-[11px]">Default branch: <code className="text-cyan-300">{selectedVercelRepo?.default_branch || 'main'}</code> &middot; Primary language: {selectedVercelRepo?.language || 'TypeScript'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <div>
                    <span className="font-bold text-white">Edge Build & Static Output</span>
                    <p className="text-slate-400 text-[11px]">Command: <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">npm run build</code> &middot; Output: <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">dist/</code></p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <div>
                    <span className="font-bold text-white">Live Production URL</span>
                    <p className="text-slate-400 text-[11px]">
                      <a 
                        href={selectedVercelRepo?.homepage || `https://${selectedVercelRepo?.name}-${cleanUser}.vercel.app`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 underline font-bold"
                      >
                        https://{selectedVercelRepo?.name}-{cleanUser}.vercel.app
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-emerald-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Real-time trigger:</strong> Pushing commits to <code className="bg-slate-900 px-1 py-0.5 rounded text-white">{cleanUser}/{selectedVercelRepo?.name}</code> automatically triggers an atomic Vercel deployment with zero downtime.
                </span>
              </div>
            </div>

            {/* Right Card: Live Vercel Status Box */}
            <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Vercel Edge Status</span>
                <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live Syncing ({frontendRepos.length} projects)
                </span>
              </div>

              <div className="space-y-1.5 text-slate-300 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Selected Project:</span>
                  <span className="text-cyan-300 font-bold">{selectedVercelRepo?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Framework:</span>
                  <span className="text-white font-mono">{selectedVercelRepo?.language === 'TypeScript' ? 'Vite + React (TS)' : 'Next.js 14'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Branch:</span>
                  <span className="text-white font-mono bg-slate-900 px-1.5 rounded">{selectedVercelRepo?.default_branch || 'main'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Latest Commit:</span>
                  <span className="text-cyan-400 font-mono">{realCommits[0]?.sha?.substring(0, 7) || 'HEAD'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Edge Domain:</span>
                  <span className="text-cyan-400 underline truncate max-w-[170px]">{selectedVercelRepo?.name}-{cleanUser}.vercel.app</span>
                </div>
              </div>

              <button
                onClick={() => handleSimulateDeploy('Vercel Edge', selectedVercelRepo?.name)}
                className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-cyan-500/20 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate `git push` Vercel Deploy</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Render Backend Socket.io Pipeline */}
        {activePipelineTab === 'render' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in duration-150">
            <div className="lg:col-span-7 space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-purple-400" />
                  2. Render Backend & Socket.io: Connected to @{cleanUser} ({backendRepos.length} Services)
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Persistent container hosting for Node.js, Python, or Go real-time WebSocket servers connected directly to your GitHub repository.
                </p>
              </div>

              {/* Repo Selector for Render */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Select Connected Backend Repository on Render:
                </label>
                <div className="flex gap-2 flex-wrap">
                  {backendRepos.slice(0, 6).map((repo) => (
                    <button
                      key={repo.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick(600, 0.02);
                        setSelectedRenderRepoName(repo.name);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
                        selectedRenderRepo?.name === repo.name
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
                          : 'bg-white/5 text-slate-400 border-white/5 hover:text-slate-200'
                      }`}
                    >
                      {repo.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <div>
                    <span className="font-bold text-white">Service: <code className="text-purple-300">{cleanUser}/{selectedRenderRepo?.name}</code></span>
                    <p className="text-slate-400 text-[11px]">Runner: Persistent container (Port 3000 / 0.0.0.0)</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <div>
                    <span className="font-bold text-white">Runtime Commands</span>
                    <div className="mt-1 space-y-0.5 text-[11px]">
                      <div>Build: <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded">npm install</code></div>
                      <div>Start: <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">node server.js</code></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <div>
                    <span className="font-bold text-white">WebSocket Host & Protocol</span>
                    <p className="text-purple-300 text-[11px] font-mono">
                      wss://{selectedRenderRepo?.name}-api.onrender.com/ws
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-purple-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400 shrink-0" />
                <span>
                  <strong>Real-time effect:</strong> Render monitors your <code className="text-white">{cleanUser}/{selectedRenderRepo?.name}</code> repository and rolls container updates upon commit push.
                </span>
              </div>
            </div>

            {/* Right Card: Live Render Container Status Box */}
            <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Render Web Service</span>
                <span className="text-purple-400 flex items-center gap-1 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  Online ({backendRepos.length} active services)
                </span>
              </div>

              <div className="space-y-1.5 text-slate-300 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Service Name:</span>
                  <span className="text-purple-300 font-bold">{selectedRenderRepo?.name}-svc</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Runtime:</span>
                  <span className="text-white font-mono">{selectedRenderRepo?.language || 'Node.js 20.x'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">WebSockets Engine:</span>
                  <span className="text-emerald-400 font-mono">Socket.io / ws</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Process Memory:</span>
                  <span className="text-emerald-400 font-bold">148 MB / 512 MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Backend Endpoint:</span>
                  <span className="text-purple-400 underline truncate max-w-[170px]">{selectedRenderRepo?.name}-api.onrender.com</span>
                </div>
              </div>

              <button
                onClick={() => handleSimulateDeploy('Render Web Service', selectedRenderRepo?.name)}
                className="w-full py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-purple-500/20 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Trigger Rolling Container Restart</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Cloudflare Domain & WebSockets Routing */}
        {activePipelineTab === 'cloudflare' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in duration-150">
            <div className="lg:col-span-7 space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  3. Cloudflare DNS & Real-Time WebSocket Proxy ({realRepos.length * 2} Routes for @{cleanUser})
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Cloudflare provides DNS CNAME routing, SSL/TLS 1.3 encryption, and edge firewall proxying for your connected GitHub projects.
                </p>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <div>
                    <span className="font-bold text-white">Active CNAME Routing Mapped to @{cleanUser}</span>
                    <div className="mt-1 space-y-1 text-[11px]">
                      <div>Frontend: <code className="text-cyan-300">@ ➔ {selectedVercelRepo?.name}-{cleanUser}.vercel.app</code></div>
                      <div>Backend API: <code className="text-purple-300">api ➔ {selectedRenderRepo?.name}-api.onrender.com</code></div>
                      <div>WebSocket Stream: <code className="text-amber-300">ws ➔ {selectedRenderRepo?.name}-api.onrender.com</code></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300 uppercase">Critical WebSockets Toggle:</span>
                    <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                      Keep the <strong>WebSockets Proxy Protocol switch ON</strong>. When active, Cloudflare allows full-duplex TCP/WSS packet flows directly to your Node.js Socket.io server without firewall throttling.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Interactive WebSocket Proxy Toggle & Ping Probe */}
            <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Cloudflare Proxy Mode</span>
                <span className="text-amber-400 font-bold text-[11px]">{cleanUser}.dev</span>
              </div>

              {/* WebSocket Toggle Control */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-xs block">WebSockets Proxy Protocol</span>
                  <span className="text-[10px] text-slate-400">
                    {cloudflareWsEnabled ? 'Allow full-duplex WS/WSS packets' : 'Disabled (WebSockets dropped by edge firewall)'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick(800, 0.05);
                    setCloudflareWsEnabled(!cloudflareWsEnabled);
                  }}
                  className={`p-1 rounded-lg transition-colors cursor-pointer ${
                    cloudflareWsEnabled ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                  title="Toggle Cloudflare WebSockets Switch"
                >
                  {cloudflareWsEnabled ? (
                    <ToggleRight className="w-8 h-8 fill-emerald-500/20" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>
              </div>

              {/* WebSocket Probe Tester */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Handshake Test:</span>
                  {wsTestStatus === 'testing' && <span className="text-cyan-400 animate-pulse">Connecting to wss://...</span>}
                  {wsTestStatus === 'connected' && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> WS Connected ({wsLatency}ms)
                    </span>
                  )}
                  {wsTestStatus === 'error' && (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Blocked (WS Switch OFF)
                    </span>
                  )}
                  {wsTestStatus === 'idle' && <span className="text-slate-500">Ready</span>}
                </div>

                <button
                  onClick={handleTestWebSocket}
                  disabled={wsTestStatus === 'testing'}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-amber-500/20 transition-colors cursor-pointer"
                >
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Test Real-Time WebSocket Handshake</span>
                </button>

                {/* WebSocket Frames Terminal */}
                {wsFramesLog.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-black/60 border border-slate-800 text-[10px] font-mono space-y-1 max-h-28 overflow-y-auto">
                    {wsFramesLog.map((frame, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className={frame.direction === 'TX' ? 'text-amber-400 font-bold' : 'text-cyan-400 font-bold'}>
                          [{frame.direction}]
                        </span>
                        <span className="text-slate-300 truncate">{frame.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Supabase Realtime DB */}
        {activePipelineTab === 'supabase' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in duration-150">
            <div className="lg:col-span-7 space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-400" />
                  4. Supabase Realtime DB: Connected to @{cleanUser} ({databaseRepos.length} Database Projects)
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  PostgreSQL database with built-in Change Data Capture (CDC) streaming live row inserts, updates, and deletes over WebSockets.
                </p>
              </div>

              {/* Repo Selector for Supabase */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Select Connected Database Repository:
                </label>
                <div className="flex gap-2 flex-wrap">
                  {databaseRepos.slice(0, 6).map((repo) => (
                    <button
                      key={repo.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick(600, 0.02);
                        setSelectedSupabaseRepoName(repo.name);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
                        selectedSupabaseRepo?.name === repo.name
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                          : 'bg-white/5 text-slate-400 border-white/5 hover:text-slate-200'
                      }`}
                    >
                      {repo.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <div>
                    <span className="font-bold text-white">Postgres Instance: <code className="text-emerald-300">db.{cleanUser}.supabase.co</code></span>
                    <p className="text-slate-400 text-[11px]">Database: <code className="text-emerald-300">postgres_v16</code> &middot; Schema: <code className="text-emerald-300">{selectedSupabaseRepo?.name}_db</code></p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <div>
                    <span className="font-bold text-white">Realtime Broadcast Channels</span>
                    <p className="text-slate-400 text-[11px]">Subscribed to: <code className="text-emerald-300">realtime:public:commits</code> & <code className="text-emerald-300">realtime:public:telemetry</code></p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-emerald-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Full-Duplex Sync:</strong> Client components subscribe directly using Supabase WebSockets channels without long-polling.
                </span>
              </div>
            </div>

            {/* Right Card: Live Supabase Status Box */}
            <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Supabase Realtime Stream</span>
                <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  CDC Streaming Active
                </span>
              </div>

              <div className="space-y-1.5 text-slate-300 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Database Host:</span>
                  <span className="text-emerald-400 font-mono">db.{cleanUser}.supabase.co</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Channels:</span>
                  <span className="text-white font-bold">{Math.max(3, databaseRepos.length + 1)} Realtime Channels</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Broadcast Events:</span>
                  <span className="text-cyan-400 font-bold">{supabaseBroadcastCount} events emitted</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Replication Latency:</span>
                  <span className="text-emerald-400 font-bold">3.8 ms</span>
                </div>
              </div>

              <button
                onClick={handleTriggerSupabaseBroadcast}
                disabled={supabaseBroadcastStatus === 'broadcasting'}
                className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-500/20 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {supabaseBroadcastStatus === 'broadcasting'
                    ? 'Broadcasting CDC Event...'
                    : supabaseBroadcastStatus === 'received'
                    ? '✅ Event Broadcast Received!'
                    : 'Simulate Realtime DB Row Broadcast'}
                </span>
              </button>

              {/* CDC Live Stream Window */}
              {cdcLogs.length > 0 && (
                <div className="p-2.5 rounded-xl bg-black/60 border border-slate-800 text-[10px] font-mono space-y-1 max-h-24 overflow-y-auto">
                  {cdcLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-300">
                      <span className="text-emerald-400 font-bold">[{log.event}] {log.table}</span>
                      <span className="text-slate-500">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: GitHub VCS & Webhooks */}
        {activePipelineTab === 'github' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in duration-150">
            <div className="lg:col-span-7 space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <GitBranch className="w-4 h-4 text-indigo-400" />
                  5. GitHub VCS & Webhook Dispatcher (@{cleanUser})
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Real-time webhook events from @{cleanUser}'s repositories trigger build pipelines, PR checks, and sprint activity telemetry.
                </p>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <div>
                    <span className="font-bold text-white">Webhook Endpoints Registered: <code className="text-indigo-300">{realRepos.length} Repositories</code></span>
                    <p className="text-slate-400 text-[11px]">Payload URL: <code className="text-indigo-300">https://api.devpulse.cloud/webhooks/github</code></p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <div>
                    <span className="font-bold text-white">Event Subscriptions Active</span>
                    <div className="flex gap-1.5 flex-wrap mt-1">
                      {['push', 'pull_request', 'workflow_run', 'issue_comment', 'release'].map((evt) => (
                        <span key={evt} className="px-2 py-0.5 rounded bg-slate-900 text-indigo-300 border border-indigo-500/30 text-[10px]">
                          {evt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-indigo-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  <strong>Instant Delivery:</strong> GitHub Webhooks deliver SHA256-signed HMAC payloads to Vercel and Render in ~12ms.
                </span>
              </div>
            </div>

            {/* Right Card: Live Webhook Status Box */}
            <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 uppercase text-[10px] font-bold">GitHub Webhook Dispatcher</span>
                <span className="text-indigo-400 flex items-center gap-1 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  {realRepos.length} Repos Active
                </span>
              </div>

              <div className="space-y-1.5 text-slate-300 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Account:</span>
                  <span className="text-indigo-300 font-bold">@{cleanUser}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Stars:</span>
                  <span className="text-amber-400 font-bold">{totalStarsCount} stars</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Forks:</span>
                  <span className="text-purple-400 font-bold">{totalForksCount} forks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery Status:</span>
                  <span className="text-emerald-400 font-bold">
                    {webhookDeliveryLatency ? `200 OK (${webhookDeliveryLatency}ms)` : '200 OK (100% Success)'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleTestWebhookDelivery}
                disabled={webhookTestStatus === 'testing'}
                className="w-full py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-500/20 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${webhookTestStatus === 'testing' ? 'animate-spin' : ''}`} />
                <span>
                  {webhookTestStatus === 'testing'
                    ? 'Delivering Webhook Event...'
                    : webhookTestStatus === 'success'
                    ? '✅ Webhook Delivered (200 OK)'
                    : 'Test Webhook Ping Delivery'}
                </span>
              </button>

              {/* Webhook Stream list */}
              <div className="p-2 rounded-xl bg-black/60 border border-slate-800 space-y-1 max-h-24 overflow-y-auto text-[10px]">
                {webhookEventsList.map((ev, i) => (
                  <div key={i} className="flex items-center justify-between text-slate-400">
                    <span className="text-indigo-400">{ev.event} &rarr; {ev.repo}</span>
                    <span className="text-emerald-400">{ev.status} OK</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Fleet Deployment Matrix for All User Repositories */}
        {activePipelineTab === 'matrix' && (
          <div className="space-y-3 font-mono text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-300 font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Repository-to-Cloud Deployment Fleet Matrix for @{cleanUser}
              </span>
              <span className="text-slate-400 text-[11px]">
                {realRepos.length} Total Repositories Mapped
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                    <th className="py-2 px-3">Repository</th>
                    <th className="py-2 px-3">Target Cloud Platform</th>
                    <th className="py-2 px-3">Branch</th>
                    <th className="py-2 px-3">Live Endpoint</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-[11px]">
                  {realRepos.slice(0, 8).map((repo) => {
                    const isFrontend = (repo.language === 'TypeScript' || repo.language === 'JavaScript' || repo.language === 'HTML');
                    const targetPlatform = isFrontend ? 'Vercel Edge' : 'Render Container';
                    const targetDomain = isFrontend 
                      ? `${repo.name}-${cleanUser}.vercel.app`
                      : `${repo.name}-api.onrender.com`;
                    const deployState = repoDeployStates[repo.name];

                    return (
                      <tr key={repo.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{repo.name}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            isFrontend 
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}>
                            {targetPlatform}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono">
                          {repo.default_branch || 'main'}
                        </td>
                        <td className="py-2.5 px-3">
                          <a
                            href={`https://${targetDomain}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 hover:underline truncate block max-w-[180px]"
                          >
                            {targetDomain}
                          </a>
                        </td>
                        <td className="py-2.5 px-3">
                          {deployState?.status === 'deploying' ? (
                            <span className="text-amber-400 flex items-center gap-1">
                              <RefreshCw className="w-3 h-3 animate-spin" /> Deploying
                            </span>
                          ) : (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Live
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleSimulateDeploy(targetPlatform, repo.name)}
                            className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono transition-colors cursor-pointer"
                          >
                            Deploy
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 3. Grid of Cloud Platforms (GitHub, Vercel, Render, Cloudflare, Supabase) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dynamicIntegrations.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3 flex flex-col justify-between hover:border-cyan-500/40 transition-all shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl border ${item.color}`}>
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white font-mono">{item.name}</h5>
                    <span className="text-[10px] text-slate-500 font-mono">{item.category}</span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {item.status}
                </span>
              </div>

              <div className="mt-3 p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Endpoint:</span>
                  <span className="text-cyan-300 truncate max-w-[150px]">{item.accountOrProject}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Latency:</span>
                  <span className="text-emerald-400 font-bold">{item.latencyMs} ms RTT</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Active Count:</span>
                  <span className="text-amber-300 font-bold">{item.activeDeployments} connected</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <span className="text-slate-300 truncate max-w-[140px]">{item.lastSync}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
              <button
                onClick={() => handlePingIntegration(item.id)}
                disabled={isPinging === item.id}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Send real ICMP Ping probe"
              >
                <Radio className={`w-3 h-3 text-cyan-400 ${isPinging === item.id ? 'animate-spin' : ''}`} />
                <span>{isPinging === item.id ? 'Pinging...' : 'Ping Probe'}</span>
              </button>

              <button
                onClick={() => handleSimulateDeploy(item.name)}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Trigger automated deployment"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Deploy</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Live GitHub Real Repositories & Language Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left 2 Cols: Live Repositories Matrix */}
        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white flex items-center gap-2">
                Live Repositories & Cloud Targets
                <span className="font-handjet text-lg text-cyan-400">[{realRepos.length} Repos]</span>
              </h4>
              <p className="text-[10px] font-mono text-slate-400">
                Synchronized directly from GitHub API for @{cleanUser}
              </p>
            </div>

            {/* Search filter inside repos */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter repositories..."
                value={selectedRepoFilter}
                onChange={(e) => setSelectedRepoFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {filteredRepos.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-xl text-slate-500 font-mono text-xs">
                No repositories found matching filter.
              </div>
            ) : (
              filteredRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 truncate">
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono font-bold text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <span>{repo.name}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      {repo.language && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                          {repo.language}
                        </span>
                      )}
                      {repo.private && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300">
                          Private
                        </span>
                      )}
                      {repo.homepage && (
                        <a
                          href={repo.homepage}
                          target="_blank"
                          rel="noreferrer"
                          className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:underline flex items-center gap-1"
                        >
                          <Globe className="w-2.5 h-2.5" />
                          <span>Live Demo</span>
                        </a>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 truncate max-w-lg">
                      {repo.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400 shrink-0">
                    <span className="flex items-center gap-1 text-amber-300 font-bold">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{repo.stargazers_count}</span>
                    </span>
                    <span className="flex items-center gap-1 text-purple-300 font-bold">
                      <GitFork className="w-3 h-3" />
                      <span>{repo.forks_count}</span>
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(repo.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Language Distribution & Live Commits */}
        <div className="space-y-4">
          {/* Language Breakdown */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3 shadow-lg">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white">
              Language Matrix
            </h4>
            <div className="space-y-2">
              {languageStats.slice(0, 5).map((lang) => (
                <div key={lang.name} className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.color }} />
                      {lang.name}
                    </span>
                    <span className="text-slate-400 font-bold">{lang.percentage}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Live Commits */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3 shadow-lg">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white">
              Latest Live Commits (@{cleanUser})
            </h4>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {realCommits.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono">No recent commits loaded.</p>
              ) : (
                realCommits.slice(0, 4).map((c) => (
                  <div key={c.sha} className="p-2 rounded-xl bg-white/5 border border-white/5 text-xs font-mono space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-cyan-400 font-bold">{c.sha.substring(0, 7)}</span>
                      <span className="text-[9px] text-slate-500">
                        {new Date(c.commit.author.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate">
                      {c.commit.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
