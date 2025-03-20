
import { cn } from "@/lib/utils";

interface MovieSkeletonProps {
  className?: string;
}

export function MovieSkeleton({ className }: MovieSkeletonProps) {
  return (
    <div className={cn("bg-white border border-neutral-200 rounded-md overflow-hidden shadow-sm animate-pulse", className)}>
      <div className="relative aspect-[2/3] bg-neutral-200"/>
      <div className="p-2">
        <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"/>
        <div className="h-3 bg-neutral-200 rounded w-1/4"/>
      </div>
    </div>
  );
}
