import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Movie } from "@/lib/types";
import MovieSkeleton from "./MovieSkeleton";
import MovieDetail from "./MovieDetail";
import { useState } from "react";

interface MovieCardProps {
  movie: Movie;
  onAction?: (movie: Movie) => void;
  actionType?: 'watch' | 'remove';
  isCompact?: boolean;
  isLoading?: boolean;
  isDragging?: boolean;
}

export default function MovieCard({ movie, onAction, actionType, isCompact, isLoading, isDragging }: MovieCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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

    if (response.ok) {
      if (onAction) {
        onAction(movie);
      }
      toast({
        title: "Success",
        description: `${movie.title} removed from watched list`,
      });
    }
  };

  const handleListsChange = () => {
    queryClient.invalidateQueries(['watchlist']);
    queryClient.invalidateQueries(['watchedlist']);
  };

  return (
    <>
      <div className={`bg-white rounded-lg shadow-md p-4 ${isDragging ? 'opacity-50' : ''}`}>
        <div 
          onClick={() => setIsDetailOpen(true)}
          className="cursor-pointer"
        >
          <img src={movie.poster} alt={movie.title} className="w-full h-48 object-cover rounded-md mb-4" />
          <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>
          {!isCompact && (
            <>
              <p className="text-gray-600 mb-2">{movie.year}</p>
              <p className="text-gray-600 mb-4">{movie.director}</p>
            </>
          )}
        </div>
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
      <MovieDetail 
        movie={movie}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onListsChange={handleListsChange}
      />
    </>
  );
}