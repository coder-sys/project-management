"use client";

import React, { useMemo, useState } from "react";
import Header from "@/components/Header";
import ModalNewTask from "@/components/ModalNewTask";
import { dataGridClassNames } from "@/lib/utils";
import { useTheme } from "@mui/material/styles";
import { Typography, Paper } from "@mui/material";
import { DateRange } from "@mui/x-date-pickers-pro/models";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DataGrid, GridColDef, GridValueFormatterParams, GridRenderCellParams } from "@mui/x-data-grid";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { startOfDay, endOfDay, format, isWithinInterval, parseISO, 
         addDays, eachDayOfInterval } from "date-fns";
import { Priority, Project, Task, useGetTasksQuery, useGetProjectsQuery } from "@/state/api";

// Color constants for visualization
const COLORS = {
  Urgent: "#ef4444",  // red
  High: "#f97316",    // orange
  Medium: "#eab308",  // yellow
  Low: "#22c55e",     // green
};

// Constants
const STATUS_COLORS = {
  Completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
  "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
  "Under Review": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-200",
  Default: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200"
};

interface ProjectPriorityCount {
  Urgent: number;
  High: number;
  Medium: number;
  Low: number;
  [key: string]: number;
}

interface TrendPoint {
  date: string;
  count: number;
}

interface PriorityTrend {
  date: string;
  Urgent: number;
  High: number;
  Medium: number;
  Low: number;
}

interface CompletionTrend {
  date: string;
  completed: number;
  total: number;
  rate: number;
}

interface ProcessedData {
  tasksByPriority: Array<{
    name: string;
    Urgent: number;
    High: number;
    Medium: number;
    Low: number;
  }>;
  tasksByProject: Array<{ name: string; value: number }>;
  projectPriorities: Array<{
    name: string;
    Urgent: number;
    High: number;
    Medium: number;
    Low: number;
  }>;
  stats: {
    totalTasks: number;
    completedTasks: number;
    activeProjects: number;
    urgentHighTasks: number;
  };
}

const defaultProcessedData: ProcessedData = {
  tasksByPriority: [{
    name: "Priority Distribution",
    Urgent: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  }],
  tasksByProject: [],
  projectPriorities: [],
  stats: {
    totalTasks: 0,
    completedTasks: 0,
    activeProjects: 0,
    urgentHighTasks: 0,
  },
};

