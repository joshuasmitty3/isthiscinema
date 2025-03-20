
import { Skeleton } from "./ui/skeleton";

export function ListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-32" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3]" />
        ))}
      </div>
    </div>
  );
}
