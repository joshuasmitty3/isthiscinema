import React from "react";
import { Movie } from "@/lib/types";
import { RiAddLine, RiEyeLine, RiDeleteBin6Line, RiStarLine, RiStarFill } from "react-icons/ri";
import { Button } from "@/components/ui/button";
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
    <div className="group relative bg-white border border-neutral-200 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="relative aspect-[2/3]">
        <img
          src={movie.poster !== "N/A" ? movie.poster : "https://via.placeholder.com/300x450?text=No+Poster"}
          alt={movie.title}
          className="w-full h-full object-cover"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between">
          <div className="text-white">
            <h3 className="font-medium text-sm mb-1">{movie.title}</h3>
            <p className="text-xs text-neutral-300">{movie.year}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              className="w-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              onClick={() => onSelectMovie?.(movie)}
            >
              Details
            </Button>

            {view === "watched" && movie.rating && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 rounded-full px-2 py-1">
                <RiStarFill className="h-4 w-4 text-yellow-400" />
                <span className="text-white text-sm font-medium">{movie.rating}</span>
              </div>
            )}

            {onAction && (
              <Button
                size="sm"
                className={cn(
                  "w-full transition-colors",
                  view === "search" && "bg-primary/90 text-white hover:bg-primary",
                  view === "watchlist" && "bg-green-500/90 text-white hover:bg-green-500",
                  view === "watched" && "bg-red-500/90 text-white hover:bg-red-500"
                )}
                onClick={() => onAction(movie)}
                disabled={isProcessing}
              >
                {view === "search" && <RiAddLine className="mr-1" />}
                {view === "watchlist" && <RiEyeLine className="mr-1" />}
                {view === "watched" && <RiDeleteBin6Line className="mr-1" />}
                {view === "search" && "Add to Watch List"}
                {view === "watchlist" && "Mark as Watched"}
                {view === "watched" && "Remove"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}