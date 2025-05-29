"use client";

import { useEffect } from "react";
import { useAppSelector } from "./redux";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // Sync dark mode with localStorage and document class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("darkMode", isDarkMode ? "true" : "false");
  }, [isDarkMode]);

  // Load dark mode preference on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    if (savedDarkMode !== isDarkMode) {
      document.documentElement.classList.toggle("dark", savedDarkMode);
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Fixed position */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Navbar - Sticky top */}
        <Navbar />
        
        {/* Main content - Auto scroll */}
        <main className={`flex-1 overflow-auto p-4 transition-all duration-300 ${
          isSidebarCollapsed ? "" : "md:ml-64"
        }`}>
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}