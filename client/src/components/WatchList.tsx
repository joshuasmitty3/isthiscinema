import { useState } from "react";
import { useMovies } from "@/lib/movies";
import { useQueryClient } from "@tanstack/react-query";
import type { Movie, ListChangeHandler } from "@/lib/types";
import { moveToWatched, removeFromWatchList } from "@/lib/api";
import { handleError, ErrorSeverity } from "@/utils/errorHandler";
import MovieCard from './MovieCard';
import MovieDetail from './MovieDetail';

interface WatchListProps {
  onListsChange?: ListChangeHandler;
}

export default function WatchList({ onListsChange }: WatchListProps) {
  const queryClient = useQueryClient();
  const { watchlist } = useMovies();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleRemoveFromWatchList = async (movie: Movie) => {
    try {
      await removeFromWatchList(movie.id);

      if (onListsChange) {
        onListsChange();
      }
    } catch (error) {
      handleError(error, {
        component: "WatchList",
        title: "Failed to Remove Movie",
        fallbackMessage: `Could not remove "${movie.title}" from your watch list.`,
        severity: ErrorSeverity.ERROR,
        showToast: true
      });
    }
  };

  const handleMoveToWatchedList = async (movie: Movie) => {
    try {
      await moveToWatched(movie.id);

      // Invalidate both watchlist and watchedlist queries
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['watchedlist'] });

      if (onListsChange) {
        onListsChange();
      }
    } catch (error) {
      handleError(error, {
        component: "WatchList",
        title: "Failed to Mark as Watched",
        fallbackMessage: `Could not mark "${movie.title}" as watched.`,
        severity: ErrorSeverity.ERROR,
        showToast: true
      });
    }
  };

  return (
    <>
      <div className="space-y-3">
        {watchlist?.map((movie: Movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            actions={[
              { type: "watch", handler: handleMoveToWatchedList },
              { type: "remove", handler: handleRemoveFromWatchList },
              { type: "details", handler: () => {
                setSelectedMovie(movie);
                setIsDetailOpen(true);
              }}
            ]}
          />
        ))}
      </div>
      {selectedMovie && (
        <MovieDetail
          movie={selectedMovie}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedMovie(null);
          }}
          onListsChange={() => {
            if (onListsChange) onListsChange();
          }}
          refetch={() => {
            queryClient.invalidateQueries({ queryKey: ['watchlist'] });
            queryClient.invalidateQueries({ queryKey: ['watchedlist'] });
          }}
        />
      )}
    </>
  );
}
