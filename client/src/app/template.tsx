"use client";

import AuthenticatedLayout from "./AuthenticatedLayout";

export default function Template({ children }: { children: React.ReactNode }) {
  // This template wraps all pages with the authenticated layout
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}