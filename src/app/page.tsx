import { Suspense } from "react";
import { AppHome } from "@/components/AppHome";
import { HomePageSkeleton } from "@/components/HomePageSkeleton";

export default function Home() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <AppHome />
    </Suspense>
  );
}
