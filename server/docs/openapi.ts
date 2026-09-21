import { config } from '../config/index.ts';

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'DevPulse Users, Projects & Tasks REST API',
    version: '1.0.0',
    description:
      'Production-grade REST API backend powering Developer Telemetry, Project Workspaces, and Jira-style Kanban Task Management for DevPulse.',
    contact: {
      name: 'DevPulse Engineering Team',
      email: 'engineering@devpulse.io',
      url: 'https://devpulse.io',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}${config.apiPrefix}`,
      description: 'Local Development Server',
    },
  ],
  tags: [
    {
      name: 'Users',
      description: 'User profile management, team assignments, telemetry stats, and user tasks',
    },
    {
      name: 'Projects',
      description: 'Project workspaces, repositories, tech stacks, and team collaboration',
    },
    {
      name: 'Tasks',
      description: 'Jira-style task lifecycle, sprint assignments, and dedicated status transitions',
    },
    {
      name: 'Health & System',
      description: 'API health checks and system telemetry',
    },
    {
      name: 'AI Intelligence',
      description: 'AI-assisted task generation, summarization, project descriptions, productivity coach, and prioritization',
    },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health & System'],
        summary: 'System health check',
        description: 'Returns API server status, uptime, and database metrics.',
        responses: {
          '200': {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse',
                },
              },
            },
          },
        },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'List users with filtering and pagination',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search name, handle, bio, or skills' },
          { name: 'role', in: 'query', schema: { type: 'string' }, description: 'Filter by job role' },
          { name: 'team', in: 'query', schema: { type: 'string' }, description: 'Filter by team' },
          { name: 'status', in: 'query', schema: { type: 'string' }, description: 'Filter by developer status' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Items per page' },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['name', 'streakDays', 'velocityScore', 'storyPointsCompleted', 'createdAt'] }, description: 'Sort field' },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }, description: 'Sort direction' },
        ],
        responses: {
          '200': {
            description: 'List of users retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserListResponse',
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Create a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateUserInput',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SingleUserResponse',
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '409': { $ref: '#/components/responses/ConflictError' },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'User details',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SingleUserResponse' } } },
          },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Full update of a user',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserInput' } } },
        },
        responses: {
          '200': {
            description: 'User updated successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SingleUserResponse' } } },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '404': { $ref: '#/components/responses/NotFoundError' },
          '409': { $ref: '#/components/responses/ConflictError' },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Partial update of a user',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserInput' } } },
        },
        responses: {
          '200': {
            description: 'User updated successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SingleUserResponse' } } },
          },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete a user',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'User deleted successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessMessageResponse' } } },
          },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/users/{id}/stats': {
      get: {
        tags: ['Users'],
        summary: 'Get calculated metrics and task summary for a user',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'User statistics retrieved successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UserStatsResponse' } } },
          },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/users/{id}/tasks': {
      get: {
        tags: ['Users'],
        summary: 'Get all tasks assigned to a specific user',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'User tasks retrieved successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/TaskListResponse' } } },
          },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/projects': {
      get: {
        tags: ['Projects'],
        summary: 'List projects with filtering and pagination',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'ownerId', in: 'query', schema: { type: 'string' } },
          { name: 'language', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          '200': {
            description: 'List of projects retrieved successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ProjectListResponse' } } },
          },
        },
      },
      post: {
        tags: ['Projects'],
        summary: 'Create a new project workspace',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProjectInput' } } },
        },
        responses: {
          '201': {
            description: 'Project created successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SingleProjectResponse' } } },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '409': { $ref: '#/components/responses/ConflictError' },
        },
      },
    },
    '/projects/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Get project by ID (includes aggregated task summary & team members)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Project details retrieved successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SingleProjectResponse' } } },
          },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
      put: {
        tags: ['Projects'],
        summary: 'Full update of a project',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProjectInput' } } },
        },
        responses: {
          '200': {
            description: 'Project updated successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SingleProjectResponse' } } },
          },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
      patch: {
        tags: ['Projects'],
        summary: 'Partial update of a project',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProjectInput' } } },
        },
        responses: {
          '200': {
            description: 'Project updated successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SingleProjectResponse' } } },
          },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
      delete: {
        tags: ['Projects'],
        summary: 'Delete project and cascade delete associated tasks',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Project deleted successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessMessageResponse' } } },
          },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/projects/{id}/tasks': {
      get: {
        tags: ['Projects'],
        summary: 'Get all tasks within a project',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Tasks retrieved successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/TaskListResponse' } } },
          },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/projects/{id}/members': {
      get: {
        tags: ['Projects'],
        summary: 'Get all user members assigned to a project',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Project members list',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UserListResponse' } } },
          },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'List tasks with multi-field filtering and pagination',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'projectId', in: 'query', schema: { type: 'string' }, description: 'Project ID or Project Key' },
          { name: 'assigneeId', in: 'query', schema: { type: 'string' }, description: 'User ID or "unassigned"' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['backlog', 'todo', 'in-progress', 'in-review', 'done'] } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['Low', 'Medium', 'High', 'Critical'] } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['Story', 'Bug', 'Task', 'Epic', 'Refactor'] } },
          { name: 'sprint', in: 'query', schema: { type: 'string' } },
          { name: 'tag', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'dueDate', 'priority', 'storyPoints'] } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
        ],
        responses: {
          '200': {
            description: 'Tasks retrieved successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/TaskListResponse' } } },
          },
        },
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create a new task',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTaskInput' } } },
        },
        responses: {
          '201': {
            description: 'Task created successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SingleTaskResponse' } } },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Get task by ID or Key (e.g., PULSE-101)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Task retrieved successfully with relations',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SingleTaskResponse' } } },
          },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
      put: {
        tags: ['Tasks'],
        summary: 'Full update of a task',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateTaskInput' } } },
        },
        responses: {
          '200': {
            description: 'Task updated successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SingleTaskResponse' } } },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
      patch: {
        tags: ['Tasks'],
        summary: 'Partial update of a task',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateTaskInput' } } },
        },
        responses: {
          '200': {
            description: 'Task updated successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SingleTaskResponse' } } },
          },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete a task',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Task deleted successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessMessageResponse' } } },
          },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/tasks/{id}/status': {
      patch: {
        tags: ['Tasks'],
        summary: 'Dedicated Status Management (Kanban column transition)',
        description:
          'Updates task status (backlog / todo / in-progress / in-review / done), records status transition history, and updates completion metrics.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateTaskStatusInput',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Status updated and recorded in history',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SingleTaskResponse' } } },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '404': { $ref: '#/components/responses/NotFoundError' },
          '422': { $ref: '#/components/responses/UnprocessableEntityError' },
        },
      },
    },
    '/tasks/bulk-status': {
      post: {
        tags: ['Tasks'],
        summary: 'Bulk status update for multiple tasks (e.g. batch sprint transitions)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/BulkUpdateTaskStatusInput',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Bulk update completed',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/BulkUpdateTaskStatusResponse' } } },
          },
          '422': { $ref: '#/components/responses/UnprocessableEntityError' },
        },
      },
    },
    '/ai/generate-tasks': {
      post: {
        tags: ['AI Intelligence'],
        summary: 'Generate structured Jira tasks from feature goal',
        description: 'Breaks down a feature specification or project goal into 3-5 Jira tasks with story points and criteria.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['goal'],
                properties: {
                  goal: { type: 'string', example: 'Implement OAuth2 PKCE authorization flow' },
                  projectKey: { type: 'string', example: 'PULSE' },
                  projectName: { type: 'string', example: 'DevPulse Platform' },
                  techStack: { type: 'array', items: { type: 'string' }, example: ['React', 'Node.js'] },
                  taskCount: { type: 'integer', example: 4 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Tasks generated successfully' },
          '400': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/ai/summarize': {
      post: {
        tags: ['AI Intelligence'],
        summary: 'Summarize task details and progress',
        description: 'Generates executive summary, key risks, and next steps for a task.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', example: 'Refactor WebSocket Telemetry Connection' },
                  description: { type: 'string' },
                  status: { type: 'string', example: 'in-progress' },
                  priority: { type: 'string', example: 'High' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Task summarized successfully' },
          '400': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/ai/project-description': {
      post: {
        tags: ['AI Intelligence'],
        summary: 'Generate AI project description & architecture scope',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Cloud Telemetry Engine' },
                  primaryLanguage: { type: 'string', example: 'TypeScript' },
                  techStack: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Project description generated' },
        },
      },
    },
    '/ai/productivity-coach': {
      post: {
        tags: ['AI Intelligence'],
        summary: 'Get real-time productivity & sprint coach suggestions',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  tasks: { type: 'array', items: { type: 'object' } },
                  velocityScore: { type: 'number', example: 88 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Productivity suggestions retrieved' },
        },
      },
    },
    '/ai/prioritize': {
      post: {
        tags: ['AI Intelligence'],
        summary: 'Prioritize task backlog using urgency and impact analysis',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['tasks'],
                properties: {
                  tasks: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Tasks prioritized successfully' },
        },
      },
    },
    '/ai/copilot': {
      post: {
        tags: ['AI Intelligence'],
        summary: 'Interactive AI Developer Copilot conversation',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['messages'],
                properties: {
                  messages: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        role: { type: 'string', enum: ['user', 'assistant', 'system'] },
                        content: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Copilot response returned' },
        },
      },
    },
  },
  components: {
    responses: {
      ValidationError: {
        description: 'Input validation failed',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'One or more validation constraints failed',
                details: [{ field: 'email', message: 'email format is invalid', location: 'body' }],
              },
              timestamp: '2026-09-04T00:00:00.000Z',
              path: '/api/users',
            },
          },
        },
      },
      NotFoundError: {
        description: 'Requested resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              error: { code: 'NOT_FOUND', message: "Task with ID 'task-999' was not found" },
              timestamp: '2026-09-04T00:00:00.000Z',
              path: '/api/tasks/task-999',
            },
          },
        },
      },
      ConflictError: {
        description: 'Resource conflict or duplicate key',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              error: { code: 'CONFLICT', message: "User with email 'alex.rivera@devpulse.io' already exists" },
              timestamp: '2026-09-04T00:00:00.000Z',
              path: '/api/users',
            },
          },
        },
      },
      UnprocessableEntityError: {
        description: 'Invalid status transition or business rule violation',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              success: false,
              error: { code: 'UNPROCESSABLE_ENTITY', message: "Invalid status 'invalid-status'. Allowed statuses: backlog, todo, in-progress, in-review, done" },
              timestamp: '2026-09-04T00:00:00.000Z',
              path: '/api/tasks/task-101/status',
            },
          },
        },
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Validation failed' },
              details: { type: 'array', items: { type: 'object' } },
            },
          },
          timestamp: { type: 'string', example: '2026-09-04T00:00:00.000Z' },
          path: { type: 'string', example: '/api/users' },
        },
      },
      SuccessMessageResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Resource deleted successfully' },
          timestamp: { type: 'string' },
          path: { type: 'string' },
        },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'healthy' },
              uptime: { type: 'number', example: 124.5 },
              version: { type: 'string', example: '1.0.0' },
              counts: {
                type: 'object',
                properties: {
                  users: { type: 'integer', example: 4 },
                  projects: { type: 'integer', example: 3 },
                  tasks: { type: 'integer', example: 6 },
                },
              },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'user-1' },
          name: { type: 'string', example: 'Alex Rivera' },
          handle: { type: 'string', example: '@arivera_dev' },
          email: { type: 'string', example: 'alex.rivera@devpulse.io' },
          avatar: { type: 'string' },
          role: { type: 'string', example: 'Staff Frontend Architect' },
          team: { type: 'string', example: 'Core Platform & DX' },
          status: { type: 'string', example: 'In the Zone' },
          statusColor: { type: 'string', example: '#10b981' },
          streakDays: { type: 'integer', example: 42 },
          storyPointsCompleted: { type: 'integer', example: 184 },
          totalCommitsToday: { type: 'integer', example: 14 },
          velocityScore: { type: 'integer', example: 98 },
          focusMinutesToday: { type: 'integer', example: 320 },
          bio: { type: 'string' },
          skills: { type: 'array', items: { type: 'string' } },
        },
      },
      CreateUserInput: {
        type: 'object',
        required: ['name', 'handle', 'email', 'role', 'team'],
        properties: {
          name: { type: 'string', example: 'Jane Foster' },
          handle: { type: 'string', example: '@janefoster' },
          email: { type: 'string', example: 'jane.foster@devpulse.io' },
          role: { type: 'string', example: 'Full Stack Engineer' },
          team: { type: 'string', example: 'Developer Experience' },
          avatar: { type: 'string' },
          status: { type: 'string', example: 'In the Zone' },
          bio: { type: 'string', example: 'Full stack wizard and TypeScript enthusiast.' },
          skills: { type: 'array', items: { type: 'string' }, example: ['TypeScript', 'React', 'Node.js'] },
        },
      },
      UpdateUserInput: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          handle: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string' },
          team: { type: 'string' },
          status: { type: 'string' },
          bio: { type: 'string' },
          skills: { type: 'array', items: { type: 'string' } },
        },
      },
      SingleUserResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { $ref: '#/components/schemas/User' },
          timestamp: { type: 'string' },
          path: { type: 'string' },
        },
      },
      UserListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              page: { type: 'integer' },
              limit: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
        },
      },
      UserStatsResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              user: { type: 'object' },
              metrics: { type: 'object' },
              tasks: {
                type: 'object',
                properties: {
                  totalAssigned: { type: 'integer' },
                  statusBreakdown: { type: 'object' },
                  totalStoryPoints: { type: 'integer' },
                  completedStoryPoints: { type: 'integer' },
                  completionRate: { type: 'number' },
                },
              },
            },
          },
        },
      },
      CreateProjectInput: {
        type: 'object',
        required: ['name', 'key', 'description', 'ownerId'],
        properties: {
          name: { type: 'string', example: 'DevPulse Mobile App' },
          key: { type: 'string', example: 'MOBILE' },
          description: { type: 'string', example: 'Cross-platform developer companion app for iOS and Android.' },
          ownerId: { type: 'string', example: 'user-1' },
          primaryLanguage: { type: 'string', example: 'TypeScript' },
          languages: { type: 'array', items: { type: 'string' }, example: ['TypeScript', 'Swift', 'Kotlin'] },
          frameworks: { type: 'array', items: { type: 'string' }, example: ['React Native', 'Expo'] },
          memberIds: { type: 'array', items: { type: 'string' }, example: ['user-1', 'user-2'] },
        },
      },
      UpdateProjectInput: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['Active Sprint', 'In Progress', 'Completed', 'Maintained', 'Planning'] },
          primaryLanguage: { type: 'string' },
          memberIds: { type: 'array', items: { type: 'string' } },
        },
      },
      SingleProjectResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object' },
          timestamp: { type: 'string' },
          path: { type: 'string' },
        },
      },
      ProjectListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'array', items: { type: 'object' } },
          meta: { type: 'object' },
        },
      },
      CreateTaskInput: {
        type: 'object',
        required: ['title', 'projectId'],
        properties: {
          title: { type: 'string', example: 'Implement Dark Mode CSS Variables' },
          description: { type: 'string', example: 'Define unified color tokens and contrast-compliant surface palettes.' },
          projectId: { type: 'string', example: 'proj-1' },
          assigneeId: { type: 'string', example: 'user-1' },
          type: { type: 'string', enum: ['Story', 'Bug', 'Task', 'Epic', 'Refactor'], default: 'Task' },
          status: { type: 'string', enum: ['backlog', 'todo', 'in-progress', 'in-review', 'done'], default: 'todo' },
          priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
          storyPoints: { type: 'number', example: 5 },
          estimatedHours: { type: 'number', example: 8 },
          tags: { type: 'array', items: { type: 'string' }, example: ['CSS', 'Frontend', 'Theming'] },
          sprint: { type: 'string', example: 'Sprint 24' },
          dueDate: { type: 'string', example: '2026-09-15' },
        },
      },
      UpdateTaskInput: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          assigneeId: { type: 'string' },
          status: { type: 'string', enum: ['backlog', 'todo', 'in-progress', 'in-review', 'done'] },
          priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Critical'] },
          storyPoints: { type: 'number' },
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
      UpdateTaskStatusInput: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['backlog', 'todo', 'in-progress', 'in-review', 'done'], example: 'in-progress' },
          changedBy: { type: 'string', example: 'user-1' },
          note: { type: 'string', example: 'Started working on branch feature/dark-mode' },
        },
      },
      BulkUpdateTaskStatusInput: {
        type: 'object',
        required: ['taskIds', 'status'],
        properties: {
          taskIds: { type: 'array', items: { type: 'string' }, example: ['task-101', 'task-105'] },
          status: { type: 'string', enum: ['backlog', 'todo', 'in-progress', 'in-review', 'done'], example: 'done' },
          changedBy: { type: 'string', example: 'user-1' },
          note: { type: 'string', example: 'Sprint closed' },
        },
      },
      SingleTaskResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object' },
          timestamp: { type: 'string' },
          path: { type: 'string' },
        },
      },
      TaskListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'array', items: { type: 'object' } },
          meta: { type: 'object' },
        },
      },
      BulkUpdateTaskStatusResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              updatedCount: { type: 'integer', example: 2 },
              tasks: { type: 'array', items: { type: 'object' } },
              notFoundIds: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
  },
};
