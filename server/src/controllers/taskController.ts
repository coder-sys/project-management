import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define valid priority values
const VALID_PRIORITIES = ["Urgent", "High", "Medium", "Low", "Backlog"];

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.query;

    // Validate projectId if provided
    if (projectId) {
      const parsedProjectId = Number(projectId);
      if (isNaN(parsedProjectId)) {
        res.status(400).json({ message: 'Invalid project ID format' });
        return;
      }

      // Check if project exists
      const project = await prisma.project.findUnique({
        where: { id: parsedProjectId }
      });

      if (!project) {
        res.status(404).json({ message: 'Project not found' });
        return;
      }
    }

    // Build the query
    const where: any = {};
    if (projectId) {
      where.projectId = Number(projectId);
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        author: true,
        assignee: true,
        comments: true,
        attachments: true,
        project: true,
      },
    });

    // Ensure each task has a valid priority
    const processedTasks = tasks.map((task: any) => ({
      ...task,
      priority: task.priority && VALID_PRIORITIES.includes(task.priority) 
        ? task.priority 
        : "Backlog"
    }));

    res.json(processedTasks);
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ 
      message: 'An error occurred while fetching tasks',
      error: error.message
    });
  }
};

export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    title,
    description,
    status,
    priority,
    tags,
    startDate,
    dueDate,
    points,
    projectId,
    authorUserId,
    assignedUserId,
  } = req.body;
  try {
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        tags,
        startDate,
        dueDate,
        points,
        projectId,
        authorUserId,
        assignedUserId,
      },
    });
    res.status(201).json(newTask);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating a task: ${error.message}` });
  }
};

export const updateTaskStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const { status } = req.body;
  try {
    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data: {
        status: status,
      },
    });
    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: `Error updating task: ${error.message}` });
  }
};

export const getUserTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { authorUserId: Number(userId) },
          { assignedUserId: Number(userId) },
        ],
      },
      include: {
        author: true,
        assignee: true,
        comments: true,
        attachments: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
    });
    res.json(tasks);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving user's tasks: ${error.message}` });
  }
};
