import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Movie } from "@/lib/types";
import { useState } from "react";
import { moveToWatched } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface MovieCardProps {
  movie: Movie;
  actionType: 'watch' | 'remove';
  isDragging?: boolean;
  isCompact?: boolean;
  onListsChange?: () => void;
}

async function removeFromWatchedList(movieId: number) {
  // Placeholder - Replace with actual API call
  console.log(`Removing movie ${movieId} from watched list`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
}

export default function MovieCard({ movie, actionType, isDragging, isCompact, onListsChange }: MovieCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleMoveToWatched = async () => {
    try {
      const response = await fetch(`/api/movies/${movie.id}/move-to-watched`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        await Promise.all([
          queryClient.invalidateQueries(['watchlist']),
          queryClient.invalidateQueries(['watchedlist'])
        ]);
        if (onListsChange) {
          await onListsChange();
        }
      }
      toast({
        title: "Success", 
        description: `${movie.title} moved to watched list`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move movie to watched list",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFromWatched = async () => {
    try {
      await removeFromWatchedList(movie.id);
      onListsChange();
      toast({
        title: "Removed from Watched",
        description: `${movie.title} has been removed from your watched list.`,
      });
    } catch (error) {
      console.error("Failed to remove movie:", error);
      toast({
        title: "Failed to remove movie",
        description: "There was an error removing the movie from your watched list.",
        variant: "destructive",
      });
    }
  };


  if (isCompact) {
    return (
      <div className={cn(
        "group relative bg-white border border-neutral-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300",
        isDragging && "opacity-50"
      )}>
        <div className="p-3 flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm truncate">{movie.title}</h3>
            <p className="text-xs text-neutral-600 truncate">{movie.year} • {movie.director}</p>
          </div>
          {actionType && (
            <Button
              size="sm"
              variant="ghost"
              onClick={actionType === 'watch' ? handleMoveToWatched : handleRemoveFromWatched}
              className="px-2 h-7 text-xs shrink-0"
            >
              {actionType === 'watch' ? '✓ Watch' : 'Remove'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${isDragging ? 'opacity-50' : ''}`}>
      <img src={movie.poster} alt={movie.title} className="w-full h-48 object-cover rounded-md mb-4" />
      <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>
      {!isCompact && (
        <>
          <p className="text-gray-600 mb-2">{movie.year}</p>
          <p className="text-gray-600 mb-4">{movie.director}</p>
        </>
      )}
      {actionType === 'watch' && (
        <Button onClick={handleMoveToWatched} className="w-full">
          Move to Watched
        </Button>
      )}
      {actionType === 'remove' && (
        <Button onClick={handleRemoveFromWatched} className="w-full">
          Remove from Watched
        </Button>
      )}
    </div>
  );
}