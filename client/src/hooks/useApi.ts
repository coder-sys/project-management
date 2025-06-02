import axios from 'axios';
import { useState, useEffect } from 'react';
import { API_CONFIG } from '@/lib/apiConfig';
import { Priority, Task, Project } from '@/state/api';

const api = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
});

const API_ENDPOINTS = {
  tasks: '/tasks',
  projects: '/projects',
  users: '/users',
  teams: '/teams',
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
  }
};

export function useApi<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<T>(endpoint);
      setData(response.data);
      setIsError(false);
      setError(null);
    } catch (err) {
      setIsError(true);
      setError(err);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { data, isLoading, isError, error };
}

export function useTasks() {
  return useApi<Task[]>(API_ENDPOINTS.tasks);
}

export function useProjects() {
  return useApi<Project[]>(API_ENDPOINTS.projects);
}

interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: string;
  priority?: Priority;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  projectId?: number;
  authorUserId?: string;
  assignedUserId?: string;
}

export function useCreateTask() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const createTask = async (taskData: CreateTaskPayload) => {
    setIsLoading(true);
    try {
      const response = await api.post<Task>(API_ENDPOINTS.tasks, taskData);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { createTask, isLoading, error };
}
