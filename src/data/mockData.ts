import { Developer, JiraIssue, PullRequest, PipelineRun, ActivityEvent, CommitActivity } from '../types';

export const CURRENT_DEV: Developer = {
  id: 'dev_alex',
  name: 'Alex Vance',
  handle: 'alexvance_dev',
  githubHandle: 'shadcn',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'Staff Platform & Systems Engineer',
  team: 'Core Platform & Architecture',
  status: 'In the Zone',
  statusColor: 'bg-emerald-500',
  streakDays: 42,
  storyPointsCompleted: 34,
  totalCommitsToday: 12,
  prMergeRate: 98.4,
  velocityScore: 142,
  focusMinutesToday: 210,
  bio: 'Building low-latency distributed microservices, Rust/TS tooling, and developer infrastructure.',
  skills: ['TypeScript', 'Rust', 'Kubernetes', 'GraphQL', 'Next.js', 'PostgreSQL', 'eBPF', 'TailwindCSS'],
};

export const TEAM_MEMBERS: Developer[] = [
  CURRENT_DEV,
  {
    id: 'dev_elena',
    name: 'Elena Rostova',
    handle: 'elena_rust',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    role: 'Senior Backend Engineer',
    team: 'Core Platform',
    status: 'Reviewing Code',
    statusColor: 'bg-cyan-500',
    streakDays: 28,
    storyPointsCompleted: 26,
    totalCommitsToday: 8,
    prMergeRate: 95.0,
    velocityScore: 124,
    focusMinutesToday: 180,
    bio: 'Distributed consensus algorithms & database internal optimizations.',
    skills: ['Go', 'PostgreSQL', 'Redis', 'Kafka'],
  },
  {
    id: 'dev_marcus',
    name: 'Marcus Chen',
    handle: 'mchen_cloud',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Lead Frontend Architect',
    team: 'UI / Design Systems',
    status: 'Pairing',
    statusColor: 'bg-amber-500',
    streakDays: 19,
    storyPointsCompleted: 31,
    totalCommitsToday: 14,
    prMergeRate: 99.1,
    velocityScore: 138,
    focusMinutesToday: 240,
    bio: 'Design tokens, WebAssembly UI renderers, and micro-frontend architecture.',
    skills: ['React', 'TypeScript', 'TailwindCSS', 'Three.js'],
  },
  {
    id: 'dev_sara',
    name: 'Sara Lindqvist',
    handle: 'saradev_ops',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    role: 'DevOps & SRE Specialist',
    team: 'Cloud Operations',
    status: 'In Sprint Planning',
    statusColor: 'bg-violet-500',
    streakDays: 35,
    storyPointsCompleted: 22,
    totalCommitsToday: 5,
    prMergeRate: 94.2,
    velocityScore: 118,
    focusMinutesToday: 150,
    bio: 'Zero-downtime canary deployments, Terraform modules, and observability meshes.',
    skills: ['Kubernetes', 'Terraform', 'Prometheus', 'AWS'],
  },
];

