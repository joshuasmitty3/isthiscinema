
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MovieSkeletonProps {
  className?: string;
  showActions?: boolean;
}

export function MovieSkeleton({ className, showActions = true }: MovieSkeletonProps) {
  return (
    <div className={cn("bg-white border border-neutral-200 rounded-md overflow-hidden shadow-sm", className)}>
      <div className="relative">
        <Skeleton className="aspect-[2/3]" />
        {showActions && (
          <div className="absolute top-2 right-2">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        )}
      </div>
      <div className="p-2 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    </div>
  );
}
