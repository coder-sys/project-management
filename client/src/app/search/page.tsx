"use client";

import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import TaskCard from "@/components/TaskCard";
import UserCard from "@/components/UserCard";
import { useSearchQuery } from "@/state/api";
import { debounce } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const Search = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearchTerm = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  const {
    data: searchResults,
    isLoading,
    isError,
  } = useSearchQuery(searchTerm);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    // Update URL with search query
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    router.replace(`/search?${params.toString()}`);
  };

  // Sync URL search param with state
  useEffect(() => {
    const queryTerm = searchParams.get("q");
    if (queryTerm && queryTerm !== searchTerm) {
      setSearchTerm(queryTerm);
    }
  }, [searchParams]);

  useEffect(() => {
    return handleSearch.cancel;
  }, [handleSearch.cancel]);

  return (
    <div className="p-8">
      <Header name="Search Tasks" />
      <div>
        <input
          type="text"
          placeholder="Search tasks by title, description, or status..."
          value={searchTerm}
          onChange={handleSearch}
          autoFocus
          className="w-full max-w-2xl rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm shadow outline-none transition-colors focus:border-blue-500 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          onChange={handleSearch}
        />
      </div>
      <div className="p-5">
        {isLoading && <p>Loading...</p>}
        {isError && <p>Error occurred while fetching search results.</p>}
        {!isLoading && !isError && searchResults && (
          <div>
            {/* Focus only on tasks */}
            {searchResults.tasks && searchResults.tasks.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold dark:text-white">Found Tasks ({searchResults.tasks.length})</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
                No tasks found matching your search
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
