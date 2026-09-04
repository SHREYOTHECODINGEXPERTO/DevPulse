import { app } from '../app.ts';
import { db } from '../data/store.ts';
import { Server } from 'http';

let server: Server;
let baseUrl: string;
const TEST_PORT = 5099;

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, errorDetail?: any) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    if (errorDetail) console.error('     Detail:', errorDetail);
    failed++;
  }
}

async function request(path: string, options: RequestInit = {}) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const status = response.status;
  let body: any;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return { status, body, headers: response.headers };
}

async function runAllTests() {
  console.log('\n🧪 ===================================================');
  console.log('🧪 RUNNING DEVPULSE REST API INTEGRATION TEST SUITE');
  console.log('🧪 ===================================================\n');

  // Start test server
  await new Promise<void>((resolve) => {
    server = app.listen(TEST_PORT, () => {
      baseUrl = `http://localhost:${TEST_PORT}`;
      resolve();
    });
  });

  // Reseed test store before testing
  db.reseed();

  try {
    // ----------------------------------------------------
    // 1. HEALTH & DOCS TESTS
    // ----------------------------------------------------
    console.log('\n📌 1. Health & Documentation Endpoints:');

    const healthRes = await request('/api/health');
    assert(healthRes.status === 200, 'GET /api/health returns 200 OK');
    assert(healthRes.body.data.status === 'healthy', 'Health check returns healthy status');
    assert(healthRes.body.data.database.usersCount >= 4, 'Health check reports seeded database records');

    const openApiRes = await request('/api/openapi.json');
    assert(openApiRes.status === 200, 'GET /api/openapi.json returns 200 OK');
    assert(openApiRes.body.openapi === '3.0.3', 'OpenAPI specification version is 3.0.3');

    // ----------------------------------------------------
    // 2. USER MANAGEMENT ENDPOINTS
    // ----------------------------------------------------
    console.log('\n📌 2. User Management Endpoints (/api/users):');

    // List users
    const usersListRes = await request('/api/users');
    assert(usersListRes.status === 200, 'GET /api/users returns 200 OK');
    assert(Array.isArray(usersListRes.body.data) && usersListRes.body.data.length >= 4, 'GET /api/users returns list of users');
    assert(usersListRes.body.meta.total >= 4, 'GET /api/users returns pagination metadata');

    // Filter users by role
    const filteredRoleRes = await request('/api/users?role=Frontend');
    assert(filteredRoleRes.status === 200, 'GET /api/users?role=Frontend returns 200 OK');
    assert(filteredRoleRes.body.data.some((u: any) => u.name === 'Alex Rivera'), 'Filter by role matches Alex Rivera');

    // Search users
    const searchUserRes = await request('/api/users?search=kubernetes');
    assert(searchUserRes.status === 200, 'GET /api/users?search=kubernetes returns 200 OK');
    assert(searchUserRes.body.data.some((u: any) => u.name === 'Sarah Chen'), 'Search by skill returns Sarah Chen');

    // Get user by ID
    const singleUserRes = await request('/api/users/user-1');
    assert(singleUserRes.status === 200, 'GET /api/users/user-1 returns 200 OK');
    assert(singleUserRes.body.data.name === 'Alex Rivera', 'Retrieved user name is Alex Rivera');

    // User not found
    const notFoundUserRes = await request('/api/users/non-existent-user-id');
    assert(notFoundUserRes.status === 404, 'GET /api/users/non-existent-user-id returns 404 NOT FOUND');
    assert(notFoundUserRes.body.error.code === 'NOT_FOUND', 'Error response returns code NOT_FOUND');

    // Create user (Valid)
    const newUserPayload = {
      name: 'Devin Thorne',
      handle: '@dthorne',
      email: 'devin.thorne@devpulse.io',
      role: 'Staff DevOps Architect',
      team: 'Infrastructure & Cloud',
      skills: ['Terraform', 'AWS', 'Docker'],
      status: 'In the Zone',
    };
    const createUserRes = await request('/api/users', {
      method: 'POST',
      body: JSON.stringify(newUserPayload),
    });
    assert(createUserRes.status === 201, 'POST /api/users returns 201 CREATED');
    assert(createUserRes.body.data.name === 'Devin Thorne', 'Created user has correct name');
    const createdUserId = createUserRes.body.data.id;

    // Create user validation failure (Invalid email)
    const invalidEmailRes = await request('/api/users', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Invalid Email User',
        handle: '@invalid',
        email: 'not-an-email',
        role: 'Tester',
        team: 'QA',
      }),
    });
    assert(invalidEmailRes.status === 400, 'POST /api/users with invalid email returns 400 BAD REQUEST');
    assert(invalidEmailRes.body.error.code === 'VALIDATION_ERROR', 'Error code is VALIDATION_ERROR');

    // Create user conflict (Duplicate handle)
    const duplicateUserRes = await request('/api/users', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Duplicate Handle',
        handle: '@arivera_dev',
        email: 'unique.email@devpulse.io',
        role: 'Engineer',
        team: 'Core',
      }),
    });
    assert(duplicateUserRes.status === 409, 'POST /api/users with duplicate handle returns 409 CONFLICT');
    assert(duplicateUserRes.body.error.code === 'CONFLICT', 'Error code is CONFLICT');

    // Update user (PATCH)
    const patchUserRes = await request(`/api/users/${createdUserId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'Vibecoding',
        bio: 'Automating high-scale cloud infrastructure pipelines.',
      }),
    });
    assert(patchUserRes.status === 200, 'PATCH /api/users/:id returns 200 OK');
    assert(patchUserRes.body.data.status === 'Vibecoding', 'User status updated to Vibecoding');

    // Get user stats
    const userStatsRes = await request('/api/users/user-1/stats');
    assert(userStatsRes.status === 200, 'GET /api/users/user-1/stats returns 200 OK');
    assert(userStatsRes.body.data.metrics.streakDays > 0, 'User stats contains streakDays metric');
    assert(userStatsRes.body.data.tasks !== undefined, 'User stats contains task summary breakdown');

    // Get user tasks
    const userTasksRes = await request('/api/users/user-1/tasks');
    assert(userTasksRes.status === 200, 'GET /api/users/user-1/tasks returns 200 OK');
    assert(Array.isArray(userTasksRes.body.data), 'User tasks is an array');

    // Delete user
    const deleteUserRes = await request(`/api/users/${createdUserId}`, {
      method: 'DELETE',
    });
    assert(deleteUserRes.status === 200, 'DELETE /api/users/:id returns 200 OK');

    // ----------------------------------------------------
    // 3. PROJECT CREATION & RETRIEVAL ENDPOINTS
    // ----------------------------------------------------
    console.log('\n📌 3. Project Management Endpoints (/api/projects):');

    // List projects
    const projectsListRes = await request('/api/projects');
    assert(projectsListRes.status === 200, 'GET /api/projects returns 200 OK');
    assert(Array.isArray(projectsListRes.body.data) && projectsListRes.body.data.length >= 3, 'GET /api/projects returns project list');

    // Get project with aggregated task statistics
    const singleProjRes = await request('/api/projects/proj-1');
    assert(singleProjRes.status === 200, 'GET /api/projects/proj-1 returns 200 OK');
    assert(singleProjRes.body.data.taskSummary !== undefined, 'Project includes task summary metrics');
    assert(singleProjRes.body.data.taskSummary.totalTasks > 0, 'Project calculates total tasks count');
    assert(Array.isArray(singleProjRes.body.data.members), 'Project populates member objects');

    // Create project (Valid)
    const newProjPayload = {
      name: 'PulseFlow Edge Gateway',
      key: 'GATEWAY',
      description: 'Ultra low latency edge routing and WebSockets telemetry distributor.',
      ownerId: 'user-2',
      primaryLanguage: 'Go',
      languages: ['Go', 'TypeScript'],
      frameworks: ['Fiber', 'gRPC'],
      status: 'Active Sprint',
    };
    const createProjRes = await request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(newProjPayload),
    });
    assert(createProjRes.status === 201, 'POST /api/projects returns 201 CREATED');
    assert(createProjRes.body.data.key === 'GATEWAY', 'Created project key is GATEWAY');
    const createdProjId = createProjRes.body.data.id;

    // Create project conflict (Duplicate key)
    const duplicateProjRes = await request('/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Duplicate Pulse Key',
        key: 'PULSE',
        description: 'Testing duplicate project key rejection.',
        ownerId: 'user-1',
      }),
    });
    assert(duplicateProjRes.status === 409, 'POST /api/projects with duplicate key returns 409 CONFLICT');

    // Create project validation (Invalid owner ID)
    const invalidOwnerProjRes = await request('/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: 'No Owner Project',
        key: 'NOOWNER',
        description: 'Testing invalid owner rejection.',
        ownerId: 'non-existent-owner',
      }),
    });
    assert(invalidOwnerProjRes.status === 400, 'POST /api/projects with non-existent owner returns 400 BAD REQUEST');

    // Get project tasks
    const projTasksRes = await request('/api/projects/proj-1/tasks');
    assert(projTasksRes.status === 200, 'GET /api/projects/proj-1/tasks returns 200 OK');
    assert(Array.isArray(projTasksRes.body.data) && projTasksRes.body.data.length > 0, 'Project tasks returns task list');

    // Delete created project
    const deleteProjRes = await request(`/api/projects/${createdProjId}`, {
      method: 'DELETE',
    });
    assert(deleteProjRes.status === 200, 'DELETE /api/projects/:id returns 200 OK');

    // ----------------------------------------------------
    // 4. TASK CREATION, UPDATE & STATUS MANAGEMENT
    // ----------------------------------------------------
    console.log('\n📌 4. Task Creation, Update & Status Management (/api/tasks):');

    // List tasks
    const tasksListRes = await request('/api/tasks');
    assert(tasksListRes.status === 200, 'GET /api/tasks returns 200 OK');
    assert(Array.isArray(tasksListRes.body.data) && tasksListRes.body.data.length >= 5, 'GET /api/tasks returns task array');

    // Filter tasks by status
    const inProgressTasksRes = await request('/api/tasks?status=in-progress');
    assert(inProgressTasksRes.status === 200, 'GET /api/tasks?status=in-progress returns 200 OK');
    assert(inProgressTasksRes.body.data.every((t: any) => t.status === 'in-progress'), 'All filtered tasks have status in-progress');

    // Filter tasks by priority
    const criticalTasksRes = await request('/api/tasks?priority=Critical');
    assert(criticalTasksRes.status === 200, 'GET /api/tasks?priority=Critical returns 200 OK');
    assert(criticalTasksRes.body.data.every((t: any) => t.priority === 'Critical'), 'All filtered tasks have priority Critical');

    // Get task by key (e.g. PULSE-101)
    const taskByKeyRes = await request('/api/tasks/PULSE-101');
    assert(taskByKeyRes.status === 200, 'GET /api/tasks/PULSE-101 returns 200 OK (Look up by task key)');
    assert(taskByKeyRes.body.data.id === 'task-101', 'Retrieved task ID matches task-101');
    assert(taskByKeyRes.body.data.project !== undefined, 'Task contains populated project relation');
    assert(taskByKeyRes.body.data.assignee !== undefined, 'Task contains populated assignee relation');

    // Create task (Valid)
    const newTaskPayload = {
      title: 'Implement Dark Mode Theme Switcher and Sound Effects',
      description: 'Provide seamless dark/light theme switching with custom synthesizer audio triggers.',
      projectId: 'proj-1',
      assigneeId: 'user-1',
      reporterId: 'user-2',
      type: 'Story',
      status: 'todo',
      priority: 'High',
      storyPoints: 5,
      estimatedHours: 6,
      tags: ['Frontend', 'Theme', 'Audio'],
      sprint: 'Sprint 24 - Turbo Launch',
    };
    const createTaskRes = await request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(newTaskPayload),
    });
    assert(createTaskRes.status === 201, 'POST /api/tasks returns 201 CREATED');
    assert(createTaskRes.body.data.title === newTaskPayload.title, 'Created task has correct title');
    assert(createTaskRes.body.data.key.startsWith('PULSE-'), 'Created task has generated project key prefix');
    assert(createTaskRes.body.data.statusHistory.length === 1, 'Created task initializes statusHistory');
    const createdTaskId = createTaskRes.body.data.id;

    // Create task validation (Missing title)
    const invalidTaskRes = await request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        projectId: 'proj-1',
      }),
    });
    assert(invalidTaskRes.status === 400, 'POST /api/tasks without title returns 400 BAD REQUEST');

    // Update task (PATCH)
    const patchTaskRes = await request(`/api/tasks/${createdTaskId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        priority: 'Critical',
        storyPoints: 8,
      }),
    });
    assert(patchTaskRes.status === 200, 'PATCH /api/tasks/:id returns 200 OK');
    assert(patchTaskRes.body.data.priority === 'Critical', 'Task priority updated to Critical');
    assert(patchTaskRes.body.data.storyPoints === 8, 'Task story points updated to 8');

    // Dedicated Status Management (PATCH /api/tasks/:id/status) -> 'in-progress'
    const statusToProgressRes = await request(`/api/tasks/${createdTaskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'in-progress',
        changedBy: 'user-1',
        note: 'Starting development work',
      }),
    });
    assert(statusToProgressRes.status === 200, 'PATCH /api/tasks/:id/status transition to in-progress returns 200 OK');
    assert(statusToProgressRes.body.data.status === 'in-progress', 'Task status is now in-progress');
    assert(statusToProgressRes.body.data.statusHistory.length === 2, 'Status transition recorded in history');

    // Dedicated Status Management -> 'in-review'
    const statusToReviewRes = await request(`/api/tasks/${createdTaskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'in-review',
        changedBy: 'user-1',
        note: 'PR #155 ready for review',
      }),
    });
    assert(statusToReviewRes.status === 200, 'PATCH /api/tasks/:id/status transition to in-review returns 200 OK');
    assert(statusToReviewRes.body.data.status === 'in-review', 'Task status is now in-review');

    // Dedicated Status Management -> 'done' (Check completedAt timestamp)
    const statusToDoneRes = await request(`/api/tasks/${createdTaskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'done',
        changedBy: 'user-2',
        note: 'Code reviewed and merged to main',
      }),
    });
    assert(statusToDoneRes.status === 200, 'PATCH /api/tasks/:id/status transition to done returns 200 OK');
    assert(statusToDoneRes.body.data.status === 'done', 'Task status is now done');
    assert(statusToDoneRes.body.data.completedAt !== null, 'completedAt timestamp set automatically when marked done');
    assert(statusToDoneRes.body.data.statusHistory.length === 4, 'Full status lifecycle history tracked accurately');

    // Dedicated Status Management -> Invalid Status Validation (422 Unprocessable Entity)
    const invalidStatusRes = await request(`/api/tasks/${createdTaskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'some-invalid-status',
      }),
    });
    assert(invalidStatusRes.status === 400 || invalidStatusRes.status === 422, 'PATCH /api/tasks/:id/status with invalid status rejected');

    // Bulk status update
    const bulkStatusRes = await request('/api/tasks/bulk-status', {
      method: 'POST',
      body: JSON.stringify({
        taskIds: ['task-101', 'task-105'],
        status: 'in-review',
        changedBy: 'user-1',
        note: 'Sprint batch review transition',
      }),
    });
    assert(bulkStatusRes.status === 200, 'POST /api/tasks/bulk-status returns 200 OK');
    assert(bulkStatusRes.body.data.updatedCount === 2, 'Bulk status updated 2 tasks');

    // Delete task
    const deleteTaskRes = await request(`/api/tasks/${createdTaskId}`, {
      method: 'DELETE',
    });
    assert(deleteTaskRes.status === 200, 'DELETE /api/tasks/:id returns 200 OK');

    // Verify task deleted
    const verifyDeletedTaskRes = await request(`/api/tasks/${createdTaskId}`);
    assert(verifyDeletedTaskRes.status === 404, 'GET deleted task returns 404 NOT FOUND');

    // ----------------------------------------------------
    // 5. ERROR HANDLING & STATUS CODES VERIFICATION
    // ----------------------------------------------------
    console.log('\n📌 5. Centralized Error Handling & Status Codes Verification:');

    // 404 for unknown route
    const unknownRouteRes = await request('/api/unknown-route-12345');
    assert(unknownRouteRes.status === 404, 'GET /api/unknown-route returns 404 NOT FOUND');
    assert(unknownRouteRes.body.success === false, 'Error response has success: false');
    assert(unknownRouteRes.body.error.code === 'NOT_FOUND', 'Error response has error.code = NOT_FOUND');
    assert(unknownRouteRes.body.timestamp !== undefined, 'Error response contains ISO timestamp');
    assert(unknownRouteRes.body.path !== undefined, 'Error response contains request path');

    // 400 for malformed JSON
    const malformedJsonRes = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ "title": "bad json", ',
    });
    const malformedBody = await malformedJsonRes.json();
    assert(malformedJsonRes.status === 400, 'POST with malformed JSON body returns 400 BAD REQUEST');
    assert(malformedBody.error.code === 'MALFORMED_JSON', 'Malformed JSON returns MALFORMED_JSON code');

  } catch (err) {
    console.error('Test execution exception:', err);
    failed++;
  } finally {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  }

  console.log('\n📊 ===================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED | ${passed + failed} TOTAL`);
  console.log('📊 ===================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();