export const INITIAL_JIRA_ISSUES: JiraIssue[] = [
  {
    id: 'jira-101',
    key: 'DEV-1024',
    title: 'Architect zero-copy binary streaming pipeline for telemetry engine',
    type: 'Story',
    status: 'In Progress',
    priority: 'Critical',
    storyPoints: 8,
    assignee: CURRENT_DEV,
    reporter: TEAM_MEMBERS[1],
    sprint: 'Sprint 34: Apex Velocity',
    epic: 'Telemetry V2',
    epicColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    timeSpentHours: 14,
    estimatedHours: 20,
    tags: ['performance', 'rust', 'telemetry', 'core-eng'],
    linkedPR: 'PR #412',
    repo: 'devpulse/telemetry-core',
    createdAt: '2026-08-20',
    dueDate: '2026-08-25',
    description: 'Implement stream buffers using ArrayBuffers and SharedArrayBuffer worker threads to eliminate JSON serialization overhead under 100k events/sec load.',
  },
  {
    id: 'jira-102',
    key: 'DEV-1029',
    title: 'Fix race condition during WebSocket authentication handshake',
    type: 'Bug',
    status: 'In Review',
    priority: 'High',
    storyPoints: 5,
    assignee: CURRENT_DEV,
    reporter: TEAM_MEMBERS[2],
    sprint: 'Sprint 34: Apex Velocity',
    epic: 'Auth & Security',
    epicColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    timeSpentHours: 6,
    estimatedHours: 8,
    tags: ['auth', 'websocket', 'security'],
    linkedPR: 'PR #416',
    repo: 'devpulse/gateway-proxy',
    createdAt: '2026-08-21',
    dueDate: '2026-08-24',
    description: 'Resolve token refresh mismatch when duplicate connection frames arrive simultaneously on client reconnect cycles.',
  },
  {
    id: 'jira-103',
    key: 'DEV-1031',
    title: 'Migrate design system token parser to Tailwind CSS v4 engine',
    type: 'Task',
    status: 'Done',
    priority: 'Medium',
    storyPoints: 5,
    assignee: CURRENT_DEV,
    reporter: TEAM_MEMBERS[2],
    sprint: 'Sprint 34: Apex Velocity',
    epic: 'UI Modernization',
    epicColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    timeSpentHours: 7,
    estimatedHours: 8,
    tags: ['frontend', 'tailwind', 'tokens'],
    linkedPR: 'PR #408',
    repo: 'devpulse/design-system',
    createdAt: '2026-08-18',
    dueDate: '2026-08-22',
    description: 'Upgraded all root variables, OKLCH color palettes, and glassmorphic utility layer to Vite native compiler.',
  },
  {
    id: 'jira-104',
    key: 'DEV-1040',
    title: 'Optimize GraphQL query resolver batching via DataLoader cache',
    type: 'Story',
    status: 'Todo',
    priority: 'High',
    storyPoints: 5,
    assignee: CURRENT_DEV,
    reporter: TEAM_MEMBERS[1],
    sprint: 'Sprint 34: Apex Velocity',
    epic: 'Telemetry V2',
    epicColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    timeSpentHours: 0,
    estimatedHours: 12,
    tags: ['graphql', 'database', 'caching'],
    repo: 'devpulse/api-service',
    createdAt: '2026-08-21',
    dueDate: '2026-08-28',
    description: 'Eliminate N+1 database querying across nested repository and pull request timeline resolvers.',
  },
  {
    id: 'jira-105',
    key: 'DEV-1044',
    title: 'Implement eBPF kernel network probe for latency telemetry',
    type: 'Epic',
    status: 'Backlog',
    priority: 'Critical',
    storyPoints: 13,
    assignee: CURRENT_DEV,
    reporter: CURRENT_DEV,
    sprint: 'Sprint 35: Next Horizons',
    epic: 'Telemetry V2',
    epicColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    timeSpentHours: 0,
    estimatedHours: 40,
    tags: ['kernel', 'ebpf', 'networking', 'linux'],
    repo: 'devpulse/kernel-probes',
    createdAt: '2026-08-22',
    dueDate: '2026-09-10',
    description: 'Build XDP/eBPF bytecode filters for instantaneous TCP RTT tracking across container pods.',
  },
  {
    id: 'jira-106',
    key: 'DEV-1018',
    title: 'Configure automated SBOM security vulnerability scanner in CI',
    type: 'Task',
    status: 'Done',
    priority: 'Low',
    storyPoints: 3,
    assignee: TEAM_MEMBERS[3],
    reporter: CURRENT_DEV,
    sprint: 'Sprint 34: Apex Velocity',
    epic: 'Auth & Security',
    epicColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    timeSpentHours: 4,
    estimatedHours: 4,
    tags: ['security', 'ci-cd', 'github-actions'],
    linkedPR: 'PR #402',
    repo: 'devpulse/ci-workflows',
    createdAt: '2026-08-16',
    dueDate: '2026-08-19',
    description: 'Integrated Grype and Syft scanning for all OCI container images in staging and prod deployment tracks.',
  },
  {
    id: 'jira-107',
    key: 'DEV-1022',
    title: 'Refactor state tree synchronization in real-time collaborative editor',
    type: 'Refactor',
    status: 'In Progress',
    priority: 'High',
    storyPoints: 8,
    assignee: TEAM_MEMBERS[2],
    reporter: CURRENT_DEV,
    sprint: 'Sprint 34: Apex Velocity',
    epic: 'UI Modernization',
    epicColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    timeSpentHours: 11,
    estimatedHours: 16,
    tags: ['crdt', 'yjs', 'state-machine'],
    linkedPR: 'PR #419',
    repo: 'devpulse/web-client',
    createdAt: '2026-08-19',
    dueDate: '2026-08-26',
    description: 'Replace custom Operational Transformation tree with Yjs CRDT binary vector format for seamless offline sync.',
  },
];

