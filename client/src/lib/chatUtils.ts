import OpenAI from 'openai';
import { fetchAuthSession } from 'aws-amplify/auth';

// Type definitions
type Task = {
  id: number;
  title: string;
  projectId: number;
  status?: string;
  dueDate?: string;
  priority?: string;
};

type Project = {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  tasks: Task[];
};

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // This is needed for client-side usage
});

// Fetch data with error handling
async function fetchData(): Promise<Project[]> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken;

    if (!token) {
      throw new Error('Not authenticated');
    }

    // Fetch projects
    const projectsRes = await fetch(
      'https://khgs1vuyu8.execute-api.us-east-1.amazonaws.com/prod/projects',
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!projectsRes.ok) {
      throw new Error('Failed to fetch projects');
    }

    const projects: Project[] = await projectsRes.json();

    // Fetch tasks for each project
    const tasksPromises = projects.map(async (project) => {
      const tasksRes = await fetch(
        `https://khgs1vuyu8.execute-api.us-east-1.amazonaws.com/prod/tasks?projectId=${project.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await tasksRes.json();
      return tasksRes.ok ? (data as Task[]) : [];
    });

    const tasksResults = await Promise.all(tasksPromises);

    return projects.map((project, index) => ({
      ...project,
      tasks: tasksResults[index] || [],
    }));
  } catch (error) {
    console.error('Data fetching failed:', error);
    throw error;
  }
}

export async function generateChatResponse(message: string): Promise<string> {
  if (!message?.trim()) {
    throw new Error('Message is required');
  }

  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    throw new Error('OpenAI API key not found. Please set the NEXT_PUBLIC_OPENAI_API_KEY environment variable.');
  }

  // Fetch data
  const projects = await fetchData();
  const currentDate = new Date().toLocaleDateString();
  const projectCount = projects.length;
  const totalTasks = projects.reduce((acc, p) => acc + p.tasks.length, 0);

  // Prepare context for the AI
  const projectDetails = projects.map((p: Project) => {
    const taskDetails = p.tasks.map((t: Task) => 
      `   • [${t.status || 'No status'}] ${t.title} - Priority: ${t.priority || 'Not set'}, Due: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'Not set'}`
    ).join('\n');

    return `
📂 Project: ${p.name}
   Description: ${p.description || 'N/A'}
   Status: ${p.endDate ? 'Completed' : 'Active'}
   Timeline: ${p.startDate ? new Date(p.startDate).toLocaleDateString() : 'Not set'} to ${p.endDate ? new Date(p.endDate).toLocaleDateString() : 'Not set'}
   Tasks (${p.tasks.length}):
${taskDetails}`;
  }).join('\n');

  const systemPrompt = `You are an AI chatbot designed to help users query information about projects and tasks in the project management platform. You have access to the following data (as of ${currentDate}):

Summary:
- Total Projects: ${projectCount}
- Total Tasks: ${totalTasks}
- Active Projects: ${projects.filter((p) => !p.endDate).length}
- Completed Projects: ${projects.filter((p) => p.endDate).length}

Project Details:${projectDetails}

Please provide helpful and concise answers about the projects and tasks shown above. You can discuss status, deadlines, priorities, and project progress.`;

  // Generate AI response
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return completion.choices[0].message.content || 'Sorry, I could not generate a response.';
}
