export type IssueStatus = 'Backlog' | 'Todo' | 'In Progress' | 'In Review' | 'Done';
export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type IssueType = 'Story' | 'Bug' | 'Task' | 'Epic' | 'Refactor';

export interface MemeAvatar {
  id: string;
  name: string;
  url: string;
  category: 'GenZ Meme' | 'Cyberpunk' | 'Retro Pixel' | 'Animals';
  vibe: string;
}

export interface SkillProficiency {
  name: string;
  percentage: number;
  repoCount: number;
  color?: string;
  category?: string;
}

export interface Developer {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  role: string;
  team: string;
  status: 'In the Zone' | 'Reviewing Code' | 'Pairing' | 'In Sprint Planning' | 'AFK' | 'Vibecoding' | 'Debugging at 3AM';
  statusColor: string;
  streakDays: number;
  storyPointsCompleted: number;
  totalCommitsToday: number;
  prMergeRate: number;
  velocityScore: number;
  focusMinutesToday: number;
  bio: string;
  skills: string[];
  skillProficiencies?: SkillProficiency[];
  peakCodingWindow?: string;
  githubUsername?: string;
  githubHandle?: string;
  githubToken?: string;
  customDesignation?: string;
  memeBadge?: string;
  xpPoints?: number;
  level?: number;
}

export interface DeviceTelemetry {
  cpuCores: number;
  deviceMemoryGb: number;
  usedHeapMb: number;
  totalHeapMb: number;
  batteryLevel: number | null;
  isCharging: boolean | null;
  networkType: string;
  downlinkSpeed: number;
  rttLatency: number;
  screenResolution: string;
  isWindowFocused: boolean;
  idleSeconds: number;
  realTimeFocusScore: number;
  weeklyLoggedHours: number;
  todayCodingSeconds: number;
  keystrokesCount: number;
  lastActiveTimestamp: number;
}

export interface ProjectTechStack {
  id: string;
  repoName: string;
  fullName: string;
  description: string;
  primaryLanguage: string;
  languages: string[];
  frameworks: string[];
  techStackBadges: string[];
  stars: number;
  forks: number;
  openIssues: number;
  defaultBranch: string;
  status: 'Completed' | 'Active Sprint' | 'In Progress' | 'Maintained';
  lastPushedAt: string;
  createdAt?: string;
  commitsThisMonth: number;
  commitsToday: number;
  htmlUrl: string;
  homepage?: string | null;
  isFork?: boolean;
  isArchived?: boolean;
  topics?: string[];
  license?: string | null;
  sizeKb?: number;
  isRealGitHub?: boolean;
}

export interface DailyCommitStat {
  date: string;
  dayName: string;
  commitsCount: number;
  reposCommitted: string[];
  activeMinutes: number;
  linesAdded: number;
  linesDeleted: number;
}

export interface AnnualVelocity {
  year: number;
  totalCommits: number;
  totalPRsMerged: number;
  storyPointsCompleted: number;
  velocityScore: number;
  sprintsCompleted: number;
  activeRepositories: number;
  longestStreakDays: number;
  codingHoursLogged: number;
  quarterlyBreakdown: {
    quarter: string;
    commits: number;
    storyPoints: number;
    prs: number;
  }[];
}

export interface GitHubRealRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  pushed_at?: string;
  created_at?: string;
  open_issues_count: number;
  default_branch: string;
  private: boolean;
  fork?: boolean;
  archived?: boolean;
  homepage?: string | null;
  size?: number;
  license?: { name: string; spdx_id?: string } | null;
  topics?: string[];
  owner?: {
    login: string;
    avatar_url: string;
    html_url?: string;
  };
}

export interface GitHubRealCommit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author?: {
    login: string;
    avatar_url: string;
  } | null;
}

export interface CloudPlatformIntegration {
  id: 'github' | 'vercel' | 'render' | 'cloudflare' | 'supabase' | 'netlify' | 'railway';
  name: string;
  iconName: string;
  category: 'Code & VCS' | 'Hosting & Edge' | 'Compute & Database' | 'CDN & DNS';
  status: 'connected' | 'disconnected' | 'syncing' | 'healthy';
  accountOrProject?: string;
  latencyMs: number;
  lastSync: string;
  activeDeployments: number;
  color: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  title: string;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  storyPoints: number;
  assignee: Developer;
  reporter: Developer;
  sprint: string;
  epic: string;
  epicColor: string;
  timeSpentHours: number;
  estimatedHours: number;
  tags: string[];
  linkedPR?: string;
  repo?: string;
  createdAt: string;
  dueDate: string;
  description: string;
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  repo: string;
  branch: string;
  baseBranch: string;
  author: Developer;
  reviewers: Developer[];
  status: 'open' | 'merged' | 'draft' | 'closed';
  checks: {
    passed: number;
    total: number;
    status: 'success' | 'running' | 'failed';
  };
  additions: number;
  deletions: number;
  changedFiles: number;
  commentsCount: number;
  jiraKey?: string;
  createdAt: string;
  updatedAt: string;
  diffSnippets: {
    file: string;
    additions: number;
    deletions: number;
    diff: string;
  }[];
  reviewStatus?: 'Approved' | 'Changes Requested' | 'Pending Review';
}

export interface CommitActivity {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface PipelineRun {
  id: string;
  service: string;
  environment: 'Production' | 'Staging' | 'Preview';
  branch: string;
  commitHash: string;
  commitMessage: string;
  author: string;
  status: 'success' | 'running' | 'failed' | 'queued';
  duration: string;
  startedAt: string;
  testsPassed: number;
  testsTotal: number;
  coverage: number;
}

export interface ActivityActionLink {
  type: 'pr' | 'jira' | 'repo' | 'pipeline' | 'github_url';
  target: string;
  label: string;
  url?: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: 'jira_status' | 'jira_create' | 'pr_open' | 'pr_merge' | 'pr_review' | 'commit_push' | 'deploy_success' | 'focus_session' | 'github_sync';
  title: string;
  description: string;
  source: 'jira' | 'github' | 'ci' | 'system' | 'vercel' | 'cloudflare';
  linkKey?: string;
  actionLink?: ActivityActionLink;
  user: Developer;
}

export interface FilterState {
  searchQuery: string;
  status: string;
  priority: string;
  assignee: string;
  repo: string;
  type: string;
}
