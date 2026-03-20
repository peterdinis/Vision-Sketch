import { Skeleton } from "@/components/ui/skeleton";

/** Shown while the code preview chunk loads (Suspense). */
export function CodePreviewSkeleton() {
  return (
    <div
      className="h-full min-h-[400px] flex flex-col glass rounded-2xl overflow-hidden border border-border/50"
      role="status"
      aria-label="Loading code preview"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-secondary/30">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <div className="flex-1 p-4 space-y-3 bg-[#1e1e1e]">
        <Skeleton className="h-4 w-full max-w-[90%] rounded bg-white/10" />
        <Skeleton className="h-4 w-full max-w-[80%] rounded bg-white/10" />
        <Skeleton className="h-4 w-full max-w-[95%] rounded bg-white/10" />
        <Skeleton className="h-4 w-full max-w-[70%] rounded bg-white/10" />
        <Skeleton className="h-4 w-full max-w-[85%] rounded bg-white/10" />
      </div>
    </div>
  );
}
