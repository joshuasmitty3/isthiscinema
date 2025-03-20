import React from "react";
import { Movie } from "@/lib/types";
import { RiAddLine, RiEyeLine, RiDeleteBin6Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";

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
      className="movie-card bg-white border border-neutral-200 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      {view === "search" && (
        <div className="relative aspect-[2/3]">
          <img
            src={movie.poster !== "N/A" ? movie.poster : "https://via.placeholder.com/300x450?text=No+Poster"}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          {onAddToWatchList && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onAddToWatchList();
              }}
              disabled={isProcessing}
              className="absolute top-2 right-2 p-1 bg-primary/90 text-white rounded-full hover:bg-primary"
              size="icon"
              variant="ghost"
            >
              <RiAddLine className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {view === "watchlist" && (
        <div className="flex">
          <div className="w-16 h-24 flex-shrink-0">
            <img
              src={movie.poster !== "N/A" ? movie.poster : "https://via.placeholder.com/300x450?text=No+Poster"}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
            <div>
              <h3 className="font-medium truncate">{movie.title}</h3>
              <p className="text-xs text-neutral-600">{movie.year}</p>
            </div>
            <div className="flex space-x-2 mt-1">
              {onMoveToWatched && (
                <Button
                  size="sm"
                  className="text-xs px-2 py-1 bg-[#4CAF50]/10 text-[#4CAF50] hover:bg-[#4CAF50]/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveToWatched();
                  }}
                  disabled={isProcessing}
                >
                  <RiEyeLine className="mr-1 h-3 w-3" /> Watched
                </Button>
              )}
              <Button
                size="sm"
                className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              >
                Details
              </Button>
              {onRemoveFromWatchList && (
                <Button
                  size="sm"
                  className="text-xs px-2 py-1 bg-[#F44336]/10 text-[#F44336] hover:bg-[#F44336]/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromWatchList();
                  }}
                  disabled={isProcessing}
                >
                  <RiDeleteBin6Line className="mr-1 h-3 w-3" /> Remove
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {view === "watched" && (
        <div className="p-2">
          <h3 className="text-sm font-medium truncate">{movie.title}</h3>
          <p className="text-xs text-neutral-600">{movie.year}</p>
          {movie.review && (
            <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{movie.review}</p>
          )}
        </div>
      )}
    </div>
  );
}