export const INITIAL_PULL_REQUESTS: PullRequest[] = [
  {
    id: 'pr-412',
    number: 412,
    title: 'feat(stream): zero-copy telemetry ring buffer with shared memory',
    repo: 'devpulse/telemetry-core',
    branch: 'feat/zero-copy-ring-buffer',
    baseBranch: 'main',
    author: CURRENT_DEV,
    reviewers: [TEAM_MEMBERS[1], TEAM_MEMBERS[2]],
    status: 'open',
    checks: { passed: 18, total: 18, status: 'success' },
    additions: 438,
    deletions: 82,
    changedFiles: 7,
    commentsCount: 5,
    jiraKey: 'DEV-1024',
    createdAt: '2026-08-21T14:32:00Z',
    updatedAt: '12 mins ago',
    reviewStatus: 'Pending Review',
    diffSnippets: [
      {
        file: 'src/stream/ring_buffer.rs',
        additions: 124,
        deletions: 18,
        diff: `@@ -42,8 +42,22 @@ pub struct RingBuffer<T> {
-    buffer: Vec<T>,
-    head: usize,
+    shared_memory: Arc<AtomicPtr<T>>,
+    capacity: usize,
+    head: AtomicUsize,
+    tail: AtomicUsize,
+    cache_padding: [u8; 64], // eliminate false sharing
 }
 
+impl<T: Send + Sync> RingBuffer<T> {
+    pub fn push_zero_copy(&self, item: T) -> Result<(), BufferError> {
+        let current_tail = self.tail.load(Ordering::Acquire);
+        let next_tail = (current_tail + 1) % self.capacity;
+        if next_tail == self.head.load(Ordering::Relaxed) {
+            return Err(BufferError::Full);
+        }
+        unsafe { *self.shared_memory.load(Ordering::Relaxed).add(current_tail) = item; }
+        self.tail.store(next_tail, Ordering::Release);
+        Ok(())
+    }`,
      },
      {
        file: 'src/telemetry/dispatcher.ts',
        additions: 86,
        deletions: 12,
        diff: `@@ -18,6 +18,18 @@ export class TelemetryDispatcher {
+  private sharedBuffer = new SharedArrayBuffer(1024 * 1024 * 16);
+  private workerPool: Worker[] = [];
+
+  public emitInstantMetric(type: MetricType, payload: Uint8Array): void {
+    Atomics.store(this.controlFlags, 0, 1);
+    this.directMemoryView.set(payload, this.cursor);
+    Atomics.notify(this.controlFlags, 0, 1);
+  }`,
      },
    ],
  },
  {
    id: 'pr-416',
    number: 416,
    title: 'fix(auth): prevent token refresh deadlock during dual WebSocket frame re-negotiation',
    repo: 'devpulse/gateway-proxy',
    branch: 'fix/ws-auth-deadlock',
    baseBranch: 'main',
    author: CURRENT_DEV,
    reviewers: [TEAM_MEMBERS[1]],
    status: 'open',
    checks: { passed: 12, total: 12, status: 'success' },
    additions: 94,
    deletions: 38,
    changedFiles: 3,
    commentsCount: 3,
    jiraKey: 'DEV-1029',
    createdAt: '2026-08-22T08:15:00Z',
    updatedAt: '45 mins ago',
    reviewStatus: 'Approved',
    diffSnippets: [
      {
        file: 'pkg/auth/handshake.go',
        additions: 42,
        deletions: 15,
        diff: `@@ -88,10 +88,19 @@ func (h *HandshakeManager) RefreshToken(ctx context.Context, clientID string) (
-	h.mu.Lock()
-	defer h.mu.Unlock()
+	// Use singleflight group to deduplicate concurrent refresh invocations
+	res, err, _ := h.sfGroup.Do(clientID, func() (interface{}, error) {
+		return h.tokenIssuer.RotateToken(ctx, clientID)
+	})
+	if err != nil {
+		return nil, fmt.Errorf("token rotation failed: %w", err)
+	}
+	return res.(*TokenResponse), nil`,
      },
    ],
  },
  {
    id: 'pr-408',
    number: 408,
    title: 'refactor(theme): migrate design token compiler to Tailwind v4 CSS engine',
    repo: 'devpulse/design-system',
    branch: 'refactor/tailwind-v4',
    baseBranch: 'main',
    author: CURRENT_DEV,
    reviewers: [TEAM_MEMBERS[2]],
    status: 'merged',
    checks: { passed: 24, total: 24, status: 'success' },
    additions: 612,
    deletions: 480,
    changedFiles: 14,
    commentsCount: 8,
    jiraKey: 'DEV-1031',
    createdAt: '2026-08-18T10:00:00Z',
    updatedAt: 'Yesterday',
    reviewStatus: 'Approved',
    diffSnippets: [
      {
        file: 'styles/tokens.css',
        additions: 120,
        deletions: 80,
        diff: `@@ -1,6 +1,12 @@
-@import "tailwindcss/base";
-@import "tailwindcss/components";
-@import "tailwindcss/utilities";
+@import "tailwindcss";
+@theme {
+  --font-handjet: "Handjet", sans-serif;
+  --color-cyber-cyan: oklch(80% 0.18 200);
+  --color-neon-emerald: oklch(85% 0.22 145);
+}`,
      },
    ],
  },
  {
    id: 'pr-419',
    number: 419,
    title: 'feat(crdt): implement Yjs binary doc sync protocol for live canvas',
    repo: 'devpulse/web-client',
    branch: 'feat/yjs-crdt-sync',
    baseBranch: 'main',
    author: TEAM_MEMBERS[2],
    reviewers: [CURRENT_DEV],
    status: 'open',
    checks: { passed: 15, total: 16, status: 'running' },
    additions: 512,
    deletions: 184,
    changedFiles: 9,
    commentsCount: 7,
    jiraKey: 'DEV-1022',
    createdAt: '2026-08-22T04:20:00Z',
    updatedAt: '2 hours ago',
    reviewStatus: 'Pending Review',
    diffSnippets: [
      {
        file: 'src/editor/syncEngine.ts',
        additions: 140,
        deletions: 45,
        diff: `@@ -22,12 +22,34 @@ export class CRDTSyncEngine {
+  private ydoc = new Y.Doc();
+  private provider = new WebsocketProvider(WS_ENDPOINT, 'room-pulse', this.ydoc);
+
+  public applyRemoteUpdate(updateBinary: Uint8Array): void {
+    Y.applyUpdate(this.ydoc, updateBinary, 'remote-peer');
+  }`,
      },
    ],
  },
];