const ReusablePriorityPage: React.FC<Props> = ({ priority }): JSX.Element => {
  // 1. All hooks declarations first
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("priority");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("0");

  // 2. API queries
  const { data: tasks = [], isLoading } = useGetTasksQuery(
    selectedProjectId === "0" ? {} : { projectId: parseInt(selectedProjectId) }
  );
  const { data: projects = [] } = useGetProjectsQuery();

  // 3. Memoized calculations
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];
    
    if (dateRange[0] && dateRange[1]) {
      const start = startOfDay(dateRange[0]);
      const end = endOfDay(dateRange[1]);
      filtered = filtered.filter((task: Task) =>
        task.createdAt && isWithinInterval(new Date(task.createdAt), { start, end })
      );
    }

    if (priority) {
      filtered = filtered.filter((task: Task) => task.priority === priority);
    }

    // Sort tasks
    return [...filtered].sort((a: Task, b: Task) => {
      if (sortBy === "priority") {
        const priorityOrder = { "Urgent": 0, "High": 1, "Medium": 2, "Low": 3 };
        const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
        const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
        return sortDirection === "asc" ? priorityA - priorityB : priorityB - priorityA;
      }
      if (sortBy === "project") {
        const projectA = projects.find((p) => p.id === a.projectId);
        const projectB = projects.find((p) => p.id === b.projectId);
        const projectNameA = projectA?.name || '';
        const projectNameB = projectB?.name || '';
        const comparison = projectNameA.localeCompare(projectNameB);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      return a.title.localeCompare(b.title);
    });
  }, [tasks, dateRange, priority, sortBy, sortDirection, projects]);
  
  const processedData = useMemo(() => {
    if (!filteredTasks?.length) return defaultProcessedData;

    // Count tasks by project
    const projectCount = filteredTasks.reduce((acc: { [key: string]: number }, task: Task) => {
      const projectId = task?.projectId;
      const projectName = projectId ? (projects?.find((p: Project) => p?.id === projectId)?.name || "Unknown") : "Unknown";
      acc[projectName] = (acc[projectName] || 0) + 1;
      return acc;
    }, {});

    // Count urgent and high priority tasks
    const urgentHighTasks = filteredTasks.filter(
      (t: Task) => t.priority === "Urgent" || t.priority === "High"
    ).length;

    // Project priorities visualization data
    const projectPriorities = Object.entries(
      filteredTasks.reduce((acc: { [key: string]: ProjectPriorityCount }, task: Task) => {
        const projectName = task.projectId ? (projects?.find((p) => p.id === task.projectId)?.name || "Unknown") : "Unknown";
        if (!acc[projectName]) {
          acc[projectName] = {
            Urgent: 0,
            High: 0,
            Medium: 0,
            Low: 0,
          };
        }
        if (task.priority) {
          acc[projectName][task.priority as keyof ProjectPriorityCount] = 
            (acc[projectName][task.priority as keyof ProjectPriorityCount] || 0) + 1;
        }
        return acc;
      }, {})
    ).map(([name, priorities]) => ({
      name,
      ...priorities,
    }));

    return {
      tasksByPriority: [
        {
          name: "Priority Distribution",
          Urgent: filteredTasks.filter((t: Task) => t.priority === "Urgent").length,
          High: filteredTasks.filter((t: Task) => t.priority === "High").length,
          Medium: filteredTasks.filter((t: Task) => t.priority === "Medium").length,
          Low: filteredTasks.filter((t: Task) => t.priority === "Low").length,
        },
      ],
      tasksByProject: Object.entries(projectCount).map(([name, value]) => ({
        name,
        value,
      })),
      projectPriorities,
      stats: {
        totalTasks: filteredTasks.length,
        completedTasks: filteredTasks.filter((t: Task) => t.status === "Completed").length,
        activeProjects: new Set(filteredTasks.filter(t => t?.projectId).map((t: Task) => t.projectId)).size,
        urgentHighTasks
      }
    } as ProcessedData;
  }, [filteredTasks, projects]);
  // Trend: Task Creation Over Time
  const taskCreationTrend = useMemo(() => {
    let validTasks = filteredTasks.filter(t => t.createdAt);
    let minDate: Date, maxDate: Date;
    if (validTasks.length) {
      minDate = new Date(Math.min(...validTasks.map(t => new Date(t.createdAt!).getTime())));
      maxDate = new Date(Math.max(...validTasks.map(t => new Date(t.createdAt!).getTime())));
      // Always show at least 14 days
      if ((maxDate.getTime() - minDate.getTime()) < 13 * 24 * 60 * 60 * 1000) {
        minDate = new Date(maxDate.getTime() - 13 * 24 * 60 * 60 * 1000);
      }
    } else {
      // No tasks: show last 14 days ending today
      maxDate = new Date();
      minDate = new Date(maxDate.getTime() - 13 * 24 * 60 * 60 * 1000);
    }
    return eachDayOfInterval({ start: minDate, end: maxDate })
      .map(date => {
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        const dayTasks = validTasks.filter(task => {
          const taskDate = new Date(task.createdAt!);
          return taskDate >= dayStart && taskDate <= dayEnd;
        });
        return {
          date: format(date, 'MMM dd'),
          count: dayTasks.length
        };
      });
  }, [filteredTasks]);

  // Trend: Completion Trend Over Time
  const completionTrend = useMemo(() => {
    if (!filteredTasks.length) return [] as CompletionTrend[];
    const validTasks = filteredTasks.filter(t => t.createdAt);
    if (!validTasks.length) return [] as CompletionTrend[];
    const startDate = new Date(Math.min(...validTasks.map((t: Task) => new Date(t.createdAt).getTime())));
    const endDate = new Date(Math.max(...validTasks.map((t: Task) => new Date(t.createdAt).getTime())));
    return eachDayOfInterval({ start: startDate, end: endDate })
      .map(date => {
        const dayTasks = validTasks.filter((task: Task) => 
          format(new Date(task.createdAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        );
        const completed = dayTasks.filter((task: Task) => task.status === 'Completed').length;
        return {
          date: format(date, 'MM/dd'),
          completed,
          total: dayTasks.length,
          rate: dayTasks.length ? (completed / dayTasks.length) * 100 : 0
        };
      });
  }, [filteredTasks]);

  // Trend: Priority Trend Over Time
  const priorityTrend = useMemo(() => {
    let validTasks = filteredTasks.filter(t => t.createdAt);
    let minDate: Date, maxDate: Date;
    if (validTasks.length) {
      minDate = new Date(Math.min(...validTasks.map(t => new Date(t.createdAt!).getTime())));
      maxDate = new Date(Math.max(...validTasks.map(t => new Date(t.createdAt!).getTime())));
      if ((maxDate.getTime() - minDate.getTime()) < 13 * 24 * 60 * 60 * 1000) {
        minDate = new Date(maxDate.getTime() - 13 * 24 * 60 * 60 * 1000);
      }
    } else {
      maxDate = new Date();
      minDate = new Date(maxDate.getTime() - 13 * 24 * 60 * 60 * 1000);
    }
    return eachDayOfInterval({ start: minDate, end: maxDate })
      .map(date => {
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        const dayTasks = validTasks.filter(task => {
          const taskDate = new Date(task.createdAt!);
          return taskDate >= dayStart && taskDate <= dayEnd;
        });
        return {
          date: format(date, 'MMM dd'),
          Urgent: dayTasks.filter(task => task.priority === 'Urgent').length,
          High: dayTasks.filter(task => task.priority === 'High').length,
          Medium: dayTasks.filter(task => task.priority === 'Medium').length,
          Low: dayTasks.filter(task => task.priority === 'Low').length
        };
      });
  }, [filteredTasks]);
  
  const columns = useMemo<GridColDef[]>(() => [
    { field: "title", headerName: "Title", width: 200 },
    { field: "description", headerName: "Description", width: 300 },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params: GridRenderCellParams<Task>) => (
        <div
          className={`rounded px-2 py-1 text-xs font-semibold ${
            params.value === "Completed"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
              : params.value === "In Progress"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
              : params.value === "Under Review"
              ? "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200"
          }`}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 130,
      renderCell: (params: GridRenderCellParams<Task>) => (
        <div
          className={`rounded px-2 py-1 text-xs font-semibold ${
            params.value === "Urgent"
              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
              : params.value === "High"
              ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200"
              : params.value === "Medium"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
          }`}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      width: 150,
      valueFormatter: (params: GridValueFormatterParams<Task>) =>
        params.value ? format(new Date(params.value), "PP") : "-",
    },    {
      field: "projectName",
      headerName: "Project",
      width: 200,
      valueGetter: (params) => {
        try {
          const projectId = params.row?.projectId;
          if (!projectId) return "-";
          const project = projects?.find(p => p.id === projectId);
          return project?.name || "-";
        } catch (error) {
          console.error("Error getting project name:", error);
          return "-";
        }
      },
    },
  ], [projects]);

  // 4. Conditional returns
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // 5. Render
  return (
    <div className="container mx-auto px-4">
      <Header name="Task Priority Analytics"  />

      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
        id={null}
      />

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <select
          value={selectedProjectId}
          onChange={(e) => {
            const newValue = e.target.value;
            console.log('Changing project selection to:', newValue);
            setSelectedProjectId(newValue);
          }}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
        >
          <option value="0">All Projects</option>
          {[...projects]
            .sort((a, b) => a.id - b.id)
            .map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
          ))}
        </select>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(processedData.stats).map(([key, value]) => (
          <Paper key={key} className="p-4" elevation={2}>
            <Typography variant="h6" className="mb-2 capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Paper>
        ))}
      </div>

      {/* Project-based Analytics Section */}
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {/* Tasks Distribution by Project */}
        <Paper className="p-4" elevation={2}>
          <Typography variant="h6" className="mb-4">
            Tasks Distribution by Project
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={processedData.tasksByProject}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {processedData.tasksByProject.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* Priority Distribution by Project */}
        <Paper className="p-4" elevation={2}>
          <Typography variant="h6" className="mb-4">
            Priority Distribution by Project
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processedData.projectPriorities}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Urgent" fill={COLORS.Urgent} stackId="a" />
              <Bar dataKey="High" fill={COLORS.High} stackId="a" />
              <Bar dataKey="Medium" fill={COLORS.Medium} stackId="a" />
              <Bar dataKey="Low" fill={COLORS.Low} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Task Creation Trend */}
        <Paper className="p-4" elevation={2}>
          <Typography variant="h6" className="mb-4">
            Task Creation Trend
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={taskCreationTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* Priority Trend Over Time */}
        <Paper className="p-4" elevation={2}>
          <Typography variant="h6" className="mb-4">
            Priority Trend Over Time
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={priorityTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="Urgent" stackId="1" fill={COLORS.Urgent} stroke={COLORS.Urgent} />
              <Area type="monotone" dataKey="High" stackId="1" fill={COLORS.High} stroke={COLORS.High} />
              <Area type="monotone" dataKey="Medium" stackId="1" fill={COLORS.Medium} stroke={COLORS.Medium} />
              <Area type="monotone" dataKey="Low" stackId="1" fill={COLORS.Low} stroke={COLORS.Low} />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </div>      <div style={{ height: Math.max(600, filteredTasks.length * 55) + 'px', width: "100%" }} className="mt-8">
        <DataGrid
          rows={filteredTasks}
          columns={columns}
          className={dataGridClassNames}
          getRowId={(row) => row.id}
          pageSize={filteredTasks.length || 1}
          rowsPerPageOptions={[filteredTasks.length || 1]}
          pagination={false}
          loading={isLoading}
        />
      </div>
    </div>
  );
};

export default ReusablePriorityPage;