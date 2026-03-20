import { Skeleton } from "@/components/ui/skeleton";

export function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 lg:p-12" role="status" aria-label="Loading studio">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <Skeleton className="w-40 h-8 rounded-lg" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-24 h-10 rounded-full hidden md:block" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-12 xl:col-span-5 space-y-8">
            <div className="space-y-4">
              <Skeleton className="w-32 h-6 rounded-full" />
              <Skeleton className="w-full h-16 rounded-xl" />
              <Skeleton className="w-3/4 h-16 rounded-xl" />
              <Skeleton className="w-full h-24 rounded-2xl" />
            </div>
            <Skeleton className="w-full h-[500px] rounded-[2.5rem]" />
          </div>

          <div className="lg:col-span-12 xl:col-span-7">
            <Skeleton className="w-full h-[850px] rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
