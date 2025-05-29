"use client";

import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import StoreProvider, { useAppSelector } from "./redux";

const SIDEBAR_WIDTH = 256; // 16rem = 256px (w-64)
const SIDEBAR_COLLAPSED_WIDTH = 80; // 5rem = 80px (w-20)

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar: fixed position, managed by its own component */}
      <Sidebar />

      {/* Main content wrapper: takes remaining width, manages its own scroll */}
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? "md:pl-20" : "md:pl-64"}`}
      >
        {/* Navbar: sticky at top of content area */}
        <Navbar />

        {/* Main scrollable area */}
        <main className="flex-1 overflow-auto px-4 py-8 md:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

// Wrap with store provider
const DashboardWrapper = ({ children }: { children: React.ReactNode }) => (
  <StoreProvider>
    <DashboardLayout>{children}</DashboardLayout>
  </StoreProvider>
);

export default DashboardWrapper;
