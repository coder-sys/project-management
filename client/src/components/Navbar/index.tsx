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

  const { 
    data: currentUser,
    isLoading,
    isError,
    error 
  } = useGetAuthUserQuery({});

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 dark:bg-black">
      {/* Search Bar */}
      <div className="flex items-center gap-8">
        {!isSidebarCollapsed ? null : (
          <button
            onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
          >
            <Menu className="h-8 w-8 dark:text-white" />
          </button>
        )}
        <div className="relative flex h-min w-[200px]">
          <Search className="absolute left-[4px] top-1/2 mr-2 h-5 w-5 -translate-y-1/2 transform cursor-pointer dark:text-white" />
          <input
            className="w-full rounded border-none bg-gray-100 p-2 pl-8 placeholder-gray-500 focus:border-transparent focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-white"
            type="search"
            placeholder="Search..."
          />
        </div>
      </div>

      {/* Icons */}
      <div className="flex items-center">
        <button
          onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
          className={
            isDarkMode
              ? `rounded p-2 dark:hover:bg-gray-700`
              : `rounded p-2 hover:bg-gray-100`
          }
        >
          {isDarkMode ? (
            <Sun className="h-6 w-6 cursor-pointer dark:text-white" />
          ) : (
            <Moon className="h-6 w-6 cursor-pointer dark:text-white" />
          )}
        </button>
        <Link
          href="/settings"
          className={
            isDarkMode
              ? `h-min w-min rounded p-2 dark:hover:bg-gray-700`
              : `h-min w-min rounded p-2 hover:bg-gray-100`
          }
        >
          <Settings className="h-6 w-6 cursor-pointer dark:text-white" />
        </Link>
        <div className="ml-2 mr-5 hidden min-h-[2em] w-[0.1rem] bg-gray-200 md:inline-block"></div>        <div className="hidden items-center justify-between md:flex">
          {isLoading ? (
            <div className="flex items-center space-x-4">
              <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          ) : isError ? (
            <div className="text-sm text-red-500">
              {error ? 
                'message' in error ? error.message : 'Failed to load user'
                : 'An unknown error occurred'
              }
            </div>
          ) : currentUser ? (
            <>
              <div className="align-center flex h-9 w-9 justify-center">
                {currentUser.userDetails?.avatar ? (
                  <Image
                    src={currentUser.userDetails.avatar}
                    alt="User avatar"
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                ) : (
                  <User className="h-6 w-6 dark:text-white" />
                )}
              </div>
              <span className="mx-3 text-gray-800 dark:text-white">
                {currentUser.userDetails?.username || 'User'}
              </span>
              <button
                className="rounded bg-blue-400 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
