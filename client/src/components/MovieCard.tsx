import React from "react";
import { Movie } from "@/lib/types";
import { RiAddLine, RiEyeLine, RiDeleteBin6Line, RiStarLine, RiStarFill } from "react-icons/ri";
import { Button } from "./ui/button";
import { LoadingSpinner } from "./ui/loading-spinner";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  movie: Movie;
  view: "search" | "watchlist" | "watched";
  onAction?: (movie: Movie) => void;
  onSelectMovie?: (movie: Movie) => void;
  isProcessing?: boolean;
}

export default function MovieCard({ movie, view, onAction, onSelectMovie, isProcessing }: MovieCardProps) {
  return (
    <div className="group relative bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/50">
      <div className="relative aspect-[2/3]">
        <img
          src={movie.poster !== "N/A" ? movie.poster : "https://via.placeholder.com/300x450?text=No+Poster"}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Rating Badge for Watched Movies */}
        {view === "watched" && movie.rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/75 rounded-full px-2 py-1 z-10">
            <RiStarFill className="h-3.5 w-3.5 text-yellow-400" />
            <span className="text-white text-xs font-medium">{movie.rating}</span>
          </div>
        )}

        {/* Hover Overlay with Details */}
        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-white">
          <div>
            <LoadingSpinner className="mb-2" />
            <h3 className="font-medium text-sm mb-1 line-clamp-2">{movie.title}</h3>
            <p className="text-xs text-neutral-300">{movie.year}</p>
            {movie.director && (
              <p className="text-xs text-neutral-400 mt-2">Dir. {movie.director}</p>
            )}
          </div>

          <div className="space-y-2">
            <Button
              size="sm"
              className="w-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              onClick={() => onSelectMovie?.(movie)}
            >
              Details
            </Button>

            {onAction && (
              <Button
                size="sm"
                className={cn(
                  "w-full flex items-center justify-center gap-2 transition-colors",
                  view === "search" && "bg-primary/90 hover:bg-primary text-white",
                  view === "watchlist" && "bg-emerald-500/90 hover:bg-emerald-500 text-white",
                  view === "watched" && "bg-red-500/90 hover:bg-red-500 text-white"
                )}
                onClick={() => onAction(movie)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <LoadingSpinner className="h-4 w-4" />
                ) : (
                  <>
                    {view === "search" && <RiAddLine className="h-4 w-4" />}
                    {view === "watchlist" && <RiEyeLine className="h-4 w-4" />}
                    {view === "watched" && <RiDeleteBin6Line className="h-4 w-4" />}
                    <span>
                      {view === "search" && "Add to Watch"}
                      {view === "watchlist" && "Mark Watched"}
                      {view === "watched" && "Remove"}
                    </span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}