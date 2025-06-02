"use client";

import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useAppSelector } from "./redux";
import ChatBot from "@/components/ChatBot";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className={`flex flex-1 flex-col transition-all duration-300 ${
        isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
      }`}>
        <Navbar />
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
      <ChatBot />
    </div>
  );
}