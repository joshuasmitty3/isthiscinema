
import React from 'react';
import { Movie } from '@/lib/types';
import { Button } from './ui/button';
import { RiAddLine, RiEyeLine, RiDeleteBin6Line, RiStarLine, RiStarFill } from 'react-icons/ri';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  movie: Movie;
  onAction?: (movie: Movie) => void;
  actionType?: 'add' | 'watch' | 'remove';
  isCompact?: boolean;
  isDragging?: boolean;
}

export default function MovieCard({ movie, onAction, actionType, isCompact = false, isDragging = false }: MovieCardProps) {
  const handleAction = () => {
    if (onAction) {
      onAction(movie);
    }
  };

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
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-white">
          <div>
            <h3 className="font-medium text-sm mb-1">{movie.title}</h3>
            <p className="text-xs text-neutral-300">{movie.year}</p>
          </div>

          {onAction && (
            <Button
              onClick={handleAction}
              className={cn(
                "w-full mt-2",
                actionType === "add" && "bg-primary hover:bg-primary/90",
                actionType === "watch" && "bg-emerald-600 hover:bg-emerald-700",
                actionType === "remove" && "bg-red-600 hover:bg-red-700"
              )}
            >
              <span className="flex items-center gap-2">
                {actionType === "add" && <RiAddLine className="h-4 w-4" />}
                {actionType === "watch" && <RiEyeLine className="h-4 w-4" />}
                {actionType === "remove" && <RiDeleteBin6Line className="h-4 w-4" />}
                {actionType === "add" && "Add to Watch"}
                {actionType === "watch" && "Mark Watched"}
                {actionType === "remove" && "Remove"}
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
