import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Movie } from "@/lib/types";
import { useState } from "react";
import { moveToWatched, removeFromWatchedList as apiRemoveFromWatchedList } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { MovieSkeleton } from './MovieSkeleton'; // Assuming this component exists

interface MovieCardProps {
  movie: Movie;
  onAction?: (movie: Movie) => void;
  actionType?: 'watch' | 'remove' | 'add'; // Added 'add' to actionType
  isCompact?: boolean;
  isLoading?: boolean;
  isDragging?: boolean;
}


export default function MovieCard({ movie, onAction, actionType, isCompact, isLoading, isDragging }: MovieCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const successSound = new Audio('/success.mp3'); // Assume this path is correct. Adjust as needed

  if (isLoading) {
    return <MovieSkeleton showActions={!!actionType} />;
  }

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
        if (onAction) {
          await onAction(movie);
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
    const response = await fetch(`/api/watchedlist/${movie.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      toast({
        title: "Failed to remove movie",
        description: "There was an error removing the movie from your watched list.",
        variant: "destructive",
      });
      return;
    }

    await Promise.all([
      queryClient.invalidateQueries(['watchlist']),
      queryClient.invalidateQueries(['watchedlist'])
    ]);

    if (onAction) {
      onAction(movie);
    }

    toast({
      title: "Removed from Watched",
      description: `${movie.title} has been removed from your watched list.`,
    });
  };

  const handleAddToWatchList = async () => {
    successSound.play().catch(console.error); // Play sound effect
    // Add your API call to add to watchlist here
    try {
      const response = await fetch(`/api/movies/${movie.id}/add-to-watchlist`, { //Example endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        await queryClient.invalidateQueries(['watchlist']);
        if (onAction) {
          await onAction(movie);
        }
        toast({ title: "Success", description: `${movie.title} added to watchlist` });
      } else {
        toast({ title: "Error", description: "Failed to add movie to watchlist", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add movie to watchlist", variant: "destructive" });
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
              onClick={actionType === 'watch' ? handleMoveToWatched : (actionType === 'remove' ? handleRemoveFromWatched : handleAddToWatchList)} // Added ternary for 'add'
              className={`px-2 h-7 text-xs shrink-0 ${actionType === 'add' ? 'animate-success group' : ''}`} // Added animation class conditionally
            >
              {actionType === 'watch' ? '✓ Watch' : (actionType === 'remove' ? 'Remove' : 'Add to Watchlist')} {/* Added 'Add to Watchlist' */}
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
      {actionType === 'add' && (
        <Button onClick={handleAddToWatchList} className="w-full animate-success group"> {/* Added animation class */}
          Add to Watchlist
        </Button>
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