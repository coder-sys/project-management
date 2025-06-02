// Types for the application
export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export enum Priority {
  Urgent = "Urgent",
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Backlog = "Backlog"
}

export enum Status {
  ToDo = "To Do",
  WorkInProgress = "Work In Progress",
  UnderReview = "Under Review",
  Completed = "Completed"
}

export interface User {
  userId: number;
  username: string;
  email?: string;
  profilePictureUrl?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  projectId: number;
  authorUserId?: number;
  assignedUserId?: number;
  project?: Project;
  author?: User;
  assignee?: User;
}

export interface SearchResults {
  tasks?: Task[];
  projects?: Project[];
  users?: User[];
}
