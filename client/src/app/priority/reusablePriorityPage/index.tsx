"use client";

import { useAppSelector } from "@/app/redux";
import Header from "@/components/Header";
import ModalNewTask from "@/components/ModalNewTask";
import TaskCard from "@/components/TaskCard";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import {
  Priority,
  Task,
  useGetProjectsQuery,
  useGetTasksQuery,
} from "@/state/api";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useState } from "react";

type Props = {
  priority: Priority;
};

const columns: GridColDef[] = [
  {
    field: "title",
    headerName: "Title",
    width: 100,
  },
  {
    field: "description",
    headerName: "Description",
    width: 200,
  },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: (params) => (
      <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
        {params.value}
      </span>
    ),
  },
  {
    field: "priority",
    headerName: "Priority",
    width: 75,
  },
  {
    field: "tags",
    headerName: "Tags",
    width: 130,
  },
  {
    field: "startDate",
    headerName: "Start Date",
    width: 130,
  },
  {
    field: "dueDate",
    headerName: "Due Date",
    width: 130,
  },
  {
    field: "author",
    headerName: "Author",
    width: 150,
    renderCell: (params) => params.value.username || "Unknown",
  },
  {
    field: "assignee",
    headerName: "Assignee",
    width: 150,
    renderCell: (params) => params.value.username || "Unassigned",
  },
];

const ReusablePriorityPage = ({ priority }: Props) => {
  const [view, setView] = useState("list");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  // Get all tasks with projectId: 1, same as HomePage
  const {
    data: tasks,
    isLoading,
    isError: isTasksError,
    error,
    refetch: refetchTasks,
  } = useGetTasksQuery({ projectId: parseInt("1") });

  const { data: projects = [] } = useGetProjectsQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  console.log("All tasks:", tasks);
  console.log("Expected priority:", priority);

  // Filter tasks by priority using the same grouping logic as HomePage
  const filteredTasks = React.useMemo(() => {
    if (!tasks) return [];

    // First group all tasks by priority (same as in HomePage)
    const priorityCount = tasks.reduce(
      (acc: Record<string, Task[]>, task: Task) => {
        const { priority: taskPriority = "Unassigned" } = task;
        if (!acc[taskPriority]) {
          acc[taskPriority] = [];
        }
        acc[taskPriority].push(task);
        return acc;
      },
      {}
    );

    // Return tasks for the current priority
    return priorityCount[priority] || [];
  }, [tasks, priority]);

  console.log("Filtered tasks:", filteredTasks);

  // Find the latest projectId and increment by 1 for new tasks
  const latestProjectId = React.useMemo(() => {
    if (!projects || projects.length === 0) return 1;
    return Math.max(...projects.map((p) => p.id)) + 1;
  }, [projects]);

  // Callback to close modal and refresh tasks
  const handleTaskCreated = () => {
    setIsModalNewTaskOpen(false);
    refetchTasks();
  };

  return (
    <div className="m-5 p-4">
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
        id={latestProjectId.toString()}
      />
      <Header
        name={`${priority} Priority Tasks`}
      
      />
      <div className="mb-4 flex justify-start">
        <button
          className={`px-4 py-2 ${
            view === "list" ? "bg-gray-300" : "bg-white"
          } rounded-l`}
          onClick={() => setView("list")}
        >
          List
        </button>
        <button
          className={`px-4 py-2 ${
            view === "table" ? "bg-gray-300" : "bg-white"
          } rounded-l`}
          onClick={() => setView("table")}
        >
          Table
        </button>
      </div>
      {isLoading ? (
        <div>Loading tasks...</div>
      ) : view === "list" ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks?.map((task: Task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        view === "table" &&
        filteredTasks && (
          <div className="z-0 w-full">
            <DataGrid
              rows={filteredTasks}
              columns={columns}
              checkboxSelection
              getRowId={(row) => row.id}
              className={dataGridClassNames}
              sx={dataGridSxStyles(isDarkMode)}
            />
          </div>
        )
      )}
    </div>
  );
};

export default ReusablePriorityPage;