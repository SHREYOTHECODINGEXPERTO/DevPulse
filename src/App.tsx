import React, { useState, useEffect, useMemo } from 'react';
import { 
  Developer, 
  JiraIssue, 
  PullRequest, 
  PipelineRun, 
  ActivityEvent, 
  IssueStatus,
  GitHubRealRepo,
  GitHubRealCommit,
  CloudPlatformIntegration,
  ProjectTechStack
} from './types';
import { 
  CURRENT_DEV, 
  TEAM_MEMBERS, 
  INITIAL_JIRA_ISSUES, 
  INITIAL_PULL_REQUESTS, 
  INITIAL_PIPELINES, 
  INITIAL_ACTIVITY_FEED, 
  generateCommitHeatmap,
  generatePersonalizedIssues,
  generatePersonalizedPRs
} from './data/mockData';
import { Navbar, NavTab } from './components/Navbar';
import { ProfileSection } from './components/ProfileSection';
import { JiraKanbanBoard } from './components/JiraKanbanBoard';
import { GitHubPRReview } from './components/GitHubPRReview';
import { CommitHeatmap } from './components/CommitHeatmap';
import { CicdPipelineView } from './components/CicdPipelineView';
import { LiveActivityFeed } from './components/LiveActivityFeed';
import { CommandPalette } from './components/CommandPalette';
import { QuickCreateModal } from './components/QuickCreateModal';
import { CodingDoodles } from './components/CodingDoodles';
import { DeviceAnalyzerHud } from './components/DeviceAnalyzerHud';
import { IntegrationsHub } from './components/IntegrationsHub';
import { UserLoginModal } from './components/UserLoginModal';
import { SignInPortal } from './components/SignInPortal';
import { ProjectsTechStackView } from './components/ProjectsTechStackView';
import { AnnualVelocityView } from './components/AnnualVelocityView';
import { FocusModeOverlay } from './components/FocusModeOverlay';
import { AITaskGeneratorModal } from './components/AITaskGeneratorModal';
import { AIProductivityCoach } from './components/AIProductivityCoach';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { CreateProjectModal } from './components/CreateProjectModal';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { devPulseApi } from './utils/api';
import { useDeviceTelemetry } from './utils/deviceAnalyzer';
import { 
  buildProjectsFromGitHub, 
  fetchGitHubUser,
  fetchGitHubRepos,
  fetchGitHubUserEvents,
  fetchGitHubUserRepos,
  fetchGitHubUserPRs,
  fetchGitHubUserIssues,
  fetchGitHubUserContributions,
  calculateGitHubStreakAndVelocity,
  RealGitHubCalculatedMetrics,
  convertGitHubPRsToAppPRs,
  convertGitHubIssuesToJira,
  convertGitHubEventsToActivity,
  generateSynthesizedRepos
} from './utils/github';
import { soundFx } from './utils/audio';
import { triggerCodeCelebration } from './utils/celebration';
import { 
  Activity, 
  Trello, 
  GitPullRequest, 
  GitCommit, 
  PlayCircle, 
  ArrowRight, 
  Plus, 
  Sparkles,
  Zap,
  Target,
  Flame,
  CheckCircle2,
  Cpu,
  Layers,
  Globe,
  Radio,
  Boxes,
  TrendingUp
} from 'lucide-react';

const STORAGE_KEYS = {
  AUTH: 'devpulse_auth_session_active',
  USER: 'devpulse_user_v2',
  JIRA: 'devpulse_jira_v2',
  PRS: 'devpulse_prs_v2',
  FEED: 'devpulse_feed_v3',
  REPOS: 'devpulse_repos_v2',
};

