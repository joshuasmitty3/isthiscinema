import { useState } from 'react';
import { Movie } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RiAddLine, RiEyeLine, RiDeleteBin6Line } from 'react-icons/ri';

interface MovieCardProps {
  movie: Movie;
  onAction?: (movie: Movie) => void;
  actionType?: "add" | "watch" | "remove";
  isCompact?: boolean;
}

export default function MovieCard({ movie, onAction, actionType, isCompact = false }: MovieCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAction) {
      onAction(movie);
    }
  };

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className={`group relative rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${isExpanded ? 'h-auto' : 'h-24'}`}
      onClick={handleClick}
    >
      {isExpanded ? (
        <div className="aspect-[2/3] relative">
          <img
            src={movie.poster !== "N/A" ? movie.poster : "https://via.placeholder.com/300x450?text=No+Poster"}
            alt={movie.title}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-white">
            <div>
              <h3 className="font-medium text-sm mb-1 line-clamp-2">{movie.title}</h3>
              <p className="text-xs text-neutral-300">{movie.year}</p>
              {movie.director && (
                <p className="text-xs text-neutral-300 mt-1">{movie.director}</p>
              )}
              {movie.plot && (
                <p className="text-xs text-neutral-200 mt-2 line-clamp-3">{movie.plot}</p>
              )}
            </div>
          </div>

          {/* Compact Action Buttons */}
          {onAction && isCompact && (
            <div className="absolute bottom-2 right-2">
              <Button
                onClick={handleAction}
                size="sm"
                variant="ghost"
                className={cn(
                  "text-xs text-white",
                  actionType === "add" && "bg-primary/90 hover:bg-primary",
                  actionType === "watch" && "bg-emerald-600/90 hover:bg-emerald-600",
                  actionType === "remove" && "bg-red-600/90 hover:bg-red-600"
                )}
              >
                {actionType === "add" && <RiAddLine className="h-3 w-3" />}
                {actionType === "watch" && <RiEyeLine className="h-3 w-3" />}
                {actionType === "remove" && <RiDeleteBin6Line className="h-3 w-3" />}
              </Button>
            </div>
          )}

          {/* Regular Action Buttons */}
          {onAction && !isCompact && (
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/75 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleAction}
                  className={cn(
                    "text-xs transition-colors",
                    actionType === "add" && "bg-primary hover:bg-primary/90",
                    actionType === "watch" && "bg-emerald-600 hover:bg-emerald-700",
                    actionType === "remove" && "bg-red-600 hover:bg-red-700"
                  )}
                  size="sm"
                >
                  <span className="flex items-center gap-1">
                    {actionType === "add" && <RiAddLine className="h-3 w-3" />}
                    {actionType === "watch" && <RiEyeLine className="h-3 w-3" />}
                    {actionType === "remove" && <RiDeleteBin6Line className="h-3 w-3" />}
                    <span className="hidden sm:inline">
                      {actionType === "add" && "Add"}
                      {actionType === "watch" && "Watch"}
                      {actionType === "remove" && "Remove"}
                    </span>
                  </span>
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-[2/3] relative flex items-center justify-center p-4 bg-neutral-100">
          <h3 className="text-center font-medium text-sm">{movie.title}</h3>
        </div>
      )}
    </div>
  );
}