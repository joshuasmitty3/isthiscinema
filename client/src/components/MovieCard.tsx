import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Movie } from "@/lib/types";
import { useState } from "react";
import { moveToWatched } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface MovieCardProps {
  movie: Movie;
  actionType: 'watch' | 'remove';
  isDragging?: boolean;
  isCompact?: boolean;
  onListsChange?: () => void;
}

export default function MovieCard({ movie, actionType, isDragging, isCompact, onListsChange }: MovieCardProps) {
  const { toast } = useToast();

  const handleMoveToWatched = async () => {
    try {
      await moveToWatched(movie.id);
      toast({
        title: "Success",
        description: `${movie.title} moved to watched list`,
      });
      if (onListsChange) onListsChange();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move movie to watched list",
        variant: "destructive",
      });
    }
  };

  if (isCompact) {
    return (
      <div className={cn(
        "group relative bg-white border border-neutral-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300",
        isDragging && "opacity-50"
      )}>
        <div className="p-3 flex justify-between items-center">
          <div>
            <h3 className="font-medium text-sm">{movie.title}</h3>
            <p className="text-xs text-neutral-600">{movie.year} • {movie.director}</p>
          </div>
          {actionType && (
            <Button
              size="sm"
              variant="ghost"
              onClick={actionType === 'watch' ? handleMoveToWatched : undefined}
              className="ml-2 text-xs shrink-0"
            >
              {actionType === 'watch' ? 'Move to Watched' : 'Remove'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "group relative rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300",
      isDragging && "opacity-50"
    )}>
      <div className="aspect-[2/3] relative">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-white">
          <div>
            <h3 className="font-medium text-sm mb-1">{movie.title}</h3>
            <p className="text-xs text-neutral-300">{movie.year}</p>
            {movie.plot && <p className="text-xs mt-2 line-clamp-4">{movie.plot}</p>}
          </div>
          {actionType && (
            <Button
              size="sm"
              variant="secondary"
              onClick={actionType === 'watch' ? handleMoveToWatched : undefined}
              className="w-full mt-2"
            >
              {actionType === 'watch' ? 'Move to Watched' : 'Remove'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
  );
}