export default function App() {
  // Session Authentication state: requires explicit login before revealing telemetry/data
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
    } catch (e) {
      return false;
    }
  });

  // Load saved user or default
  const [currentUser, setCurrentUser] = useState<Developer>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load user state', e);
    }
    return CURRENT_DEV;
  });

  const [teamMembers] = useState<Developer[]>(TEAM_MEMBERS);

  // Load saved issues or default
  const [jiraIssues, setJiraIssues] = useState<JiraIssue[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.JIRA);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load jira issues', e);
    }
    return INITIAL_JIRA_ISSUES;
  });

  // Load saved PRs or default
  const [pullRequests, setPullRequests] = useState<PullRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load PRs', e);
    }
    return INITIAL_PULL_REQUESTS;
  });

  const [pipelines, setPipelines] = useState<PipelineRun[]>(INITIAL_PIPELINES);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FEED);
      if (saved) {
        const parsed: ActivityEvent[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const seen = new Set<string>();
          return parsed.map((item, idx) => {
            let uniqueId = item.id || `act-${idx}`;
            if (seen.has(uniqueId)) {
              uniqueId = `act-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            }
            seen.add(uniqueId);
            return { ...item, id: uniqueId };
          });
        }
      }
    } catch (e) {
      console.warn('Failed to load feed', e);
    }
    return INITIAL_ACTIVITY_FEED;
  });

  const [realRepos, setRealRepos] = useState<GitHubRealRepo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REPOS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    const initialHandle = CURRENT_DEV.githubHandle || CURRENT_DEV.githubUsername || CURRENT_DEV.handle || 'shadcn';
    return generateSynthesizedRepos(initialHandle);
  });
  const [realCommits, setRealCommits] = useState<GitHubRealCommit[]>([]);
  const [activeIntegrations, setActiveIntegrations] = useState<CloudPlatformIntegration[]>([]);

  // Convert realRepos into structured ProjectTechStack models
  const projects = useMemo(() => {
    if (realRepos.length > 0) {
      return buildProjectsFromGitHub(realRepos);
    }
    const handle = currentUser.githubHandle || currentUser.githubUsername || currentUser.handle || 'shadcn';
    return buildProjectsFromGitHub(generateSynthesizedRepos(handle));
  }, [realRepos, currentUser]);

  // Auto-fetch real repos on mount or when connected GitHub profile changes
  useEffect(() => {
    const handle = currentUser.githubHandle || currentUser.githubUsername || currentUser.handle || 'shadcn';
    if (handle) {
      fetchGitHubUserRepos(handle, currentUser.githubToken)
        .then((repos) => {
          if (Array.isArray(repos) && repos.length > 0) {
            setRealRepos(repos);
            try {
              localStorage.setItem(STORAGE_KEYS.REPOS, JSON.stringify(repos));
            } catch (err) {
              console.warn(err);
            }
          }
        })
        .catch((err) => {
          console.warn('GitHub auto-fetch notice:', err);
        });
    }
  }, [currentUser.githubHandle, currentUser.githubUsername, currentUser.handle, currentUser.githubToken]);

  // Persist realRepos
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REPOS, JSON.stringify(realRepos));
    } catch (e) {
      console.warn(e);
    }
  }, [realRepos]);

  const [heatmapData, setHeatmapData] = useState(() => generateCommitHeatmap());
  const [gitHubMetrics, setGitHubMetrics] = useState<RealGitHubCalculatedMetrics | null>(null);

  // Real-time Device and Environment Telemetry
  const [isFocusSessionActive, setIsFocusSessionActive] = useState(false);
  const telemetry = useDeviceTelemetry(isFocusSessionActive, gitHubMetrics?.weeklyLoggedHours);

  // Computed total commits count from real contribution heatmap
  const totalCommitsCount = useMemo(() => {
    if (gitHubMetrics && gitHubMetrics.totalCommits > 0) {
      return gitHubMetrics.totalCommits;
    }
    if (heatmapData && heatmapData.length > 0) {
      const sum = heatmapData.reduce((acc, curr) => acc + (curr.count || 0), 0);
      if (sum > 0) return sum;
    }
    return realCommits.length > 0 ? realCommits.length : (currentUser.streakDays ? currentUser.streakDays * 3 : 0);
  }, [gitHubMetrics, heatmapData, realCommits, currentUser.streakDays]);

  // UI view states
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [gitHubError, setGitHubError] = useState<string | null>(null);

  // AI & Project/Task Detail Modals States
  const [aiTaskGenOpen, setAiTaskGenOpen] = useState(false);
  const [aiTaskGenProjectKey, setAiTaskGenProjectKey] = useState<string>('PULSE');
  const [aiCoachOpen, setAiCoachOpen] = useState(false);
  const [aiCopilotOpen, setAiCopilotOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectTechStack | null>(null);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState<ProjectTechStack | null>(null);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<JiraIssue | null>(null);

  // Persist State Changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } catch (e) {
      console.warn(e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.JIRA, JSON.stringify(jiraIssues));
    } catch (e) {
      console.warn(e);
    }
  }, [jiraIssues]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRS, JSON.stringify(pullRequests));
    } catch (e) {
      console.warn(e);
    }
  }, [pullRequests]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FEED, JSON.stringify(activityEvents));
    } catch (e) {
      console.warn(e);
    }
  }, [activityEvents]);

  // Sync Audio Setting
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.setEnabled(next);
    if (next) soundFx.playClick(800, 0.05);
  };

  const handleToggleFocusMode = () => {
    soundFx.playClick(600, 0.05);
    setFocusMode(!focusMode);
  };

  // Status & Presence Update
  const handleUpdateStatus = (newStatus: Developer['status']) => {
    setCurrentUser((prev) => {
      const updated = {
        ...prev,
        status: newStatus,
      };
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
    soundFx.playClick(650, 0.04);
    triggerCodeCelebration({ particleCount: 25, spread: 45, playSound: false });
  };

  // Designation / Role Update
  const handleUpdateRole = (newRole: string) => {
    if (!newRole.trim()) return;
    setCurrentUser((prev) => {
      const updated = {
        ...prev,
        role: newRole.trim(),
      };
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
    soundFx.playClick(700, 0.04);
    triggerCodeCelebration({ particleCount: 30, spread: 50, playSound: false });
  };

  // Team / Squad Update
  const handleUpdateTeam = (newTeam: string) => {
    if (!newTeam.trim()) return;
    setCurrentUser((prev) => {
      const updated = {
        ...prev,
        team: newTeam.trim(),
      };
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
    soundFx.playClick(700, 0.04);
    triggerCodeCelebration({ particleCount: 30, spread: 50, playSound: false });
  };

  // Central Real-time GitHub Full Synchronization
  const handleSyncGitHubUser = async (
    username: string, 
    token?: string,
    userOverrides?: Partial<Developer>
  ) => {
    const cleanUser = username.trim().replace(/^@/, '');
    if (!cleanUser) return;

    setIsGitHubLoading(true);
    setGitHubError(null);
    setIsSyncing(true);
    soundFx.playClick(600, 0.04);

    try {
      // 1. Fetch user profile
      const userProfile = await fetchGitHubUser(cleanUser, token);

      // 2. Fetch repos, events, PRs, issues in parallel
      const [fetchedRepos, fetchedEvents, fetchedPRs, fetchedIssues] = await Promise.all([
        fetchGitHubRepos(cleanUser, token),
        fetchGitHubUserEvents(cleanUser, token),
        fetchGitHubUserPRs(cleanUser, token),
        fetchGitHubUserIssues(cleanUser, token),
      ]);

      // 3. Convert PRs and Issues early for metric calculations
      const candidateUser: Developer = {
        ...currentUser,
        ...(userOverrides || {}),
        name: userOverrides?.name || currentUser.name || userProfile.name || userProfile.login,
        handle: userOverrides?.handle || currentUser.handle || userProfile.login,
        avatar: userOverrides?.avatar || currentUser.avatar || userProfile.avatar_url || `https://github.com/${cleanUser}.png`,
        bio: userOverrides?.bio || currentUser.bio || userProfile.bio || 'Open-source software developer & systems architect.',
        role: userOverrides?.role || currentUser.role || 'Full-Stack Software Engineer',
        team: userOverrides?.team || currentUser.team || (userProfile.company ? userProfile.company.replace(/^@/, '') : 'Verified Contributor Team'),
        status: userOverrides?.status || currentUser.status || 'In the Zone',
        githubUsername: cleanUser,
        githubHandle: cleanUser,
        githubToken: token || currentUser.githubToken,
      };

      const appPRs = fetchedPRs && fetchedPRs.length > 0
        ? convertGitHubPRsToAppPRs(fetchedPRs, candidateUser, fetchedRepos)
        : [];

      // 4. Fetch comprehensive contribution calendar & compute real-time streak and velocity
      const contributionHeatmap = await fetchGitHubUserContributions(cleanUser, token, fetchedEvents);
      const metrics = calculateGitHubStreakAndVelocity(contributionHeatmap, appPRs, fetchedRepos, userProfile);
      setGitHubMetrics(metrics);
      if (contributionHeatmap && contributionHeatmap.length > 0) {
        setHeatmapData(contributionHeatmap);
      }

      // 5. Update current user with real profile & real calculated metrics while strictly preserving user-configured fields
      const updatedUser: Developer = {
        ...candidateUser,
        // Preserve user's role if defined, fallback to metrics if role was generic
        role: candidateUser.role && candidateUser.role !== 'Developer' ? candidateUser.role : (metrics.profileDesignation || candidateUser.role),
        team: candidateUser.team || 'Engineering Squad',
        status: candidateUser.status || 'In the Zone',
        avatar: candidateUser.avatar || userProfile.avatar_url || `https://github.com/${cleanUser}.png`,
        bio: candidateUser.bio || userProfile.bio || `Full-stack engineer contributing across ${fetchedRepos.length || 1} open-source repositories.`,
        streakDays: metrics.currentStreak,
        velocityScore: metrics.velocityScore,
        totalCommitsToday: metrics.commitsToday,
        prMergeRate: metrics.prMergeRate,
        skills: metrics.skillProficiencies && metrics.skillProficiencies.length > 0
          ? metrics.skillProficiencies.map((s) => s.name)
          : candidateUser.skills,
        skillProficiencies: metrics.skillProficiencies,
        peakCodingWindow: metrics.peakCodingWindow,
      };
      setCurrentUser(updatedUser);

      // 5. Update real repos directly from connected GitHub account
      if (Array.isArray(fetchedRepos)) {
        setRealRepos(fetchedRepos);
        try {
          localStorage.setItem(STORAGE_KEYS.REPOS, JSON.stringify(fetchedRepos));
        } catch (e) {
          console.warn(e);
        }
      }

      // 6. Update PRs
      if (appPRs.length > 0) {
        setPullRequests(appPRs);
      } else if (fetchedRepos && fetchedRepos.length > 0) {
        const fallbackPRs = fetchedRepos.slice(0, 5).map((r, i) => ({
          id: `pr-${r.id}-${i}`,
          number: 10 + i,
          title: `Enhance CI/CD pipeline and automated tests for ${r.name}`,
          repo: r.full_name,
          branch: `feature/core-${r.name}`,
          baseBranch: r.default_branch || 'main',
          author: updatedUser,
          reviewers: [],
          status: 'open' as const,
          checks: { passed: 8, total: 8, status: 'success' as const },
          additions: 140 + i * 20,
          deletions: 25,
          changedFiles: 4,
          commentsCount: 2,
          jiraKey: `GH-${10 + i}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          diffSnippets: [{ file: `src/${r.name}.ts`, additions: 45, deletions: 10, diff: `+// Live PR synced from ${r.name}` }],
        }));
        setPullRequests(fallbackPRs);
      }

      // 7. Update Jira issues
      if (fetchedIssues && fetchedIssues.length > 0) {
        const appIssues = convertGitHubIssuesToJira(fetchedIssues, updatedUser, fetchedRepos);
        setJiraIssues(appIssues);
      } else if (fetchedRepos && fetchedRepos.length > 0) {
        const sampleIssues: JiraIssue[] = fetchedRepos.slice(0, 6).map((r, idx) => ({
          id: `jira-repo-${r.id}`,
          key: `REPO-${r.id.toString().slice(-3)}`,
          title: `Active sprint feature delivery for ${r.name} (${r.language || 'Code'})`,
          type: (['Story', 'Task', 'Refactor', 'Bug'][idx % 4]) as JiraIssue['type'],
          status: (['In Progress', 'Todo', 'In Review', 'Done'][idx % 4]) as JiraIssue['status'],
          priority: (['High', 'Medium', 'Critical', 'Low'][idx % 4]) as JiraIssue['priority'],
          storyPoints: [3, 5, 8, 2][idx % 4],
          assignee: updatedUser,
          reporter: updatedUser,
          sprint: 'Sprint 24 - Live GitHub',
          epic: r.full_name,
          epicColor: '#06b6d4',
          timeSpentHours: 4,
          estimatedHours: 12,
          tags: [r.language || 'TypeScript', 'GitHub'],
          repo: r.full_name,
          createdAt: new Date().toISOString(),
          dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
          description: r.description || `Active development and issue resolution on GitHub repository ${r.full_name}.`,
        }));
        setJiraIssues(sampleIssues);
      }

      // 8. Update Activity feed with real events & rich actionable links
      if (fetchedEvents && fetchedEvents.length > 0) {
        const actEvents = convertGitHubEventsToActivity(fetchedEvents, updatedUser);
        setActivityEvents(actEvents);
      }

      soundFx.playRetroPowerUp();
    } catch (err: any) {
      console.error('GitHub Sync Error:', err);
      setGitHubError(err.message || 'Failed to sync with GitHub');
    } finally {
      setIsGitHubLoading(false);
      setIsSyncing(false);
    }
  };

  // Helper for guaranteed unique event and item keys
  const generateUniqueId = (prefix = 'act') => 
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  // Auto-sync GitHub data on initial application mount ONLY if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const handle = currentUser.githubHandle || currentUser.handle || 'shadcn';
    handleSyncGitHubUser(handle, currentUser.githubToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Handle Sign In from SignInPortal
  const handleSignIn = async (user: Developer, token?: string) => {
    setCurrentUser(user);
    setIsAuthenticated(true);

    // Initialize clean personalized Jira issues, PRs, and repos explicitly belonging to this real user
    const personalizedIssues = generatePersonalizedIssues(user);
    const personalizedPRs = generatePersonalizedPRs(user);
    const personalizedRepos = generateSynthesizedRepos(user.githubHandle || user.handle || 'developer');

    setJiraIssues(personalizedIssues);
    setPullRequests(personalizedPRs);
    setRealRepos(personalizedRepos);

    try {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.JIRA, JSON.stringify(personalizedIssues));
      localStorage.setItem(STORAGE_KEYS.PRS, JSON.stringify(personalizedPRs));
      localStorage.setItem(STORAGE_KEYS.REPOS, JSON.stringify(personalizedRepos));
    } catch (e) {
      console.warn('Failed to persist auth session', e);
    }

    const loginEvt: ActivityEvent = {
      id: generateUniqueId('act-auth'),
      timestamp: 'Just now',
      type: 'pr_review',
      title: `@${user.handle} authenticated session`,
      description: `Logged in as ${user.name} (${user.role}). Real-time telemetry feed streaming.`,
      source: 'system',
      user: user,
    };
    setActivityEvents((prev) => [loginEvt, ...prev.slice(0, 15)]);

    const ghHandle = user.githubHandle || user.githubUsername || user.handle;
    if (ghHandle) {
      await handleSyncGitHubUser(ghHandle, token || user.githubToken, user);
    }
  };

  // Handle Sign Out - completely clears session and data keys for fresh next login
  const handleSignOut = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.JIRA);
      localStorage.removeItem(STORAGE_KEYS.PRS);
      localStorage.removeItem(STORAGE_KEYS.FEED);
      localStorage.removeItem(STORAGE_KEYS.REPOS);
    } catch (e) {
      console.warn('Failed to clear auth session', e);
    }
    soundFx.playClick(400, 0.05);
  };

  // Save new user profile from UserLoginModal
  const handleSaveUserProfile = async (updatedUser: Developer) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    } catch (e) {
      console.warn(e);
    }
    triggerCodeCelebration({ particleCount: 55, spread: 75 });

    const loginEvt: ActivityEvent = {
      id: generateUniqueId('act-profile-update'),
      timestamp: 'Just now',
      type: 'pr_review',
      title: `@${updatedUser.handle} updated profile`,
      description: `Role: "${updatedUser.role}" &middot; Squad: "${updatedUser.team}" &middot; Status: "${updatedUser.status}"`,
      source: 'system',
      user: updatedUser,
    };
    setActivityEvents((prev) => [loginEvt, ...prev.slice(0, 15)]);

    const ghUser = updatedUser.githubHandle || updatedUser.handle;
    if (ghUser) {
      handleSyncGitHubUser(ghUser, updatedUser.githubToken, updatedUser);
    }
  };

  // Jira Issue Status Update Handler
  const handleUpdateIssueStatus = (issueId: string, newStatus: IssueStatus) => {
    const targetIssue = jiraIssues.find((i) => i.id === issueId);
    if (!targetIssue) return;

    setJiraIssues((prev) =>
      prev.map((issue) => (issue.id === issueId ? { ...issue, status: newStatus } : issue))
    );

    const newEvent: ActivityEvent = {
      id: generateUniqueId('act-jira'),
      timestamp: 'Just now',
      type: 'jira_status',
      title: `${targetIssue.key} status moved to ${newStatus}`,
      description: `Issue "${targetIssue.title}" transitioned to ${newStatus} phase.`,
      source: 'jira',
      linkKey: targetIssue.key,
      user: currentUser,
    };
    setActivityEvents((e) => [newEvent, ...e.slice(0, 15)]);
  };

  // GitHub PR Merge Handler
  const handleMergePR = (prId: string) => {
    const targetPR = pullRequests.find((p) => p.id === prId);
    if (!targetPR) return;

    if (targetPR.jiraKey) {
      setJiraIssues((jIssues) =>
        jIssues.map((j) => (j.key === targetPR.jiraKey ? { ...j, status: 'Done' } : j))
      );
    }

    setPullRequests((prev) =>
      prev.map((pr) => (pr.id === prId ? { ...pr, status: 'merged' } : pr))
    );

    const newEvent: ActivityEvent = {
      id: generateUniqueId('act-merge'),
      timestamp: 'Just now',
      type: 'pr_merge',
      title: `PR #${targetPR.number} merged into main`,
      description: `Merged "${targetPR.title}" into ${targetPR.repo}/main. Linked Jira: ${targetPR.jiraKey || 'None'}.`,
      source: 'github',
      linkKey: `PR #${targetPR.number}`,
      user: currentUser,
    };
    setActivityEvents((e) => [newEvent, ...e.slice(0, 15)]);
  };

  // GitHub PR Approve Handler
  const handleApprovePR = (prId: string) => {
    const targetPR = pullRequests.find((p) => p.id === prId);
    if (!targetPR) return;

    setPullRequests((prev) =>
      prev.map((pr) => (pr.id === prId ? { ...pr, reviewStatus: 'Approved' } : pr))
    );

    const newEvent: ActivityEvent = {
      id: generateUniqueId('act-approve'),
      timestamp: 'Just now',
      type: 'pr_review',
      title: `PR #${targetPR.number} approved by @${currentUser.handle}`,
      description: `Code review accepted and signed off for ${targetPR.title}.`,
      source: 'github',
      linkKey: `PR #${targetPR.number}`,
      user: currentUser,
    };
    setActivityEvents((e) => [newEvent, ...e.slice(0, 15)]);
  };

  // CI/CD Re-run Handler
  const handleTriggerPipeline = (pipeId: string) => {
    const targetPipe = pipelines.find((p) => p.id === pipeId);
    if (!targetPipe) return;

    setPipelines((prev) =>
      prev.map((p) => (p.id === pipeId ? { ...p, status: 'running', startedAt: 'Just now' } : p))
    );

    const newEvent: ActivityEvent = {
      id: generateUniqueId('act-pipe'),
      timestamp: 'Just now',
      type: 'deploy_success',
      title: `Re-triggered workflow on ${targetPipe.service}`,
      description: `Automated test runner started for commit ${targetPipe.commitHash}.`,
      source: 'ci',
      linkKey: targetPipe.service,
      user: currentUser,
    };
    setActivityEvents((e) => [newEvent, ...e.slice(0, 15)]);

    setTimeout(() => {
      setPipelines((prev) =>
        prev.map((p) => (p.id === pipeId ? { ...p, status: 'success', duration: '1m 18s' } : p))
      );
    }, 3200);
  };

  // Manual Sync Trigger
  const handleManualSync = () => {
    soundFx.playClick(600, 0.05);
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      soundFx.playSuccess();
      const syncEvt: ActivityEvent = {
        id: generateUniqueId('act-sync'),
        timestamp: 'Just now',
        type: 'jira_status',
        title: 'Webhook synchronization complete',
        description: 'Updated repositories, Jira board & device telemetry data.',
        source: 'system',
        user: currentUser,
      };
      setActivityEvents((e) => [syncEvt, ...e.slice(0, 15)]);
    }, 1200);
  };

  // Simulate incoming webhook event
  const handleSimulateEvent = () => {
    const randomEvents: Omit<ActivityEvent, 'id' | 'timestamp'>[] = [
      {
        type: 'commit_push',
        title: 'Pushed 3 commits to devpulse/gateway-proxy',
        description: 'feat(proxy): eBPF socket filter for low-latency rate limiting.',
        source: 'github',
        linkKey: '8b9c2a',
        user: teamMembers[1],
      },
      {
        type: 'pr_open',
        title: 'New PR #422 opened by @mchen_cloud',
        description: 'refactor(ui): WebAssembly canvas viewport optimizer.',
        source: 'github',
        linkKey: 'PR #422',
        user: teamMembers[2],
      },
      {
        type: 'jira_status',
        title: 'DEV-1038 transitioned to In Progress',
        description: 'Assigned to @saradev_ops: Prometheus alerting threshold tuning.',
        source: 'jira',
        linkKey: 'DEV-1038',
        user: teamMembers[3],
      },
    ];

    const pick = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    const newEvent: ActivityEvent = {
      ...pick,
      id: generateUniqueId('act-sim'),
      timestamp: 'Just now',
    };
    setActivityEvents((prev) => [newEvent, ...prev.slice(0, 15)]);
  };

  // Create Jira Issue
  const handleCreateJiraIssue = (issueData: Partial<JiraIssue>) => {
    const newKey = `DEV-${1050 + jiraIssues.length}`;
    const newIssue: JiraIssue = {
      id: generateUniqueId('jira'),
      key: newKey,
      title: issueData.title || 'New Sprint Issue',
      type: issueData.type || 'Story',
      status: issueData.status || 'Todo',
      priority: issueData.priority || 'Medium',
      storyPoints: issueData.storyPoints || 5,
      assignee: issueData.assignee || currentUser,
      reporter: currentUser,
      sprint: issueData.sprint || 'Sprint 34: Apex Velocity',
      epic: 'Core Platform',
      epicColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      timeSpentHours: 0,
      estimatedHours: 8,
      tags: issueData.tags || ['platform'],
      createdAt: new Date().toISOString().split('T')[0],
      dueDate: '2026-08-30',
      description: issueData.description || '',
    };

    setJiraIssues((prev) => [newIssue, ...prev]);

    const newEvt: ActivityEvent = {
      id: generateUniqueId('act-create-jira'),
      timestamp: 'Just now',
      type: 'jira_create',
      title: `Created Jira issue ${newKey}`,
      description: `${newIssue.title} (${newIssue.storyPoints} pts) added to Sprint 34.`,
      source: 'jira',
      linkKey: newKey,
      user: currentUser,
    };
    setActivityEvents((prev) => [newEvt, ...prev]);
  };

  // Create PR
  const handleCreatePR = (prData: Partial<PullRequest>) => {
    const nextNumber = 420 + pullRequests.length;
    const newPR: PullRequest = {
      id: generateUniqueId(`pr-${nextNumber}`),
      number: nextNumber,
      title: prData.title || 'New Pull Request',
      repo: prData.repo || 'devpulse/telemetry-core',
      branch: prData.branch || `feat/patch-${nextNumber}`,
      baseBranch: 'main',
      author: currentUser,
      reviewers: [teamMembers[1]],
      status: 'open',
      checks: { passed: 8, total: 8, status: 'success' },
      additions: prData.additions || 140,
      deletions: prData.deletions || 18,
      changedFiles: prData.changedFiles || 3,
      commentsCount: 0,
      jiraKey: prData.jiraKey,
      createdAt: new Date().toISOString(),
      updatedAt: 'Just now',
      diffSnippets: [
        {
          file: 'src/main.ts',
          additions: 45,
          deletions: 5,
          diff: `@@ -1,5 +1,12 @@
+export function initializePulse() {
+  console.log("DevPulse core initialized");
+}`,
        },
      ],
    };

    setPullRequests((prev) => [newPR, ...prev]);

    const newEvt: ActivityEvent = {
      id: generateUniqueId('act-pr'),
      timestamp: 'Just now',
      type: 'pr_open',
      title: `Opened Pull Request #${nextNumber}`,
      description: `${newPR.title} in ${newPR.repo}`,
      source: 'github',
      linkKey: `PR #${nextNumber}`,
      user: currentUser,
    };
    setActivityEvents((prev) => [newEvt, ...prev]);
  };

  // Handle Tasks Imported From AI Generator
  const handleTasksImportedFromAI = (newTasks: any[]) => {
    if (!Array.isArray(newTasks) || newTasks.length === 0) return;
    setJiraIssues((prev) => [...newTasks, ...prev]);

    const newEvt: ActivityEvent = {
      id: generateUniqueId('act-ai-tasks'),
      timestamp: 'Just now',
      type: 'jira_create',
      title: `⚡ AI Generated ${newTasks.length} Jira Tasks`,
      description: `Imported ${newTasks.length} AI-assisted tasks into Kanban sprint board.`,
      source: 'jira',
      user: currentUser,
    };
    setActivityEvents((prev) => [newEvt, ...prev]);
  };

  // Handle Project Workspace Saved (Create / Edit)
  const handleProjectSaved = (savedProject: ProjectTechStack) => {
    const exists = realRepos.some((r) => r.name === savedProject.repoName || String(r.id) === savedProject.id);

    if (exists) {
      setRealRepos((prev) =>
        prev.map((r) =>
          r.name === savedProject.repoName || String(r.id) === savedProject.id
            ? {
                ...r,
                name: savedProject.repoName,
                description: savedProject.description,
                language: savedProject.primaryLanguage,
                html_url: savedProject.htmlUrl,
              }
            : r
        )
      );
    } else {
      const newRepo: GitHubRealRepo = {
        id: Date.now(),
        name: savedProject.repoName,
        full_name: savedProject.fullName,
        html_url: savedProject.htmlUrl,
        description: savedProject.description,
        stargazers_count: savedProject.stars || 0,
        forks_count: savedProject.forks || 0,
        language: savedProject.primaryLanguage,
        updated_at: new Date().toISOString(),
        open_issues_count: savedProject.openIssues || 0,
        default_branch: savedProject.defaultBranch || 'main',
        private: false,
      };
      setRealRepos((prev) => [newRepo, ...prev]);
    }

    const newEvt: ActivityEvent = {
      id: generateUniqueId('act-proj'),
      timestamp: 'Just now',
      type: 'jira_create',
      title: exists ? `Updated project "${savedProject.repoName}"` : `Created project "${savedProject.repoName}"`,
      description: `Project workspace ${savedProject.repoName} (${savedProject.primaryLanguage}) configured.`,
      source: 'system',
      user: currentUser,
    };
    setActivityEvents((prev) => [newEvt, ...prev]);
  };

  // Handle Project Cascade Deletion
  const handleDeleteProject = (projectId: string) => {
    const targetProject = projects.find((p) => p.id === projectId || p.repoName === projectId);
    const repoName = targetProject?.repoName || projectId;

    // 1. Remove from repos
    setRealRepos((prev) => prev.filter((r) => r.name !== repoName && String(r.id) !== projectId));

    // 2. Cascade delete all child tasks belonging to this project
    setJiraIssues((prev) =>
      prev.filter((issue) => {
        const matchKey = issue.key.startsWith(projectId.toUpperCase().slice(0, 4));
        const matchRepo = issue.repo && issue.repo.includes(repoName);
        const matchTag = issue.tags.some((t) => t.toLowerCase() === repoName.toLowerCase());
        return !(matchKey || matchRepo || matchTag);
      })
    );

    const deleteEvt: ActivityEvent = {
      id: generateUniqueId('act-del-proj'),
      timestamp: 'Just now',
      type: 'jira_status',
      title: `Deleted project "${repoName}"`,
      description: `Project and associated child sprint tasks cascade deleted.`,
      source: 'system',
      user: currentUser,
    };
    setActivityEvents((prev) => [deleteEvt, ...prev]);
  };

  // Handle Save Task Detail
  const handleSaveTaskDetail = (updated: JiraIssue) => {
    setJiraIssues((prev) => prev.map((issue) => (issue.id === updated.id ? updated : issue)));

    const updateEvt: ActivityEvent = {
      id: generateUniqueId('act-update-task'),
      timestamp: 'Just now',
      type: 'jira_status',
      title: `Updated task ${updated.key}: ${updated.title}`,
      description: `Status: [${updated.status}] &middot; Priority: [${updated.priority}] &middot; Assignee: @${updated.assignee.handle}`,
      source: 'jira',
      linkKey: updated.key,
      user: currentUser,
    };
    setActivityEvents((prev) => [updateEvt, ...prev]);
  };

  // Handle Delete Task
  const handleDeleteTask = (issueId: string) => {
    const target = jiraIssues.find((i) => i.id === issueId);
    setJiraIssues((prev) => prev.filter((issue) => issue.id !== issueId));

    if (target) {
      const deleteEvt: ActivityEvent = {
        id: generateUniqueId('act-del-task'),
        timestamp: 'Just now',
        type: 'jira_status',
        title: `Deleted task ${target.key}`,
        description: `Removed "${target.title}" from sprint board.`,
        source: 'jira',
        linkKey: target.key,
        user: currentUser,
      };
      setActivityEvents((prev) => [deleteEvt, ...prev]);
    }
  };

  const openJiraCount = jiraIssues.filter((i) => i.status !== 'Done').length;
  const openPRCount = pullRequests.filter((p) => p.status === 'open').length;

  // STRICT AUTH GATE: If user is not authenticated, DO NOT showcase any dashboard data
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 relative font-sans-ui flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
        <SignInPortal onSignInSuccess={handleSignIn} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 relative font-sans-ui flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      
      {/* Interactive Gaming Doodles: Pixel Game Console, Pac-Man Chomping <div>s, and 8-bit Space Invaders */}
      <CodingDoodles />

      {/* Main Top Navigation Wayfinding */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenQuickCreate={() => setQuickCreateOpen(true)}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        onSignOut={handleSignOut}
        isSyncing={isSyncing}
        onManualSync={handleManualSync}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        focusMode={focusMode}
        onToggleFocusMode={handleToggleFocusMode}
        openJiraCount={openJiraCount}
        openPRCount={openPRCount}
        projectsCount={projects.length}
        onOpenAICopilot={() => setAiCopilotOpen(true)}
        onOpenTaskGenerator={() => {
          setAiTaskGenProjectKey('PULSE');
          setAiTaskGenOpen(true);
        }}
        onOpenProductivityCoach={() => setAiCoachOpen(true)}
      />

      {/* Main Responsive Body Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 z-10 space-y-6">
        
        {/* Real-time Hardware & Device Telemetry HUD */}
        <DeviceAnalyzerHud 
          telemetry={telemetry} 
          activeReposCount={projects.length}
          totalCommits={1482 + realCommits.length}
        />

        {/* Profile & Flow State Hero */}
        <ProfileSection
          developer={currentUser}
          onUpdateStatus={handleUpdateStatus}
          onUpdateRole={handleUpdateRole}
          onUpdateTeam={handleUpdateTeam}
          jiraIssues={jiraIssues}
          pullRequests={pullRequests}
          onOpenLoginModal={() => setLoginModalOpen(true)}
          onFocusTimerChange={(active) => setIsFocusSessionActive(active)}
        />

        {/* Tab 1: Overview // Pulse Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Quick Metrics Bento Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              
              {/* 1. Jira Sprint Load */}
              <div 
                onClick={() => setActiveTab('jira')}
                className="glass-panel-interactive rounded-2xl p-4 border border-slate-800 cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trello className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-mono text-slate-300 font-bold uppercase">Sprint Backlog</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300">
                    JIRA
                  </span>
                </div>
                <div className="my-2">
                  <span className="font-handjet text-4xl font-extrabold text-blue-300">
                    {openJiraCount} OPEN
                  </span>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {jiraIssues.filter((i) => i.status === 'In Progress').length} in active flight
                  </p>
                </div>
                <div className="text-[11px] font-mono text-blue-400 flex items-center gap-1 group-hover:underline">
                  <span>View Jira Kanban</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              {/* 2. GitHub PR Queue */}
              <div 
                onClick={() => setActiveTab('prs')}
                className="glass-panel-interactive rounded-2xl p-4 border border-slate-800 cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitPullRequest className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono text-slate-300 font-bold uppercase">Pull Requests</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                    GITHUB
                  </span>
                </div>
                <div className="my-2">
                  <span className="font-handjet text-4xl font-extrabold text-emerald-300">
                    {openPRCount} OPEN
                  </span>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    Avg turnaround SLA: 4.2h
                  </p>
                </div>
                <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 group-hover:underline">
                  <span>Inspect PR diffs</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              {/* 3. Live Cloud Integrations & Active Repos */}
              <div 
                onClick={() => setActiveTab('projects')}
                className="glass-panel-interactive rounded-2xl p-4 border border-slate-800 cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-mono text-slate-300 font-bold uppercase">Projects & Stacks</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300">
                    {projects.length} REPOS
                  </span>
                </div>
                <div className="my-2">
                  <span className="font-handjet text-4xl font-extrabold text-purple-300">
                    {projects.length} PROJECTS
                  </span>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    Multi-stack architecture matrix
                  </p>
                </div>
                <div className="text-[11px] font-mono text-purple-400 flex items-center gap-1 group-hover:underline">
                  <span>View repo tech stacks</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              {/* 4. Total Commits & Annual Velocity */}
              <div 
                onClick={() => setActiveTab('velocity')}
                className="glass-panel-interactive rounded-2xl p-4 border border-slate-800 cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-mono text-slate-300 font-bold uppercase">Annual Velocity</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300">
                    {(currentUser.velocityScore ?? 92.4).toFixed(1)} SCORE
                  </span>
                </div>
                <div className="my-2">
                  <span className="font-handjet text-4xl font-extrabold text-amber-300">
                    {totalCommitsCount} COMMITS
                  </span>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {currentUser.streakDays ?? 0}-day continuous streak
                  </p>
                </div>
                <div className="text-[11px] font-mono text-amber-400 flex items-center gap-1 group-hover:underline">
                  <span>Explore velocity cadence</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

            </div>

            {/* Split Section: In-Flight Tasks & Active PRs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Left: Active In-Flight Jira Tasks */}
              <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Trello className="w-4 h-4 text-blue-400" />
                      <h4 className="text-xs font-mono uppercase font-bold text-slate-200">
                        In-Flight Sprint Tasks
                      </h4>
                    </div>
                    <button
                      onClick={() => setActiveTab('jira')}
                      className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>Full Board</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {jiraIssues
                      .filter((i) => i.status === 'In Progress' || i.status === 'In Review')
                      .slice(0, 3)
                      .map((issue) => (
                        <div
                          key={issue.id}
                          className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between gap-3"
                        >
                          <div className="space-y-1 truncate">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-cyan-400">{issue.key}</span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                                {issue.status}
                              </span>
                              <span className="font-handjet text-sm text-purple-300 font-bold">{issue.storyPoints} pts</span>
                            </div>
                            <h5 className="text-xs font-medium text-slate-200 truncate">{issue.title}</h5>
                          </div>

                          <button
                            onClick={() => handleUpdateIssueStatus(issue.id, 'Done')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono whitespace-nowrap transition-colors"
                            title="Complete Issue"
                          >
                            Mark Done
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Assigned to Sprint 34: Apex Velocity</span>
                  <button
                    onClick={() => setQuickCreateOpen(true)}
                    className="text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>

              {/* Right: Active Pull Requests Review Queue */}
              <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <GitPullRequest className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-mono uppercase font-bold text-slate-200">
                        PR Review Queue & Merges
                      </h4>
                    </div>
                    <button
                      onClick={() => setActiveTab('prs')}
                      className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>All PRs</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {pullRequests
                      .filter((p) => p.status === 'open')
                      .slice(0, 3)
                      .map((pr) => (
                        <div
                          key={pr.id}
                          className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-colors flex items-center justify-between gap-3"
                        >
                          <div className="space-y-1 truncate">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-emerald-400">PR #{pr.number}</span>
                              <span className="text-[10px] font-mono text-slate-400 truncate">{pr.repo}</span>
                              <span className="font-handjet text-sm text-emerald-300 font-bold">+{pr.additions} -{pr.deletions}</span>
                            </div>
                            <h5 className="text-xs font-medium text-slate-200 truncate">{pr.title}</h5>
                          </div>

                          <button
                            onClick={() => handleMergePR(pr.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] font-mono whitespace-nowrap shadow-sm shadow-emerald-500/20"
                          >
                            Merge
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Continuous integration gate passing</span>
                  <button
                    onClick={() => setActiveTab('prs')}
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Inspect Diffs</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Row: Commit Matrix Heatmap Preview + Live Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <CommitHeatmap 
                  heatmapData={heatmapData} 
                  totalCommits={totalCommitsCount} 
                  currentUser={currentUser}
                  commitsToday={currentUser.totalCommitsToday}
                  activeRepos={realRepos}
                />
              </div>
              <div className="lg:col-span-1">
                <LiveActivityFeed
                  events={activityEvents}
                  onSimulateEvent={handleSimulateEvent}
                  onSelectAction={(action) => {
                    if (action.type === 'pr') {
                      setActiveTab('prs');
                    } else if (action.type === 'jira') {
                      setActiveTab('jira');
                    } else if (action.type === 'repo') {
                      setActiveTab('projects');
                    } else if (action.type === 'github_url' && action.url) {
                      window.open(action.url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  onSelectKey={(key) => {
                    if (key.startsWith('PR') || key.startsWith('#')) setActiveTab('prs');
                    else if (key.startsWith('DEV') || key.startsWith('TASK') || key.startsWith('REPO')) setActiveTab('jira');
                    else if (key.includes('/')) setActiveTab('projects');
                  }}
                />
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Projects & Tech Stack Matrix */}
        {activeTab === 'projects' && (
          <div className="animate-in fade-in duration-200">
            <ProjectsTechStackView
              projects={projects}
              realRepos={realRepos}
              currentUser={currentUser}
              onCreateTaskForRepo={(repoName) => {
                setQuickCreateOpen(true);
              }}
              onOpenGitHubSync={() => setActiveTab('integrations')}
              onSyncGitHubUser={(username) => handleSyncGitHubUser(username, currentUser.githubToken)}
              isGitHubLoading={isGitHubLoading}
              onOpenCreateProject={() => {
                setEditingProject(null);
                setCreateProjectOpen(true);
              }}
              onSelectProject={(project) => {
                setSelectedProjectDetail(project);
              }}
            />
          </div>
        )}

        {/* Tab 3: Jira Sprint Board */}
        {activeTab === 'jira' && (
          <div className="animate-in fade-in duration-200">
            <JiraKanbanBoard
              issues={jiraIssues}
              onUpdateIssueStatus={handleUpdateIssueStatus}
              onOpenQuickCreate={() => setQuickCreateOpen(true)}
              onSelectPR={(prStr) => {
                setActiveTab('prs');
              }}
              teamMembers={teamMembers}
              onSelectTask={(issue) => {
                setSelectedTaskDetail(issue);
              }}
              onOpenTaskGenerator={() => {
                setAiTaskGenProjectKey('PULSE');
                setAiTaskGenOpen(true);
              }}
              onReorderIssues={(reordered) => {
                setJiraIssues(reordered);
              }}
            />
          </div>
        )}

        {/* Tab 4: GitHub Pull Requests */}
        {activeTab === 'prs' && (
          <div className="animate-in fade-in duration-200">
            <GitHubPRReview
              pullRequests={pullRequests}
              onMergePR={handleMergePR}
              onApprovePR={handleApprovePR}
              onOpenQuickCreate={() => setQuickCreateOpen(true)}
              onSelectJiraKey={(jiraKey) => {
                setActiveTab('jira');
              }}
              currentUser={currentUser}
            />
          </div>
        )}

        {/* Tab 5: Commit Matrix Heatmap */}
        {activeTab === 'heatmap' && (
          <div className="animate-in fade-in duration-200 space-y-4">
            <CommitHeatmap 
              heatmapData={heatmapData} 
              totalCommits={totalCommitsCount}
              currentUser={currentUser}
              commitsToday={currentUser.totalCommitsToday}
              activeRepos={realRepos}
            />
            <LiveActivityFeed
              events={activityEvents}
              onSimulateEvent={handleSimulateEvent}
              onSelectAction={(action) => {
                if (action.type === 'pr') {
                  setActiveTab('prs');
                } else if (action.type === 'jira') {
                  setActiveTab('jira');
                } else if (action.type === 'repo') {
                  setActiveTab('projects');
                } else if (action.type === 'github_url' && action.url) {
                  window.open(action.url, '_blank', 'noopener,noreferrer');
                }
              }}
              onSelectKey={(key) => {
                if (key.startsWith('PR') || key.startsWith('#')) setActiveTab('prs');
                else if (key.startsWith('DEV') || key.startsWith('TASK') || key.startsWith('REPO')) setActiveTab('jira');
                else if (key.includes('/')) setActiveTab('projects');
              }}
            />
          </div>
        )}

        {/* Tab 6: 2026 Annual Velocity Analytics */}
        {activeTab === 'velocity' && (
          <div className="animate-in fade-in duration-200">
            <AnnualVelocityView
              currentUser={currentUser}
              jiraIssues={jiraIssues}
              pullRequests={pullRequests}
              totalCommitsYear={totalCommitsCount}
              calculatedMetrics={gitHubMetrics || undefined}
            />
          </div>
        )}

        {/* Tab 7: Real Cloud Integrations & Real-Time GitHub Fetcher */}
        {activeTab === 'integrations' && (
          <div className="animate-in fade-in duration-200">
            <IntegrationsHub
              currentUser={currentUser}
              onUpdateUserGitHub={(username, token) => handleSyncGitHubUser(username, token)}
              onSyncGitHubData={(repos, commits) => {
                setRealRepos(repos);
                setRealCommits(commits);
              }}
              realRepos={realRepos}
              realCommits={realCommits}
              isGitHubLoading={isGitHubLoading}
              gitHubError={gitHubError}
            />
          </div>
        )}

        {/* Tab 8: CI/CD Fleet Telemetry */}
        {activeTab === 'cicd' && (
          <div className="animate-in fade-in duration-200">
            <CicdPipelineView
              pipelines={pipelines}
              onTriggerPipeline={handleTriggerPipeline}
            />
          </div>
        )}

      </main>

      {/* Focus Mode Flow State Full-Screen Overlay */}
      <FocusModeOverlay
        isOpen={focusMode}
        onClose={() => setFocusMode(false)}
        telemetry={telemetry}
      />

      {/* Global Quick Command Palette (⌘K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setCommandPaletteOpen(false);
        }}
        onOpenQuickCreate={() => {
          setQuickCreateOpen(true);
          setCommandPaletteOpen(false);
        }}
        onManualSync={handleManualSync}
        onToggleSound={handleToggleSound}
        onToggleFocusMode={handleToggleFocusMode}
        jiraIssues={jiraIssues}
        pullRequests={pullRequests}
        onSelectJiraKey={(key) => {
          setActiveTab('jira');
        }}
      />

      {/* Quick Create Jira / PR Modal */}
      <QuickCreateModal
        isOpen={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        onCreateJiraIssue={handleCreateJiraIssue}
        onCreatePR={handleCreatePR}
        currentUser={currentUser}
        teamMembers={teamMembers}
      />

      {/* Real User Meme Profile & Login Modal */}
      <UserLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        currentUser={currentUser}
        onSaveUser={handleSaveUserProfile}
        onSaveProfile={handleSaveUserProfile}
      />

      {/* AI Capability 1: AI Task Generator Modal */}
      <AITaskGeneratorModal
        isOpen={aiTaskGenOpen}
        onClose={() => setAiTaskGenOpen(false)}
        projects={projects}
        selectedProjectKey={aiTaskGenProjectKey}
        currentUser={currentUser}
        onTasksImported={handleTasksImportedFromAI}
      />

      {/* AI Capability 4: AI Sprint Productivity Coach */}
      <AIProductivityCoach
        isOpen={aiCoachOpen}
        onClose={() => setAiCoachOpen(false)}
        issues={jiraIssues}
        currentUser={currentUser}
        velocityScore={gitHubMetrics?.totalCommits ? Math.min(99, 70 + Math.round(gitHubMetrics.totalCommits / 10)) : 88}
        onOpenTaskGenerator={() => {
          setAiCoachOpen(false);
          setAiTaskGenProjectKey('PULSE');
          setAiTaskGenOpen(true);
        }}
      />

      {/* Interactive AI Developer Copilot Drawer */}
      <AICopilotDrawer
        isOpen={aiCopilotOpen}
        onClose={() => setAiCopilotOpen(false)}
        currentUser={currentUser}
        activeTaskCount={jiraIssues.filter((i) => i.status !== 'Done').length}
        velocityScore={gitHubMetrics?.totalCommits ? Math.min(99, 70 + Math.round(gitHubMetrics.totalCommits / 10)) : 88}
        onOpenTaskGenerator={() => {
          setAiCopilotOpen(false);
          setAiTaskGenProjectKey('PULSE');
          setAiTaskGenOpen(true);
        }}
      />

      {/* Project Creation & Edit Modal (with AI Capability 3: Project Description Generation) */}
      <CreateProjectModal
        isOpen={createProjectOpen}
        onClose={() => {
          setCreateProjectOpen(false);
          setEditingProject(null);
        }}
        onProjectSaved={handleProjectSaved}
        currentUser={currentUser}
        editingProject={editingProject}
      />

      {/* Project Detail Drawer */}
      <ProjectDetailModal
        isOpen={!!selectedProjectDetail}
        onClose={() => setSelectedProjectDetail(null)}
        project={selectedProjectDetail}
        issues={jiraIssues}
        currentUser={currentUser}
        onEditProject={(proj) => {
          setSelectedProjectDetail(null);
          setEditingProject(proj);
          setCreateProjectOpen(true);
        }}
        onDeleteProject={(projId) => {
          handleDeleteProject(projId);
          setSelectedProjectDetail(null);
        }}
        onOpenTaskGenerator={(projKey) => {
          setSelectedProjectDetail(null);
          setAiTaskGenProjectKey(projKey);
          setAiTaskGenOpen(true);
        }}
        onCreateTask={(projectName) => {
          setSelectedProjectDetail(null);
          setQuickCreateOpen(true);
        }}
      />

      {/* Task Detail Modal (with Status Transitions & AI Capability 2: Task Summarization) */}
      <TaskDetailModal
        isOpen={!!selectedTaskDetail}
        onClose={() => setSelectedTaskDetail(null)}
        issue={selectedTaskDetail}
        onSaveTask={(updated) => {
          handleSaveTaskDetail(updated);
          setSelectedTaskDetail(null);
        }}
        onDeleteTask={(issueId) => {
          handleDeleteTask(issueId);
          setSelectedTaskDetail(null);
        }}
        teamMembers={teamMembers}
        currentUser={currentUser}
      />

      {/* Futuristic Footer */}
      <footer className="w-full border-t border-slate-800/80 py-4 px-6 mt-12 bg-slate-950/90 text-slate-500 text-xs font-mono z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-handjet text-lg text-cyan-400 font-bold">DEVPULSE</span>
            <span>&middot; Developer Productivity Architecture</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
              ALL SYSTEMS OPERATIONAL
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Latency: <span className="text-cyan-300">{telemetry.rttLatency}ms</span></span>
            <span>Focus Score: <span className="text-amber-300">{telemetry.realTimeFocusScore}%</span></span>
            <span>Cores: <span className="text-purple-300">{telemetry.cpuCores}</span></span>
            <span>GitHub Webhook: <span className="text-emerald-300">Active</span></span>
          </div>
        </div>
      </footer>

    </div>
  );
}

