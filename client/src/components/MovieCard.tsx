
import React from "react";
import { Movie } from "@/lib/types";
import { RiAddLine, RiEyeLine, RiDeleteBin6Line, RiStarLine, RiStarFill } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  movie: Movie;
  onAddToWatchList?: () => void;
  onRemoveFromWatchList?: () => void;
  onMoveToWatched?: () => void;
  onShowDetails: () => void;
  isProcessing?: boolean;
  view: "search" | "watchlist" | "watched";
}

export default function MovieCard({
  movie,
  onAddToWatchList,
  onRemoveFromWatchList,
  onMoveToWatched,
  onShowDetails,
  isProcessing = false,
  view
}: MovieCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShowDetails();
  };

  return (
    <div
      className="group movie-card bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 relative"
      onClick={handleClick}
    >
      <div className="relative aspect-[2/3]">
        <img
          src={movie.poster !== "N/A" ? movie.poster : "https://via.placeholder.com/300x450?text=No+Poster"}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <h3 className="text-sm font-medium line-clamp-2">{movie.title}</h3>
            <p className="text-xs opacity-80">{movie.year}</p>
          </div>
        </div>
        
        {view === "search" && onAddToWatchList && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onAddToWatchList();
            }}
            disabled={isProcessing}
            className={cn(
              "absolute top-2 right-2 p-1 bg-primary/90 text-white rounded-full hover:bg-primary",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            )}
            size="icon"
            variant="ghost"
          >
            <RiAddLine className="h-4 w-4" />
          </Button>
        )}

        {view === "watchlist" && (
          <div className={cn(
            "absolute top-2 right-2 flex gap-1",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          )}>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onMoveToWatched?.();
              }}
              disabled={isProcessing}
              className="p-1 bg-green-500/90 text-white rounded-full hover:bg-green-500"
              size="icon"
              variant="ghost"
            >
              <RiEyeLine className="h-4 w-4" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromWatchList?.();
              }}
              disabled={isProcessing}
              className="p-1 bg-red-500/90 text-white rounded-full hover:bg-red-500"
              size="icon"
              variant="ghost"
            >
              <RiDeleteBin6Line className="h-4 w-4" />
            </Button>
          </div>
        )}

        {view === "watched" && movie.rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 rounded-full px-2 py-1">
            <RiStarFill className="h-3 w-3 text-yellow-400" />
            <span className="text-white text-xs">{movie.rating}</span>
          </div>
        )}
      </div>

      {view === "watched" && (
        <div className="p-3">
          <h3 className="text-sm font-medium truncate">{movie.title}</h3>
          <p className="text-xs text-neutral-600">{movie.year}</p>
          {movie.review && (
            <p className="text-xs text-neutral-500 mt-1 line-clamp-2 italic">"{movie.review}"</p>
          )}
        </div>
      )}
    </div>
  );
}
