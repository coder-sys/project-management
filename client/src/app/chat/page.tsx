"use client";

import Header from "@/components/Header";
import { Send } from "lucide-react";
import React, { useRef, useEffect, useState } from "react";
import dynamic from 'next/dynamic';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

import remarkGfm from 'remark-gfm';

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasksByProject, setTasksByProject] = useState<{ [projectId: string]: any[] }>({});
  const [allTasks, setAllTasks] = useState<any[]>([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch all projects and all tasks on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const projectsRes = await fetch("https://khgs1vuyu8.execute-api.us-east-1.amazonaws.com/prod/projects");
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
        // Fetch all tasks for each project
        const tasksResults = await Promise.all(
          projectsData.map(async (p: any) => {
            const res = await fetch(`https://khgs1vuyu8.execute-api.us-east-1.amazonaws.com/prod/tasks?projectId=${p.id}`);
            return res.ok ? await res.json() : [];
          })
        );
        // Map projectId to tasks
        const tasksMap: { [projectId: string]: any[] } = {};
        let allTasksArr: any[] = [];
        projectsData.forEach((p: any, idx: number) => {
          tasksMap[p.id] = tasksResults[idx];
          allTasksArr = allTasksArr.concat(tasksResults[idx]);
        });
        setTasksByProject(tasksMap);
        setAllTasks(allTasksArr);
      } catch (e) {
        // ignore for now
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    try {
      const lowerInput = input.trim().toLowerCase();
      // Handle project queries
      if (/\b(all|list|show|display)?\s*projects?\b/.test(lowerInput)) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              `There are ${projects.length} projects.\n` +
              projects.map((p: any) => `• ${p.name} (ID: ${p.id})`).join("\n"),
          },
        ]);
        setIsLoading(false);
        return;
      }
      // Handle all tasks query
      if (/\b(all|list|show|display)?\s*tasks?\b/.test(lowerInput) && !/project|id|\d/.test(lowerInput)) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              `There are ${allTasks.length} tasks across all projects.\n` +
              allTasks.map((t: any) => `• ${t.title} [${t.status}] (Project: ${projects.find(p => p.id === t.projectId)?.name || t.projectId})`).join("\n"),
          },
        ]);
        setIsLoading(false);
        return;
      }
      // Handle tasks for a specific project by name (more flexible)
      const projectTaskRegex = /tasks?\s*(for|in|of|on|about)?\s*([\w\s\-']+)/i;
      const match = lowerInput.match(projectTaskRegex);
      if (match && match[2]) {
        const nameQuery = match[2].trim();
        // Fuzzy/partial match: find all projects whose name includes all words in the query
        const queryWords = nameQuery.split(/\s+/).filter(Boolean);
        const matchingProjects = projects.filter(p =>
          queryWords.every(qw => p.name.toLowerCase().includes(qw))
        );
        if (matchingProjects.length === 1) {
          const project = matchingProjects[0];
          const tasks = tasksByProject[project.id] || [];
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: tasks.length
                ? `Here are the tasks for **${project.name}** (${tasks.length}):\n` +
                  tasks.map((t) => `- **${t.title}** _[${t.status}]_ (Priority: ${t.priority})`).join("\n")
                : `It looks like there are no tasks for **${project.name}** right now. Want to add some?`,
            },
          ]);
        } else if (matchingProjects.length > 1) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                `I found multiple projects matching your query:\n` +
                matchingProjects.map((p) => `- ${p.name}`).join("\n") +
                `\nPlease specify which one you mean!`,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                `Sorry, I couldn't find any project matching "${nameQuery}". Please check the project name or try again!`,
            },
          ]);
        }
        setIsLoading(false);
        return;
      }
      // Otherwise, send all project/task context to the AI for deep conversation
      const projectSummaries = projects.map((p: any) => {
        const tasks = tasksByProject[p.id] || [];
        const taskList = tasks.map((t: any) =>
          `- **${t.title}** [${t.status}] _(Priority: ${t.priority})_` + (t.description ? `\n    > ${t.description}` : "")
        ).join("\n");
        return `### Project: ${p.name}\n*Description:* ${p.description || 'N/A'}\n*Timeline:* ${p.startDate ? new Date(p.startDate).toLocaleDateString() : 'N/A'} to ${p.endDate ? new Date(p.endDate).toLocaleDateString() : 'N/A'}\n*Tasks (${tasks.length}):*\n${taskList}`;
      }).join("\n\n");
      const systemPrompt = `You are an expert project management assistant. Here is the current data as of ${new Date().toLocaleDateString()}:\n\n${projectSummaries}\n\nAlways answer the user's question using this data. If the user asks about a project or task, use the details above. If the answer is not in the data, say you don't have enough information. Format your answers with markdown for clarity.`;
      const response = await fetch(
        `https://espark-apis.afd.enterprises/response_ai/${encodeURIComponent(input)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error("Failed to get response");
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.data },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Header name="AI Assistant" />

      {/* Visualization Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Project & Task Overview</h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow flex flex-col gap-4">
          {/* Bar chart for tasks per project */}
          <div className="overflow-x-auto">
            <svg width={Math.max(400, projects.length * 60)} height={180}>
              {projects.map((p, idx) => {
                const tasks = tasksByProject[p.id] || [];
                const barHeight = Math.min(120, tasks.length * 15);
                return (
                  <g key={p.id}>
                    <rect
                      x={idx * 50 + 40}
                      y={150 - barHeight}
                      width={30}
                      height={barHeight}
                      fill="#3b82f6"
                    />
                    <text
                      x={idx * 50 + 55}
                      y={165}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#333"
                    >
                      {p.name.length > 7 ? p.name.slice(0, 7) + "…" : p.name}
                    </text>
                    <text
                      x={idx * 50 + 55}
                      y={150 - barHeight - 5}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#3b82f6"
                    >
                      {tasks.length}
                    </text>
                  </g>
                );
              })}
              {/* Y axis label */}
              <text x="10" y="20" fontSize="12" fill="#666" transform="rotate(-90 10,90)"># Tasks</text>
            </svg>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Bar height = number of tasks per project</div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="mt-8 flex h-[calc(100vh-20rem)] flex-col rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {messages.length === 0 ? (
              <div className="text-center">
                <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                  Welcome to AI Assistant
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Ask me anything about your projects and tasks. I can help you
                  with:
                </p>
                <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Project management advice</li>
                  <li>• Task organization and prioritization</li>
                  <li>• Best practices and suggestions</li>
                  <li>• Finding specific information</li>
                </ul>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 whitespace-pre-wrap break-words ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-900 dark:text-white border border-blue-200 dark:border-blue-700 shadow"
                    }`}
                    style={message.role === "assistant" ? { fontFamily: 'Inter, sans-serif', fontSize: '1rem', lineHeight: '1.6' } : {}}
                  >
                    {message.role === "assistant" ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: (props: any) => <a {...props} className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer" />,
                          strong: (props: any) => <strong className="text-blue-700 dark:text-blue-300 font-semibold" {...props} />,
                          li: (props: any) => <li className="ml-4 list-disc" {...props} />,
                          code: (props: any) => <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded text-pink-600 dark:text-pink-400" {...props} />,
                        } as any}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                </div>
              ))
           ) }
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex space-x-2 rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-700">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your projects and tasks..."
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-800"
            >
              <span>Send</span>
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
