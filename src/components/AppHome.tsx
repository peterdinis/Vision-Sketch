"use client";

import { lazy, Suspense } from "react";
import { HomePageSkeleton } from "@/components/HomePageSkeleton";

const Dashboard = lazy(() => import("@/components/Dashboard"));

/**
 * Client entry: lazy-loads the studio so the route can show a Suspense fallback
 * while the main bundle chunk is loading.
 */
export function AppHome() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}
