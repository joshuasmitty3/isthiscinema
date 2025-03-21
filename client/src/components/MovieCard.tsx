
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

      {/* Rating Badge */}
      {movie.inWatchedList && (
        <div className="absolute top-2 right-2 bg-black/75 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
          <RiStarFill className="h-3 w-3 text-yellow-400" />
          {movie.rating ? (
            <span>{movie.rating}/5</span>
          ) : (
            movie.review && <span>Reviewed</span>
          )}
        </div>
      )}

      {/* Quick Actions */}
      {onAction && !isCompact && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/75 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleAction}
              className={cn(
                "text-xs transition-colors",
                actionType === "add" && "bg-primary hover:bg-primary/90",
                actionType === "watch" && "bg-emerald-600 hover:bg-emerald-700",
                actionType === "remove" && "bg-red-600 hover:bg-red-700"
              )}
              size="sm"
            >
              <span className="flex items-center gap-1">
                {actionType === "add" && <RiAddLine className="h-3 w-3" />}
                {actionType === "watch" && <RiEyeLine className="h-3 w-3" />}
                {actionType === "remove" && <RiDeleteBin6Line className="h-3 w-3" />}
                <span className="hidden sm:inline">
                  {actionType === "add" && "Add"}
                  {actionType === "watch" && "Watch"}
                  {actionType === "remove" && "Remove"}
                </span>
              </span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
import { Movie } from "@/lib/movies";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <img 
        src={movie.poster} 
        alt={movie.title} 
        className="w-full h-48 object-cover rounded"
      />
      <h3 className="mt-2 font-semibold">{movie.title}</h3>
      <p className="text-gray-500">{movie.year}</p>
    </div>
  );
}
