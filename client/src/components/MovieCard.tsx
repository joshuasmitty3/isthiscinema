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

// Pre-define icon components to avoid recreation
const icons = {
  watch: <RiEyeLine className="w-4 h-4" />,
  remove: <RiDeleteBin6Line className="w-4 h-4" />,
  details: <RiInformationLine className="w-4 h-4" />
};

interface ExtendedMovieCardProps extends MovieCardProps {
  isDragging?: boolean;
}

export default React.forwardRef<HTMLDivElement, ExtendedMovieCardProps>(function MovieCard(
  { movie, actions, isCompact = false, isDragging, ...props }, 
  ref
) {
  return (
    <div 
      ref={ref}
      {...props}
      className={`bg-white border border-neutral-200 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
        isCompact ? 'p-2' : 'p-3'
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start">
        <img
          src={movie.poster !== "N/A" ? movie.poster : "https://via.placeholder.com/300x450?text=No+Poster"}
          alt={movie.title}
          className={`rounded object-cover ${isCompact ? 'w-16 h-24' : 'w-20 h-28'}`}
        />
        <div className="flex-1 pl-3 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{movie.title}</h3>
            <span className="text-xs text-neutral-600 whitespace-nowrap">{movie.year}</span>
          </div>
          <div className="mt-2 flex space-x-1">
            {actions.map(({type, handler}) => (
              <button
                key={type}
                className={`p-1 rounded-full ${
                  type === "watch" ? "text-emerald-600 hover:bg-emerald-500/10" :
                  type === "remove" ? "text-red-600 hover:bg-red-500/10" :
                  "text-blue-600 hover:bg-blue-500/10"
                }`}
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