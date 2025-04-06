import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { useMovies } from "@/lib/movies";
import { useQueryClient } from "@tanstack/react-query";
import type { Movie, ListChangeHandler, MovieAction } from "@/lib/types";
import { moveToWatched, removeFromWatchList } from "@/lib/api";
import { logStateChange, logError } from '../utils/logger';
import { handleError, ErrorSeverity } from "@/utils/errorHandler";
import MovieCard from './MovieCard';
import MovieDetail from './MovieDetail';

interface WatchListProps {
  onListsChange?: ListChangeHandler;
}

export default function WatchList({ onListsChange }: WatchListProps) {
  const queryClient = useQueryClient();
  const { watchlist, reorderWatchlist } = useMovies();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleRemoveFromWatchList = async (movie: Movie) => {
    try {
      await removeFromWatchList(movie.id);
      console.log(`Successfully removed movie ${movie.title} from watchlist`);
      
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

  const handleDragEnd = useCallback(async (result: any) => {
    if (!result.destination) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    // Update UI immediately without waiting
    requestAnimationFrame(() => {
      const newOrder = [...watchlist];
      const [movedItem] = newOrder.splice(startIndex, 1);
      newOrder.splice(endIndex, 0, movedItem);
      queryClient.setQueryData(['watchlist'], newOrder);
    });

    try {
      await reorderWatchlist(startIndex, endIndex);
    } catch (error) {
      handleError(error, {
        component: "WatchList",
        title: "Failed to Reorder List",
        fallbackMessage: "Could not save the new order of your watch list.",
        severity: ErrorSeverity.ERROR,
        showToast: true
      });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    }
  }, [watchlist, reorderWatchlist, queryClient]);

  return (
    <>
      <Card className="border border-neutral-200">
        <CardContent>
        <DragDropContext 
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(result) => {
            setIsDragging(false);
            try {
              if (!result.destination) return;
              handleDragEnd(result);
              logStateChange('WatchList', 'item reordered', result);
            } catch (error) {
              handleError(error, {
                component: "WatchList",
                title: "Drag and Drop Error",
                fallbackMessage: "An error occurred while reordering items.",
                severity: ErrorSeverity.ERROR,
                showToast: true
              });
              logError('WatchList', error);
            }
          }}
        >
          <Droppable droppableId="watchlist">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {watchlist?.map((movie: Movie, index: number) => (
                  <Draggable
                    key={movie.id}
                    draggableId={movie.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <MovieCard
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        movie={movie}
                        actions={[
                          { type: "watch", handler: handleMoveToWatchedList },
                          { type: "remove", handler: handleRemoveFromWatchList },
                          { type: "details", handler: () => {
                            setSelectedMovie(movie);
                            setIsDetailOpen(true);
                          }}
                        ]}
                        isDragging={isDragging}
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        </CardContent>
      </Card>
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