export const INITIAL_PIPELINES: PipelineRun[] = [
  {
    id: 'pipe-982',
    service: 'telemetry-core // production',
    environment: 'Production',
    branch: 'main',
    commitHash: '7f9a2e1',
    commitMessage: 'feat(stream): zero-copy ring buffer (#412)',
    author: 'Alex Vance',
    status: 'success',
    duration: '2m 14s',
    startedAt: '18 mins ago',
    testsPassed: 342,
    testsTotal: 342,
    coverage: 96.8,
  },
  {
    id: 'pipe-981',
    service: 'gateway-proxy // canary',
    environment: 'Staging',
    branch: 'fix/ws-auth-deadlock',
    commitHash: '8a1c90b',
    commitMessage: 'fix(auth): prevent singleflight token collision',
    author: 'Alex Vance',
    status: 'running',
    duration: '1m 05s',
    startedAt: '3 mins ago',
    testsPassed: 184,
    testsTotal: 210,
    coverage: 92.4,
  },
  {
    id: 'pipe-980',
    service: 'web-client // preview-pr-419',
    environment: 'Preview',
    branch: 'feat/yjs-crdt-sync',
    commitHash: '3d881ef',
    commitMessage: 'feat(crdt): update binary diff vector',
    author: 'Marcus Chen',
    status: 'running',
    duration: '45s',
    startedAt: '1 min ago',
    testsPassed: 89,
    testsTotal: 120,
    coverage: 88.6,
  },
  {
    id: 'pipe-979',
    service: 'api-service // production',
    environment: 'Production',
    branch: 'main',
    commitHash: '9c440a2',
    commitMessage: 'perf(db): connection pool tuning for read replicas',
    author: 'Elena Rostova',
    status: 'success',
    duration: '3m 42s',
    startedAt: '2 hours ago',
    testsPassed: 520,
    testsTotal: 520,
    coverage: 94.1,
  },
];

