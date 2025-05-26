"use client";

import React from "react";
import { Menu, Moon, Sun, User } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {isSidebarCollapsed && (
            <button
              onClick={() => dispatch(setIsSidebarCollapsed(false))}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
          )}
          <span className="text-lg font-semibold text-gray-800 dark:text-white">
            Dashboard
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="h-6 w-6" />
            ) : (
              <Moon className="h-6 w-6" />
            )}
          </button>
          <User className="h-8 w-8 rounded-full bg-gray-200 p-1 text-gray-600 dark:bg-gray-700 dark:text-gray-400" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;