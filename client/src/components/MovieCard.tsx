import { Movie } from "@/lib/types";
import { Button } from "./ui/button";

interface MovieCardProps {
  movie: Movie;
  actionType: "watch" | "remove" | "review";
  onAction: (movie: Movie) => void;
  isCompact?: boolean;
}

export default function MovieCard({ movie, actionType, onAction, isCompact = false }: MovieCardProps) {
  const renderActionButton = () => {
    switch (actionType) {
      case "watch":
        return (
          <Button
            size="sm"
            className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
            onClick={() => onAction(movie)}
          >
            Watch
          </Button>
        );
      case "remove":
        return (
          <Button
            size="sm"
            className="text-xs px-2 py-1 bg-red-500/10 text-red-600 hover:bg-red-500/20"
            onClick={() => onAction(movie)}
          >
            Remove
          </Button>
        );
      case "review":
        return (
          <Button
            size="sm"
            className="text-xs px-2 py-1 bg-[#D2B48C]/10 text-primary hover:bg-[#D2B48C]/20"
            onClick={() => onAction(movie)}
          >
            Review
          </Button>
        );
    }
  };

  return (
    <div className="movie-card bg-white border border-neutral-200 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start p-3">
        <div className={`${isCompact ? 'w-16 h-24' : 'w-20 h-28'} flex-shrink-0 rounded overflow-hidden`}>
          <img
            src={movie.poster !== "N/A" ? movie.poster : "https://via.placeholder.com/300x450?text=No+Poster"}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 pl-3 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{movie.title}</h3>
            <span className="text-xs text-neutral-600 whitespace-nowrap">{movie.year}</span>
          </div>
          {!isCompact && (
            <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{movie.plot}</p>
          )}
          {movie.review && (
            <div className="mt-2 bg-neutral-100 rounded p-2">
              <p className="text-xs line-clamp-2">{movie.review}</p>
            </div>
          )}
          <div className="mt-2 flex space-x-2">
            {renderActionButton()}
          </div>
        </div>
      </div>
    </div>
  );
}