import { Task } from "@/state/api";
import { format } from "date-fns";
import Image from "next/image";
import React from "react";

type Props = {
  task: Task;
};

const TaskCard = ({ task }: Props) => {
  return (
    <div className="mb-3 rounded bg-white p-4 shadow dark:bg-dark-secondary dark:text-white">
      {task.attachments && task.attachments.length > 0 && (
        <div>
          <strong>Attachments:</strong>
          <div className="flex flex-wrap">
            {task.attachments && task.attachments.length > 0 && (
              <Image
                src={`https://pm--s3--images.s3.us-east-1.amazonaws.com/${task.attachments[0].fileURL}`}
                alt={task.attachments[0].fileName}
                width={400}
                height={200}
                className="rounded-md"
              />
            )}
          </div>
        </div>
      )}
      <p>
        <strong>ID:</strong> {task.id}
      </p>
      <p>
        <strong>Title:</strong> {task.title}
      </p>
      <p>
        <strong>Description:</strong>{" "}
        {task.description || "No description provided"}
      </p>
      <p>
        <strong>Status:</strong> {task.status}
      </p>
      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
          {
            'Urgent': 'bg-red-100 text-red-800',
            'High': 'bg-orange-100 text-orange-800',
            'Medium': 'bg-yellow-100 text-yellow-800',
            'Low': 'bg-green-100 text-green-800',
            'Backlog': 'bg-gray-100 text-gray-800'
          }[task.priority || 'Backlog']
        }`}>
          {task.priority || "Backlog"}
        </span>
        {task.project && (
          <span className="text-xs text-gray-600 dark:text-gray-400">
            in {task.project.name}
          </span>
        )}
      </div>
      <p>
        <strong>Tags:</strong> {task.tags || "No tags"}
      </p>
      <p>
        <strong>Start Date:</strong>{" "}
        {task.startDate ? format(new Date(task.startDate), "P") : "Not set"}
      </p>
      <p>
        <strong>Due Date:</strong>{" "}
        {task.dueDate ? format(new Date(task.dueDate), "P") : "Not set"}
      </p>
      <p>
        <strong>Author:</strong>{" "}
        {task.author ? task.author.username : "Unknown"}
      </p>
      <p>
        <strong>Assignee:</strong>{" "}
        {task.assignee ? task.assignee.username : "Unassigned"}
      </p>
    </div>
  );
};

export default TaskCard;
