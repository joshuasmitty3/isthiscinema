
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MovieSkeletonProps {
  className?: string;
}

export function MovieSkeleton({ className }: MovieSkeletonProps) {
  return (
    <div className={cn("bg-white border border-neutral-200 rounded-md overflow-hidden shadow-sm", className)}>
      <Skeleton className="relative aspect-[2/3]" />
      <div className="p-2 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}
