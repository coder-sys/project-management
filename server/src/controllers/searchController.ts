import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const search = async (req: Request, res: Response): Promise<void> => {
  const { query } = req.query;
  try {
    const queryStr = (query as string || "").toLowerCase();

    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { title: { contains: queryStr, mode: "insensitive" } },
          { description: { contains: queryStr, mode: "insensitive" } },
        ],
      },
      include: {
        assignedTo: true,
        project: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: queryStr, mode: "insensitive" } },
          { description: { contains: queryStr, mode: "insensitive" } },
        ],
      },
      include: {
        team: true,
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: queryStr, mode: "insensitive" } },
          { email: { contains: queryStr, mode: "insensitive" } },
        ],
      },
      include: {
        _count: {
          select: {
            assignedTasks: true,
          },
        },
      },
    });

    res.json({ tasks, projects, users });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error performing search: ${error.message}` });
  }
};
