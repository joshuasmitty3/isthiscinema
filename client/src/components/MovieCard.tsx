import React, { forwardRef } from 'react';
import type { Movie } from '@/lib/types';
import { Eye, Trash2, Info, Star } from 'lucide-react';

interface Action {
  type: 'watch' | 'remove' | 'details' | 'review';
  handler: (movie: Movie) => void;
}

interface MovieCardProps {
  movie: Movie;
  actions: Action[];
  isDragging?: boolean;
}

const icons = {
  watch: <Eye size={20} />,
  remove: <Trash2 size={20} />,
  details: <Info size={20} />,
  review: <Star size={20} />
};

const actionStyles = {
  watch: "text-[hsl(30,25%,40%)] hover:bg-[hsl(30,25%,95%)]",
  remove: "text-red-600 hover:bg-red-50",
  details: "text-[hsl(30,25%,40%)] hover:bg-[hsl(30,25%,95%)]",
  review: "text-yellow-600 hover:bg-yellow-50"
};

export default forwardRef<HTMLDivElement, MovieCardProps>(function MovieCard(
  { movie, actions, isDragging, ...props }, 
  ref
) {
  return (
    <div
      ref={ref}
      className={`
        bg-white border border-neutral-200 rounded-lg overflow-hidden
        ${isDragging ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}
        transition-shadow
      `}
      {...props}
    >
      <div className="flex p-3">
        <div className="w-20 h-28 flex-shrink-0 rounded overflow-hidden">
          <img
            src={movie.poster !== "N/A" ? movie.poster : "https://via.placeholder.com/300x450?text=No+Poster"}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 pl-3 min-w-0">
          <h3 className="font-medium text-lg truncate">{movie.title}</h3>
          <p className="text-sm text-neutral-600">{movie.year}</p>
          {movie.genre && (
            <p className="text-xs text-neutral-600">
              <span className="font-medium">Genre:</span> {movie.genre}
            </p>
          )}
          {movie.actors && (
            <p className="text-xs text-neutral-600">
              <span className="font-medium">Cast:</span> {movie.actors}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            {actions.map(({type, handler}) => (
              <button
                key={type}
                className={`
                  p-2 rounded-md transition-all hover:scale-110
                  ${actionStyles[type]}
                `}
                onClick={() => handler(movie)}
              >
                {icons[type]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});