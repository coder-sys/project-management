"use client";

import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import TaskCard from "@/components/TaskCard";
import UserCard from "@/components/UserCard";
import { useGetProjectsQuery, useSearchQuery } from "@/state/api";
import { debounce } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
}

interface User {
  userId: string;
  username: string;
}

const Search = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  
  // Get all projects
  const { data: allProjects = [], isLoading: isLoadingProjects } = useGetProjectsQuery();
  
  // Search results for tasks and users
  const {
    data: searchResults,
    isLoading: isLoadingSearch,
    isError,
  } = useSearchQuery(searchTerm, {
    skip: searchTerm.length < 3,
  });

  // Filter projects based on search term
  const filteredProjects = React.useMemo(() => {
    if (!searchTerm || searchTerm.length < 3) return allProjects;
    return searchResults?.projects || [];
  }, [searchTerm, searchResults?.projects, allProjects]);

  const updateUrl = (query: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    router.push(`/search?${params.toString()}`);
  };

  const handleSearch = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchTerm(value);
      updateUrl(value);
    },
    500,
  );

  useEffect(() => {
    return handleSearch.cancel;
  }, [handleSearch]);

  const isLoading = isLoadingProjects || isLoadingSearch;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <Header name="Search" />
      
      {/* Search Section */}
      <div className="mx-auto mb-12 max-w-3xl">
        <div className="relative transform transition-all duration-200 ease-in-out">
          <div className={`relative rounded-xl bg-white shadow-lg transition-all duration-200 dark:bg-gray-800 ${
            isFocused ? 'ring-2 ring-blue-500 dark:ring-blue-400' : 'ring-1 ring-gray-200 dark:ring-gray-700'
          }`}>
            <input
              type="text"
              placeholder="Search projects, tasks, or users..."
              className="w-full rounded-xl border-none bg-transparent px-5 py-4 pl-12 text-lg text-gray-900 placeholder-gray-400 focus:outline-none dark:text-white dark:placeholder-gray-500"
              onChange={handleSearch}
              defaultValue={initialQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <svg className={`h-6 w-6 transition-colors duration-200 ${
                isFocused ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Search Instructions */}
          {!searchTerm && (
            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              View all projects or start typing to filter
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-10">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 animate-ping rounded-full border-2 border-blue-500 opacity-75"></div>
              <div className="relative h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-blue-500"></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="mx-auto max-w-2xl rounded-xl bg-red-50 p-6 text-center dark:bg-red-900/30">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="mt-4 text-lg font-medium text-red-800 dark:text-red-200">Error occurred while fetching results.</p>
            <p className="mt-2 text-red-600 dark:text-red-300">Please try again later or contact support if the problem persists.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-12">
            {/* Projects Grid */}
            <section>
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Projects</h2>
                  <span className="ml-3 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                    {filteredProjects.length}
                  </span>
                </div>
                {searchTerm.length >= 3 && filteredProjects.length === 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    No matching projects found
                  </span>
                )}
              </div>
              
              {filteredProjects.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProjects.map((project: Project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : !searchTerm && (
                <div className="rounded-xl bg-gray-50 py-12 text-center dark:bg-gray-800/50">
                  <p className="text-gray-600 dark:text-gray-300">No projects available</p>
                </div>
              )}
            </section>

            {/* Tasks Section - Only show when searching */}
            {searchTerm.length >= 3 && searchResults?.tasks && searchResults.tasks.length > 0 && (
              <section>
                <div className="mb-6 flex items-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tasks</h2>
                  <span className="ml-3 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                    {searchResults.tasks.length}
                  </span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {searchResults.tasks.map((task: Task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </section>
            )}

            {/* Users Section - Only show when searching */}
            {searchTerm.length >= 3 && searchResults?.users && searchResults.users.length > 0 && (
              <section>
                <div className="mb-6 flex items-center">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Team Members</h2>
                  <span className="ml-3 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-200">
                    {searchResults.users.length}
                  </span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {searchResults.users.map((user: User) => (
                    <UserCard key={user.userId} user={user} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