export const INITIAL_ACTIVITY_FEED: ActivityEvent[] = [
  {
    id: 'act-1',
    timestamp: 'Just now',
    type: 'pr_review',
    title: 'Code review submitted on PR #419',
    description: 'Approved Yjs binary doc sync protocol with suggestion on vector garbage collection.',
    source: 'github',
    linkKey: 'PR #419',
    user: CURRENT_DEV,
  },
  {
    id: 'act-2',
    timestamp: '14 mins ago',
    type: 'jira_status',
    title: 'Status moved to In Review',
    description: 'DEV-1029 (Fix race condition during WebSocket auth) advanced to In Review stage.',
    source: 'jira',
    linkKey: 'DEV-1029',
    user: CURRENT_DEV,
  },
  {
    id: 'act-3',
    timestamp: '42 mins ago',
    type: 'commit_push',
    title: 'Pushed 4 commits to devpulse/telemetry-core',
    description: 'Added benchmark suites proving 4.8x throughput increase with zero-copy ring buffers.',
    source: 'github',
    linkKey: '7f9a2e1',
    user: CURRENT_DEV,
  },
  {
    id: 'act-4',
    timestamp: '1 hour ago',
    type: 'deploy_success',
    title: 'Pipeline #982 deployed to Production',
    description: 'All 342 automated unit & e2e tests passed with 96.8% coverage threshold.',
    source: 'ci',
    linkKey: 'telemetry-core',
    user: CURRENT_DEV,
  },
  {
    id: 'act-5',
    timestamp: '3 hours ago',
    type: 'focus_session',
    title: 'Flow state session completed',
    description: '90-minute uninterrupted deep work sprint logged (+18 velocity points).',
    source: 'system',
    user: CURRENT_DEV,
  },
];

// Generates a realistic 52-week activity heatmap (365 days)
export function generateCommitHeatmap(): CommitActivity[] {
  const result: CommitActivity[] = [];
  const today = new Date('2026-08-22');
  
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay(); // 0 is Sun, 6 is Sat

    // Realistic developer distribution: higher on weekdays, streak patterns
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    let count = 0;
    
    // Seeded pseudorandom based on date
    const seed = (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) % 100;
    
    if (!isWeekend) {
      if (seed > 85) count = Math.floor(Math.random() * 6) + 10;
      else if (seed > 50) count = Math.floor(Math.random() * 5) + 5;
      else if (seed > 15) count = Math.floor(Math.random() * 4) + 1;
      else count = 0; // occasional rest day
    } else {
      if (seed > 70) count = Math.floor(Math.random() * 3) + 1;
      else count = 0;
    }

    // Boost recent 45 days for current streak
    if (i < 45 && count === 0 && !isWeekend) {
      count = Math.floor(Math.random() * 6) + 4;
    }

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count === 0) level = 0;
    else if (count <= 3) level = 1;
    else if (count <= 7) level = 2;
    else if (count <= 12) level = 3;
    else level = 4;

    result.push({ date: dateStr, count, level });
  }

  return result;
}

export const MOCK_REPOSITORIES = [
  'devpulse/telemetry-core',
  'devpulse/gateway-proxy',
  'devpulse/design-system',
  'devpulse/web-client',
  'devpulse/api-service',
  'devpulse/kernel-probes',
  'devpulse/ci-workflows',
];

export const MOCK_SPRINTS = [
  'Sprint 34: Apex Velocity (Current)',
  'Sprint 35: Next Horizons',
  'Sprint 33: Quantum Release',
  'Backlog / Future Epics',
];
