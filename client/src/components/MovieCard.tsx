
import React from 'react';
import { RiEyeLine, RiDeleteBin6Line, RiInformationLine } from "react-icons/ri";
import type { Movie } from "@/lib/types";

interface MovieCardProps {
  movie: Movie;
  actions: {
    type: string;
    handler: (movie: Movie) => void;
  }[];
  isCompact?: boolean;
}

interface ExtendedMovieCardProps extends MovieCardProps {
  isDragging?: boolean;
}

const icons = {
  watch: <RiEyeLine className="w-4 h-4" />,
  remove: <RiDeleteBin6Line className="w-4 h-4" />,
  details: <RiInformationLine className="w-4 h-4" />
};

export default React.forwardRef<HTMLDivElement, ExtendedMovieCardProps>(function MovieCard(
  { movie, actions, isCompact = false, isDragging, ...props }, 
  ref
) {
  return (
    <div 
      ref={ref}
      {...props}
      className={`
        bg-white rounded-lg overflow-hidden
        border border-neutral-200
        shadow hover:shadow-md
        transition-all duration-200 ease-in-out
        ${isCompact ? 'p-3' : 'p-4'}
        ${isDragging ? 'opacity-50 scale-95 rotate-2' : 'opacity-100'}
      `}
    >
      <div className="flex gap-3">
        <img
          src={movie.poster !== "N/A" ? movie.poster : "https://via.placeholder.com/300x450?text=No+Poster"}
          alt={movie.title}
          className={`rounded-md object-cover ${isCompact ? 'w-16 h-24' : 'w-24 h-36'}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-medium text-neutral-900 line-clamp-2">{movie.title}</h3>
            <span className="text-xs text-neutral-600 whitespace-nowrap">{movie.year}</span>
          </div>
          {!isCompact && movie.director && (
            <p className="text-xs text-neutral-600 mt-1">
              {movie.director} • {movie.runtime || 'N/A'}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            {actions.map(({type, handler}) => (
              <button
                key={type}
                className={`
                  p-2 rounded-md transition-all
                  ${type === "watch" ? "text-emerald-600 hover:bg-emerald-50 hover:scale-110" :
                    type === "remove" ? "text-red-600 hover:bg-red-50 hover:scale-110" :
                    "text-blue-600 hover:bg-blue-50 hover:scale-110"}
                `}
                onClick={() => handler(movie)}
              >
                {icons[type] || null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
