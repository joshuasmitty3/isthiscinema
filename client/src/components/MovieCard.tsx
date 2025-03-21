
import { useState } from 'react';
import { Movie } from '@/lib/types';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  movie: Movie;
  onAction?: (movie: Movie) => void;
  actionType?: 'add' | 'watch' | 'remove';
  isCompact?: boolean;
  isDragging?: boolean;
}

export default function MovieCard({ movie, onAction, actionType, isCompact = false, isDragging = false }: MovieCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAction = () => {
    if (onAction) {
      onAction(movie);
    }
  };

  if (isCompact) {
    return (
      <div className={cn(
        "group relative bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300",
        isDragging && "opacity-50"
      )}>
        <div 
          className="p-3 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex justify-between items-start">
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
                className="ml-2 text-xs"
              >
                {actionType === 'remove' ? 'Remove' : actionType === 'watch' ? 'Watch' : 'Add'}
              </Button>
            )}
          </div>
          
          {isExpanded && (
            <div className="mt-3">
              <div className="aspect-[2/3] w-24 mx-auto mb-3">
                <img
                  src={movie.poster !== "N/A" ? movie.poster : "https://via.placeholder.com/300x450?text=No+Poster"}
                  alt={movie.title}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <p className="text-sm text-neutral-700 line-clamp-3">{movie.plot}</p>
              {movie.actors && (
                <p className="text-xs text-neutral-600 mt-2">Cast: {movie.actors}</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Original full card view for search results
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
