import { useState } from "react";
import { useMovies } from "@/lib/movies";
import { useQueryClient } from "@tanstack/react-query";
import type { Movie, MovieAction, ListChangeHandler } from "@/lib/types";
import { moveToWatched, removeFromWatchList } from "@/lib/api";
import { handleError, ErrorSeverity } from "@/utils/errorHandler";
import MovieCard from './MovieCard';
import MovieDetail from './MovieDetail';

interface WatchListProps {
  canEdit?: boolean;
  onListsChange?: ListChangeHandler;
}

export default function WatchList({ canEdit = false, onListsChange }: WatchListProps) {
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
      {watchlist?.length === 0 ? (
        <div className="py-16 text-center font-mono text-sm text-muted-foreground">
          nothing here yet — add a film to get started.
        </div>
      ) : (
        <div className="border-t border-border">
          {watchlist?.map((movie: Movie) => {
            const actions: MovieAction[] = [
              ...(canEdit
                ? ([
                    { type: "watch", handler: handleMoveToWatchedList },
                    { type: "remove", handler: handleRemoveFromWatchList },
                  ] as MovieAction[])
                : []),
              {
                type: "details",
                handler: () => {
                  setSelectedMovie(movie);
                  setIsDetailOpen(true);
                },
              },
            ];
            return <MovieCard key={movie.id} movie={movie} actions={actions} />;
          })}
        </div>
      )}
      {selectedMovie && (
        <MovieDetail
          canEdit={canEdit}
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
