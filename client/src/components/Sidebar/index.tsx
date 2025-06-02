"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import { useGetProjectsQuery } from "@/state/api";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Home,
  Layers3,
  LockIcon,
  LucideIcon,
  MessageSquare,
  Search,
  Settings,
  ShieldAlert,
  User,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import ChatBot from "../ChatBot";

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

const SidebarLink = ({ href, icon: Icon, label }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || (pathname === "/" && href === "/dashboard");
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);

  return (
    <Link href={href} className="block w-full">
      <div
        className={`relative flex cursor-pointer items-center gap-3 rounded-lg px-4 py-2.5 transition-all duration-200
          ${isActive 
            ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white" 
            : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50"
          }`}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <span className={`whitespace-nowrap font-medium transition-opacity duration-200
          ${isSidebarCollapsed ? "opacity-0 md:hidden" : "opacity-100"}`}
        >
          {label}
        </span>
        {isActive && (
          <div className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-blue-500" />
        )}
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const [showProjects, setShowProjects] = useState(true);
  const [showPriority, setShowPriority] = useState(true);
  const [showChat, setShowChat] = useState(false);

  const { data: projects } = useGetProjectsQuery();
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  // Enhanced sidebar styles with smooth transitions
  const sidebarClassNames = `fixed left-0 top-0 z-40 h-screen flex flex-col bg-white shadow-xl transition-all duration-300 ease-in-out dark:bg-black/95
    ${isSidebarCollapsed ? "w-20" : "w-64"}
    ${isSidebarCollapsed ? "-translate-x-full md:translate-x-0" : "translate-x-0"}
  `;

  return (
    <>
      {/* Backdrop overlay with blur effect for mobile */}
      <div
        className={`fixed inset-0 z-30 backdrop-blur-sm bg-black/40 transition-opacity duration-300 md:hidden
          ${isSidebarCollapsed ? "pointer-events-none opacity-0" : "opacity-100"}`}
        onClick={() => dispatch(setIsSidebarCollapsed(true))}
        aria-hidden="true"
      />

      {/* Sidebar container */}
      <aside className={sidebarClassNames} aria-label="Sidebar">
        {/* Header with logo and controls */}
        <div className="sticky top-0 z-50 flex min-h-[64px] w-full items-center justify-between bg-white/90 px-4 py-3 dark:bg-black/90 backdrop-blur border-b border-gray-200 dark:border-gray-700">
          <div className="text-xl font-bold text-gray-800 dark:text-white truncate w-12 md:w-auto">
            LIST
          </div>
          <div className="flex items-center gap-1">
            {/* Desktop collapse button */}
            <button
              className="hidden md:inline-flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            {/* Mobile close button */}
            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden"
              onClick={() => dispatch(setIsSidebarCollapsed(true))}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Team section */}
          <div className="border-b border-gray-200/80 px-4 py-4 dark:border-gray-700/80">
            <div className="flex items-center gap-3">
              <Image
                src="https://pm--s3--images.s3.us-east-1.amazonaws.com/logo.png"
                alt="Team Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div className={`transition-opacity duration-200 ${isSidebarCollapsed ? "opacity-0 md:hidden" : "opacity-100"}`}>
                <h3 className="font-semibold tracking-wide dark:text-gray-200">
              Nucleus
                </h3>
                <div className="mt-1 flex items-center gap-1.5">
                  <LockIcon className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Private</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="space-y-1 p-3">
            <SidebarLink icon={Home} label="Home" href="/" />
            <SidebarLink icon={Briefcase} label="Timeline" href="/timeline" />
            <SidebarLink icon={Search} label="Search" href="/search" />
            <SidebarLink icon={MessageSquare} label="AI Assistant" href="/chat" />
            <SidebarLink icon={Settings} label="Settings" href="/settings" />
            <SidebarLink icon={User} label="Users" href="/users" />
            <SidebarLink icon={Users} label="Teams" href="/teams" />
          </nav>

          {/* Projects section */}
          <div className="px-3">
            <button
              onClick={() => !isSidebarCollapsed && setShowProjects((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50 transition-colors"
            >
              <span className={`font-medium transition-opacity duration-200 ${isSidebarCollapsed ? "opacity-0 md:hidden" : "opacity-100"}`}>
                Projects
              </span>
              {!isSidebarCollapsed && (
                showProjects ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )
              )}
            </button>
            {showProjects && !isSidebarCollapsed && projects?.map((project: any) => (
              <SidebarLink
                key={project.id}
                icon={Briefcase}
                label={project.name}
                href={`/projects/${project.id}`}
              />
            ))}
          </div>

          {/* Priorities section */}
          <div className="px-3">
            <button
              onClick={() => !isSidebarCollapsed && setShowPriority((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50 transition-colors"
            >
              <span className={`font-medium transition-opacity duration-200 ${isSidebarCollapsed ? "opacity-0 md:hidden" : "opacity-100"}`}>
                Priority
              </span>
              {!isSidebarCollapsed && (
                showPriority ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )
              )}
            </button>            {showPriority && !isSidebarCollapsed && (
              <div className="space-y-1">
                <SidebarLink icon={AlertCircle} label="All Priorities" href="/priority" />
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;