import { app } from '../app.ts';
import { initializeDatabase, reseedDatabase } from '../data/database.init.ts';
import { disconnectDatabase } from '../config/database.ts';
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
  console.log('🧪 RUNNING DEVPULSE REST API & DATABASE INTEGRATION SUITE');
  console.log('🧪 ===================================================\n');

  // Initialize DB and Seed Data
  await initializeDatabase();
  await reseedDatabase();

  // Start test server
  await new Promise<void>((resolve) => {
    server = app.listen(TEST_PORT, () => {
      baseUrl = `http://localhost:${TEST_PORT}`;
      resolve();
    });
  });

  try {
    // ----------------------------------------------------
    // 1. HEALTH & DATABASE TELEMETRY TESTS
    // ----------------------------------------------------
    console.log('\n📌 1. Health & Database Telemetry Endpoints:');

    const healthRes = await request('/api/health');
    assert(healthRes.status === 200, 'GET /api/health returns 200 OK');
    assert(healthRes.body.data.status === 'healthy', 'Health check returns healthy status');
    assert(healthRes.body.data.database !== undefined, 'Health check contains database telemetry');
    assert(healthRes.body.data.database.usersCount >= 4, 'Health check reports seeded users count');
    assert(healthRes.body.data.database.projectsCount >= 3, 'Health check reports seeded projects count');
    assert(healthRes.body.data.database.tasksCount >= 6, 'Health check reports seeded tasks count');

    const openApiRes = await request('/api/openapi.json');
    assert(openApiRes.status === 200, 'GET /api/openapi.json returns 200 OK');
    assert(openApiRes.body.openapi === '3.0.3', 'OpenAPI specification version is 3.0.3');

    // ----------------------------------------------------
    // 2. USER MANAGEMENT & SCHEMA VALIDATION TESTS
    // ----------------------------------------------------
    console.log('\n📌 2. User Management & Schema Validation (/api/users):');

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

    // Get non-existent user (404)
    const nonExistentUserRes = await request('/api/users/non-existent-user-id');
    assert(nonExistentUserRes.status === 404, 'GET /api/users/non-existent-user-id returns 404 NOT FOUND');
    assert(nonExistentUserRes.body.error.code === 'NOT_FOUND', 'Error response returns code NOT_FOUND');

    // Create user (201)
    const createUserRes = await request('/api/users', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Jordan Tech',
        handle: 'jordantech',
        email: 'jordan.tech@devpulse.io',
        role: 'DevOps Architect',
        team: 'Infrastructure',
        status: 'In the Zone',
      }),
    });
    assert(createUserRes.status === 201, 'POST /api/users returns 201 CREATED');
    assert(createUserRes.body.data.name === 'Jordan Tech', 'Created user has correct name');
    const createdUserId = createUserRes.body.data.id;

    // Create user with invalid email (400 validation error)
    const invalidEmailRes = await request('/api/users', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Invalid User',
        handle: 'invaliduser',
        email: 'not-an-email',
        role: 'QA Engineer',
        team: 'Quality',
      }),
    });
    assert(invalidEmailRes.status === 400, 'POST /api/users with invalid email returns 400 BAD REQUEST');
    assert(invalidEmailRes.body.error.code === 'VALIDATION_ERROR', 'Error code is VALIDATION_ERROR');

    // Create user with duplicate handle (409 conflict)
    const duplicateHandleRes = await request('/api/users', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Duplicate Handle',
        handle: 'jordantech',
        email: 'different.email@devpulse.io',
        role: 'Engineer',
        team: 'Core',
      }),
    });
    assert(duplicateHandleRes.status === 409, 'POST /api/users with duplicate handle returns 409 CONFLICT');
    assert(duplicateHandleRes.body.error.code === 'CONFLICT', 'Error code is CONFLICT');

    // Update user (200)
    const updateUserRes = await request(`/api/users/${createdUserId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'Vibecoding',
        velocityScore: 92,
      }),
    });
    assert(updateUserRes.status === 200, 'PATCH /api/users/:id returns 200 OK');
    assert(updateUserRes.body.data.status === 'Vibecoding', 'User status updated to Vibecoding');
    assert(updateUserRes.body.data.velocityScore === 92, 'User velocity score updated to 92');

    // Get user stats (200)
    const userStatsRes = await request('/api/users/user-1/stats');
    assert(userStatsRes.status === 200, 'GET /api/users/user-1/stats returns 200 OK');
    assert(userStatsRes.body.data.metrics.streakDays !== undefined, 'User stats contains streakDays metric');
    assert(userStatsRes.body.data.tasks.statusBreakdown !== undefined, 'User stats contains task summary breakdown');

    // Get user tasks (200)
    const userTasksRes = await request('/api/users/user-1/tasks');
    assert(userTasksRes.status === 200, 'GET /api/users/user-1/tasks returns 200 OK');
    assert(Array.isArray(userTasksRes.body.data), 'User tasks is an array');

    // Delete user (200)
    const deleteUserRes = await request(`/api/users/${createdUserId}`, {
      method: 'DELETE',
    });
    assert(deleteUserRes.status === 200, 'DELETE /api/users/:id returns 200 OK');

    // ----------------------------------------------------
    // 3. PROJECT MANAGEMENT & RELATIONAL MODELING
    // ----------------------------------------------------
    console.log('\n📌 3. Project Management & Relational Modeling (/api/projects):');

    // List projects
    const projectsListRes = await request('/api/projects');
    assert(projectsListRes.status === 200, 'GET /api/projects returns 200 OK');
    assert(Array.isArray(projectsListRes.body.data) && projectsListRes.body.data.length >= 3, 'GET /api/projects returns project list');

    // Get single project with populated relations & metrics
    const singleProjRes = await request('/api/projects/proj-1');
    assert(singleProjRes.status === 200, 'GET /api/projects/proj-1 returns 200 OK');
    assert(singleProjRes.body.data.taskSummary !== undefined, 'Project includes task summary metrics');
    assert(singleProjRes.body.data.taskSummary.totalTasks >= 1, 'Project calculates total tasks count');
    assert(Array.isArray(singleProjRes.body.data.members), 'Project populates member objects');
    assert(singleProjRes.body.data.owner !== undefined, 'Project populates owner object');

    // Create project (201)
    const createProjectRes = await request('/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: 'API Gateway Modernization',
        key: 'GATEWAY',
        description: 'Next-generation low-latency API gateway proxy layer',
        primaryLanguage: 'Go',
        ownerId: 'user-1',
        memberIds: ['user-1', 'user-2'],
      }),
    });
    assert(createProjectRes.status === 201, 'POST /api/projects returns 201 CREATED');
    assert(createProjectRes.body.data.key === 'GATEWAY', 'Created project key is GATEWAY');
    const createdProjectId = createProjectRes.body.data.id;

    // Create project with duplicate key (409 conflict)
    const duplicateProjKeyRes = await request('/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Duplicate Gateway',
        key: 'GATEWAY',
        description: 'Testing collision',
        ownerId: 'user-1',
      }),
    });
    assert(duplicateProjKeyRes.status === 409, 'POST /api/projects with duplicate key returns 409 CONFLICT');

    // Create project with non-existent owner (400)
    const invalidOwnerRes = await request('/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Orphan Project',
        key: 'ORPHAN',
        description: 'No owner',
        ownerId: 'non-existent-user',
      }),
    });
    assert(invalidOwnerRes.status === 400, 'POST /api/projects with non-existent owner returns 400 BAD REQUEST');

    // Get project tasks
    const projTasksRes = await request('/api/projects/proj-1/tasks');
    assert(projTasksRes.status === 200, 'GET /api/projects/proj-1/tasks returns 200 OK');
    assert(Array.isArray(projTasksRes.body.data), 'Project tasks returns task list');

    // Get project members
    const projMembersRes = await request('/api/projects/proj-1/members');
    assert(projMembersRes.status === 200, 'GET /api/projects/proj-1/members returns 200 OK');
    assert(Array.isArray(projMembersRes.body.data), 'Project members returns member list');

    // ----------------------------------------------------
    // 4. TASK CREATION, STATUS LIFECYCLE & RELATIONS
    // ----------------------------------------------------
    console.log('\n📌 4. Task Lifecycle, Schema Constraints & Relations (/api/tasks):');

    // List tasks
    const tasksListRes = await request('/api/tasks');
    assert(tasksListRes.status === 200, 'GET /api/tasks returns 200 OK');
    assert(Array.isArray(tasksListRes.body.data) && tasksListRes.body.data.length >= 6, 'GET /api/tasks returns task array');

    // Filter tasks by status
    const inProgressTasksRes = await request('/api/tasks?status=in-progress');
    assert(inProgressTasksRes.status === 200, 'GET /api/tasks?status=in-progress returns 200 OK');
    assert(inProgressTasksRes.body.data.every((t: any) => t.status === 'in-progress'), 'All filtered tasks have status in-progress');

    // Filter tasks by priority
    const criticalTasksRes = await request('/api/tasks?priority=Critical');
    assert(criticalTasksRes.status === 200, 'GET /api/tasks?priority=Critical returns 200 OK');
    assert(criticalTasksRes.body.data.every((t: any) => t.priority === 'Critical'), 'All filtered tasks have priority Critical');

    // Lookup task by Key (e.g. PULSE-101)
    const taskByKeyRes = await request('/api/tasks/PULSE-101');
    assert(taskByKeyRes.status === 200, 'GET /api/tasks/PULSE-101 returns 200 OK (Look up by task key)');
    assert(taskByKeyRes.body.data.id === 'task-101', 'Retrieved task ID matches task-101');
    assert(taskByKeyRes.body.data.project !== undefined, 'Task contains populated project relation');
    assert(taskByKeyRes.body.data.assignee !== undefined, 'Task contains populated assignee relation');
    assert(taskByKeyRes.body.data.reporter !== undefined, 'Task contains populated reporter relation');

    // Create task (201)
    const createTaskRes = await request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Implement OAuth2 PKCE Authorization Flow',
        description: 'Secure API gateway client authentication using OAuth2 PKCE standard.',
        projectId: createdProjectId,
        assigneeId: 'user-1',
        reporterId: 'user-1',
        type: 'Story',
        priority: 'High',
        storyPoints: 5,
        estimatedHours: 8,
      }),
    });
    assert(createTaskRes.status === 201, 'POST /api/tasks returns 201 CREATED');
    assert(createTaskRes.body.data.title === 'Implement OAuth2 PKCE Authorization Flow', 'Created task has correct title');
    assert(createTaskRes.body.data.key.startsWith('GATEWAY-'), 'Created task has generated project key prefix');
    assert(createTaskRes.body.data.statusHistory.length === 1, 'Created task initializes statusHistory');
    const createdTaskId = createTaskRes.body.data.id;

    // Create task without required title (400)
    const invalidTaskRes = await request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        projectId: createdProjectId,
      }),
    });
    assert(invalidTaskRes.status === 400, 'POST /api/tasks without title returns 400 BAD REQUEST');

    // Update task details (200)
    const updateTaskRes = await request(`/api/tasks/${createdTaskId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        priority: 'Critical',
        storyPoints: 8,
      }),
    });
    assert(updateTaskRes.status === 200, 'PATCH /api/tasks/:id returns 200 OK');
    assert(updateTaskRes.body.data.priority === 'Critical', 'Task priority updated to Critical');
    assert(updateTaskRes.body.data.storyPoints === 8, 'Task story points updated to 8');

    // Dedicated Status Transition: todo -> in-progress
    const statusTransitionRes1 = await request(`/api/tasks/${createdTaskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'in-progress',
        changedBy: 'user-1',
        note: 'Started development branch',
      }),
    });
    assert(statusTransitionRes1.status === 200, 'PATCH /api/tasks/:id/status transition to in-progress returns 200 OK');
    assert(statusTransitionRes1.body.data.status === 'in-progress', 'Task status is now in-progress');
    assert(statusTransitionRes1.body.data.statusHistory.length === 2, 'Status transition recorded in history');

    // Dedicated Status Transition: in-progress -> in-review
    const statusTransitionRes2 = await request(`/api/tasks/${createdTaskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'in-review',
        changedBy: 'user-1',
        note: 'PR #14 opened for review',
      }),
    });
    assert(statusTransitionRes2.status === 200, 'PATCH /api/tasks/:id/status transition to in-review returns 200 OK');
    assert(statusTransitionRes2.body.data.status === 'in-review', 'Task status is now in-review');

    // Dedicated Status Transition: in-review -> done (records completedAt)
    const statusTransitionRes3 = await request(`/api/tasks/${createdTaskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'done',
        changedBy: 'user-2',
        note: 'PR #14 approved & merged',
      }),
    });
    assert(statusTransitionRes3.status === 200, 'PATCH /api/tasks/:id/status transition to done returns 200 OK');
    assert(statusTransitionRes3.body.data.status === 'done', 'Task status is now done');
    assert(statusTransitionRes3.body.data.completedAt !== null, 'completedAt timestamp set automatically when marked done');
    assert(statusTransitionRes3.body.data.statusHistory.length === 4, 'Full status lifecycle history tracked accurately');

    // Dedicated Status Transition with invalid status (400 or 422)
    const invalidStatusRes = await request(`/api/tasks/${createdTaskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'invalid-status-name',
      }),
    });
    assert(invalidStatusRes.status === 400 || invalidStatusRes.status === 422, 'PATCH /api/tasks/:id/status with invalid status rejected');

    // Bulk status update
    const bulkStatusRes = await request('/api/tasks/bulk-status', {
      method: 'POST',
      body: JSON.stringify({
        taskIds: ['task-102', 'task-103'],
        status: 'in-progress',
        changedBy: 'user-1',
        note: 'Sprint batch move',
      }),
    });
    assert(bulkStatusRes.status === 200, 'POST /api/tasks/bulk-status returns 200 OK');
    assert(bulkStatusRes.body.data.updatedCount === 2, 'Bulk status updated 2 tasks');

    // Delete task (200)
    const deleteTaskRes = await request(`/api/tasks/${createdTaskId}`, {
      method: 'DELETE',
    });
    assert(deleteTaskRes.status === 200, 'DELETE /api/tasks/:id returns 200 OK');

    // Verify task deleted (404)
    const verifyDeletedTaskRes = await request(`/api/tasks/${createdTaskId}`);
    assert(verifyDeletedTaskRes.status === 404, 'GET deleted task returns 404 NOT FOUND');

    // ----------------------------------------------------
    // 5. CASCADING DELETES & RELATIONAL CLEANUP TESTS
    // ----------------------------------------------------
    console.log('\n📌 5. Cascading Deletion & Relational Cleanup:');

    // Create a temporary task on created project
    const tempTaskRes = await request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Cascade test child task',
        projectId: createdProjectId,
        reporterId: 'user-1',
      }),
    });
    const tempTaskId = tempTaskRes.body.data.id;
    assert(tempTaskRes.status === 201, 'Created child task for cascading delete test');

    // Delete project -> should cascade delete child tasks
    const deleteProjRes = await request(`/api/projects/${createdProjectId}`, {
      method: 'DELETE',
    });
    assert(deleteProjRes.status === 200, 'DELETE /api/projects/:id returns 200 OK');

    // Verify child task was cascaded and deleted
    const verifyCascadeRes = await request(`/api/tasks/${tempTaskId}`);
    assert(verifyCascadeRes.status === 404, 'Child task was cascade deleted when project was deleted');

    // ----------------------------------------------------
    // 6. CENTRALIZED ERROR HANDLING VERIFICATION
    // ----------------------------------------------------
    console.log('\n📌 6. Centralized Error Handling & Status Codes:');

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
    await disconnectDatabase();
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  }

  console.log('\n📊 ===================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED | ${passed + failed} TOTAL`);
  console.log('📊 ===================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests();
