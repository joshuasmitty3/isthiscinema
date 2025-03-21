
import { cn } from "@/lib/utils";
import { Movie } from "@/lib/types";
import { Button } from "./ui/button";
import { useState } from "react";

interface MovieCardProps {
  movie: Movie;
  onAction?: (movie: Movie) => void;
  actionType?: 'add' | 'watch' | 'remove';
  isCompact?: boolean;
  isDragging?: boolean;
}

export default function MovieCard({ movie, onAction, actionType, isCompact = false, isDragging = false }: MovieCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const handleAction = () => {
    if (onAction) {
      onAction(movie);
    }
  };

  // Compact view for watch/watched lists
  if (isCompact) {
    return (
      <div 
        className={cn(
          "group relative bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer",
          isDragging && "opacity-50"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="p-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-sm">{movie.title}</h3>
              <p className="text-xs text-neutral-600">{movie.year} • {movie.director}</p>
            </div>
            {actionType && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction();
                }}
                className="ml-2 text-xs shrink-0"
              >
                {actionType === 'remove' ? 'Remove' : actionType === 'watch' ? 'Watch' : 'Add'}
              </Button>
            )}
          </div>
          {expanded && (
            <div className="mt-3">
              <img
                src={movie.poster !== "N/A" ? movie.poster : "https://via.placeholder.com/300x450?text=No+Poster"}
                alt={movie.title}
                className="w-full max-w-[200px] mx-auto rounded"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full card view for search results
  return (
    <div className={cn(
      "group relative rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300",
      isDragging && "opacity-50"
    )}>
      <div className="aspect-[2/3] relative">
        <img
          src={movie.poster !== "N/A" ? movie.poster : "https://via.placeholder.com/300x450?text=No+Poster"}
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
              onClick={handleAction}
              className="w-full mt-2"
            >
              {actionType === 'remove' ? 'Remove' : actionType === 'watch' ? 'Watch' : 'Add'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
