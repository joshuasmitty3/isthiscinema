import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { useMovies } from "@/lib/movies";
import { useQueryClient } from "@tanstack/react-query";
import type { Movie } from "@/lib/types";
import { moveToWatched } from "@/lib/api";
import { logStateChange, logError } from '../utils/logger'; // Added logError import

interface WatchListProps {
  onListsChange?: () => void;
}

export default function WatchList({ onListsChange }: WatchListProps) {
  const queryClient = useQueryClient();
  const { watchlist, reorderWatchlist } = useMovies();
  const [isDragging, setIsDragging] = useState(false);

  const handleRemoveFromWatchList = async (movie: Movie) => {
    try {
      const response = await fetch(`/api/watchlist/${movie.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove movie');
      }

      console.log(`Successfully removed movie ${movie.title} from watchlist`);

      if (onListsChange) {
        onListsChange();
      }
    } catch (error) {
      console.error('Failed to remove movie:', error);
      // Here we could add UI error feedback
    }
  };

  const handleMoveToWatchedList = async (movie: Movie) => {
    try {
      await fetch(`/api/movies/${movie.id}/move-to-watched`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      await Promise.all([
        queryClient.invalidateQueries(['watchlist']),
        queryClient.invalidateQueries(['watchedlist'])
      ]);

      if (onListsChange) {
        onListsChange();
      }
    } catch (error) {
      console.error('Failed to mark as watched:', error);
    }
  };

  const handleMoveToWatched = async (movie: Movie) => {
    try {
      await fetch(`/api/movies/${movie.id}/move-to-watched`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      await queryClient.invalidateQueries(['watchlist']);
      await queryClient.invalidateQueries(['watchedlist']);

      if (onListsChange) {
        onListsChange();
      }
    } catch (error) {
      console.error('Failed to mark as watched:', error);
    }
  };

  const handleDragEnd = useCallback(async (result: any) => {
    if (!result.destination) return;
    setIsDragging(true);

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    const newOrder = [...watchlist];
    const [movedItem] = newOrder.splice(startIndex, 1);
    newOrder.splice(endIndex, 0, movedItem);

    queryClient.setQueryData(['watchlist'], newOrder);

    try {
      await reorderWatchlist(startIndex, endIndex);
    } catch (error) {
      console.error('Failed to reorder watchlist:', error);
      queryClient.invalidateQueries(['watchlist']);
    } finally {
      setIsDragging(false);
    }
  }, [watchlist, reorderWatchlist, queryClient]);

  return (
    <Card className="border border-neutral-200">
      <CardContent>
        <DragDropContext onDragEnd={(result) => {
  try {
    handleDragEnd(result);
    logStateChange('WatchList', 'item reordered', result);
  } catch (error) {
    logError('WatchList', error);
  }
}}>
          <Droppable droppableId="watchlist">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {watchlist?.map((movie, index) => (
                  <Draggable
                    key={movie.id}
                    draggableId={movie.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`bg-white p-4 rounded-lg shadow-sm border border-neutral-200 ${
                          isDragging ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-16 flex-shrink-0">
                            <img
                              src={movie.poster}
                              alt={movie.title}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                          <div className="flex-1 pl-3 min-w-0 flex justify-between items-center">
                            <div>
                              <h3 className="font-medium text-sm truncate">{movie.title}</h3>
                              <p className="text-xs text-neutral-600">{movie.year} • {movie.director}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <MovieCard
                                movie={movie}
                                actions={[
                                  { type: "watch", handler: handleMoveToWatchedList },
                                  { type: "remove", handler: handleRemoveFromWatchList },
                                  { type: "details", handler: () => {
                                    setSelectedMovie(movie);
                                    setIsDetailOpen(true);
                                  }}
                                ]}
                                isCompact={true}
                              />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
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
  );
}