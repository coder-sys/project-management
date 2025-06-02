import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProjectsAndTasks = async () => {
  try {
    // Get all projects with their details
    const projects = await prisma.project.findMany({
      include: {
        tasks: {
          include: {
            author: true,
            assignee: true,
            taskAssignments: {
              include: {
                user: true,
              },
            },
            comments: {
              include: {
                user: true,
              },
            },
            attachments: true,
          },
        },
        projectTeams: {
          include: {
            team: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    // Transform the data to a more readable format
    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      teams: project.projectTeams.map((pt) => ({
        teamId: pt.team.id,
        teamName: pt.team.teamName,
        members: pt.team.user.map((user) => ({
          id: user.userId,
          username: user.username,
          profilePicture: user.profilePictureUrl,
        })),
      })),
      tasks: project.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        startDate: task.startDate,
        dueDate: task.dueDate,
        points: task.points,
        author: {
          id: task.author.userId,
          username: task.author.username,
        },
        assignee: task.assignee
          ? {
              id: task.assignee.userId,
              username: task.assignee.username,
            }
          : null,
        assignedUsers: task.taskAssignments.map((ta) => ({
          id: ta.user.userId,
          username: ta.user.username,
        })),
        comments: task.comments.map((comment) => ({
          id: comment.id,
          text: comment.text,
          user: {
            id: comment.user.userId,
            username: comment.user.username,
          },
        })),
      })),
    }));
  } catch (error) {
    console.error('Error fetching projects and tasks:', error);
    throw error;
  }
};
