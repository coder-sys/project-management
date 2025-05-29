"use client";

import React from "react";
import { Menu, Moon, Search, Settings, Sun, User } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { useGetAuthUserQuery } from "@/state/api";
import { signOut } from "aws-amplify/auth";
import Image from "next/image";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { data: currentUser } = useGetAuthUserQuery({});

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const currentUserDetails = currentUser?.userDetails;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 dark:border-gray-800 dark:bg-black/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => dispatch(setIsSidebarCollapsed(false))}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Search bar */}
          <div className="relative max-w-md flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <form 
              action="/search"
              className="cursor-pointer"
              onSubmit={(e) => {
                e.preventDefault();
                const searchInput = e.currentTarget.querySelector('input');
                if (searchInput?.value) {
                  window.location.href = `/search?q=${encodeURIComponent(searchInput.value)}`;
                } else {
                  window.location.href = '/search';
                }
              }}
            >
              <input
                type="text"
                name="q"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                placeholder="Search tasks..."
              />
            </form>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            aria-label={
              isDarkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* Settings */}
          <Link
            href="/settings"
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </Link>

          {/* User menu */}
          <div className="flex items-center gap-3 border-l border-gray-200 pl-3 dark:border-gray-700">
            <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              {currentUserDetails?.profilePictureUrl ? (
                <Image
                  src={currentUserDetails.profilePictureUrl}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-full w-full p-1.5 text-gray-400" />
              )}
            </div>
            <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-300 md:block">
              {currentUserDetails?.username || "Guest"}
            </span>
            {currentUser && (
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;