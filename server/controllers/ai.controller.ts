import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service.ts';
import { ValidationError, BadRequestError } from '../middleware/errorHandler.ts';

export class AIController {
  /**
   * POST /api/ai/generate-tasks
   */
  public async generateTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { goal, projectKey, projectName, techStack, taskCount, count } = req.body;
      const requestedGoal = goal || req.body.prompt;
      const requestedCount = taskCount || count || 4;

      if (!requestedGoal || typeof requestedGoal !== 'string' || requestedGoal.trim().length === 0) {
        throw new ValidationError('A valid "goal" string is required for AI task generation.');
      }

      const result = await aiService.generateTasksForProject({
        goal: requestedGoal,
        projectKey,
        projectName,
        techStack: Array.isArray(techStack) ? techStack : undefined,
        taskCount: typeof requestedCount === 'number' ? requestedCount : 4,
      });

      return res.status(200).json({
        success: true,
        message: `Successfully generated ${result.tasks.length} tasks.`,
        data: {
          tasks: result.tasks,
          source: result.source,
          count: result.tasks.length,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/ai/summarize
   */
  public async summarizeTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, description, status, priority, storyPoints, tags } = req.body;

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        throw new ValidationError('A valid task "title" is required for summarization.');
      }

      const result = await aiService.summarizeTask({
        title,
        description,
        status,
        priority,
        storyPoints,
        tags: Array.isArray(tags) ? tags : undefined,
      });

      const keyDeliverables = result.summary.keyPoints || result.summary.recommendedNextSteps || [];
      const suggestedNextStep = (result.summary.recommendedNextSteps && result.summary.recommendedNextSteps[0]) || 'Execute implementation and write automated tests.';

      return res.status(200).json({
        success: true,
        message: 'Task summary successfully generated.',
        data: {
          summary: result.summary.summary,
          keyDeliverables,
          keyPoints: result.summary.keyPoints,
          potentialRisks: result.summary.potentialRisks,
          recommendedNextSteps: result.summary.recommendedNextSteps,
          suggestedNextStep,
          estimatedComplexity: result.summary.estimatedComplexity,
          source: result.source,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/ai/project-description
   */
  public async generateProjectDescription(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, key, primaryLanguage, techStack, summaryHint, keywords } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new ValidationError('A valid project "name" is required to generate description.');
      }

      const result = await aiService.generateProjectDescription({
        name,
        key,
        primaryLanguage,
        techStack: Array.isArray(techStack) ? techStack : undefined,
        summaryHint: summaryHint || keywords,
      });

      return res.status(200).json({
        success: true,
        message: 'Project description successfully generated.',
        data: {
          description: result.result.description,
          architectureHighlights: result.result.architectureHighlights,
          suggestedDeliverables: result.result.suggestedDeliverables,
          recommendedTechStack: result.result.recommendedTechStack,
          source: result.source,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/ai/productivity-coach
   */
  public async getProductivitySuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const { tasks, velocityScore, userName } = req.body;

      const result = await aiService.getProductivitySuggestions({
        tasks: Array.isArray(tasks) ? tasks : [],
        velocityScore: typeof velocityScore === 'number' ? velocityScore : undefined,
        userName,
      });

      const inProgressCount = Array.isArray(tasks) ? tasks.filter((t: any) => t.status === 'in-progress' || t.status === 'In Progress').length : 0;
      const inReviewCount = Array.isArray(tasks) ? tasks.filter((t: any) => t.status === 'in-review' || t.status === 'In Review').length : 0;

      let bottleneckAnalysis = 'Sprint flow is balanced with healthy work-in-progress concurrency.';
      if (inProgressCount > 3) {
        bottleneckAnalysis = `High WIP detected: ${inProgressCount} tasks are currently in progress simultaneously. Swarming is recommended.`;
      } else if (inReviewCount > 2) {
        bottleneckAnalysis = `Review bottleneck: ${inReviewCount} pull requests/tasks awaiting review. Prioritize peer code reviews.`;
      }

      return res.status(200).json({
        success: true,
        message: `Generated ${result.suggestions.length} productivity suggestions.`,
        data: {
          suggestions: result.suggestions,
          bottleneckAnalysis,
          source: result.source,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/ai/prioritize
   */
  public async prioritizeTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { tasks } = req.body;

      if (!Array.isArray(tasks)) {
        throw new ValidationError('"tasks" array is required for AI prioritization.');
      }

      const result = await aiService.prioritizeTasks({ tasks });

      // Build sorted list of tasks based on priority scores
      const priorityWeights: Record<string, number> = { Critical: 100, High: 75, Medium: 50, Low: 25 };
      const scoreMap = new Map<string, number>();
      result.prioritized.forEach((p) => {
        const score = (p.urgencyScore || 50) * 0.6 + (p.impactScore || 50) * 0.4 + (priorityWeights[p.recommendedPriority] || 50);
        scoreMap.set(p.taskId, score);
      });

      const reorderedTasks = [...tasks].sort((a, b) => {
        const scoreA = scoreMap.get(a.id) ?? (priorityWeights[a.priority] || 50);
        const scoreB = scoreMap.get(b.id) ?? (priorityWeights[b.priority] || 50);
        return scoreB - scoreA;
      });

      return res.status(200).json({
        success: true,
        message: `Successfully analyzed and prioritized ${result.prioritized.length} tasks.`,
        data: {
          prioritized: result.prioritized,
          reorderedTasks,
          source: result.source,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/ai/copilot
   */
  public async chatWithCopilot(req: Request, res: Response, next: NextFunction) {
    try {
      const { messages, prompt, context } = req.body;

      let chatMessages: { role: 'user' | 'assistant' | 'system'; content: string }[] = [];

      if (Array.isArray(messages) && messages.length > 0) {
        chatMessages = messages;
      } else if (typeof prompt === 'string' && prompt.trim().length > 0) {
        chatMessages = [{ role: 'user', content: prompt.trim() }];
      } else {
        throw new ValidationError('A non-empty "prompt" or "messages" array is required.');
      }

      const result = await aiService.chatWithCopilot({
        messages: chatMessages,
        context,
      });

      return res.status(200).json({
        success: true,
        data: {
          reply: result.reply,
          source: result.source,
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const aiController = new AIController();
