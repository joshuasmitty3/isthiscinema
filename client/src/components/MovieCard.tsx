
import React from "react";
import { Movie } from "@/lib/types";
import { RiAddLine, RiEyeLine, RiDeleteBin6Line, RiStarLine, RiStarFill } from "react-icons/ri";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  movie: Movie;
  onAction?: (movie: Movie) => void;
  actionType?: "add" | "watch" | "remove";
  isCompact?: boolean;
}

export default function MovieCard({ movie, onAction, actionType, isCompact = false }: MovieCardProps) {
  const handleAction = () => {
    if (onAction) {
      onAction(movie);
    }
  };

  return (
    <div className="group relative rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300">
      {/* Movie Poster */}
      <div className="aspect-[2/3] relative">
        <img
          src={movie.poster !== "N/A" ? movie.poster : "https://via.placeholder.com/300x450?text=No+Poster"}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        
        {/* Hover Overlay with Details */}
        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-white">
          <div>
            <h3 className="font-medium text-sm mb-1 line-clamp-2">{movie.title}</h3>
            <p className="text-xs text-neutral-300">{movie.year}</p>
            {movie.director && (
              <p className="text-xs text-neutral-300 mt-1">{movie.director}</p>
            )}
            {movie.plot && (
              <p className="text-xs text-neutral-200 mt-2 line-clamp-3">{movie.plot}</p>
            )}
          </div>

          {/* Action Button */}
          {onAction && (
            <Button
              onClick={handleAction}
              className={cn(
                "w-full mt-2 transition-colors",
                actionType === "add" && "bg-primary hover:bg-primary/90",
                actionType === "watch" && "bg-emerald-600 hover:bg-emerald-700",
                actionType === "remove" && "bg-red-600 hover:bg-red-700"
              )}
            >
              <span className="flex items-center justify-center gap-2">
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

      {/* Rating Display (if movie is watched) */}
      {movie.inWatchedList && movie.review && (
        <div className="absolute top-2 right-2 bg-black/75 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
          <RiStarFill className="h-3 w-3 text-yellow-400" />
          Reviewed
        </div>
      )}
    </div>
  );
}
