
import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Card, CardContent } from "@/components/ui/card";
import { useMovies } from "../hooks/use-movies";
import { useQueryClient } from "@tanstack/react-query";
import { Movie } from "@/lib/types";

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

      if (!response.ok) {
        throw new Error('Failed to remove movie');
      }

      if (onListsChange) {
        onListsChange();
      }
    } catch (error) {
      console.error('Failed to remove movie:', error);
    }
  };

  const handleMoveToWatched = async (movie: Movie) => {
    try {
      const response = await fetch(`/api/watchlist/${movie.id}/watched`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to mark as watched');
      }

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
        <DragDropContext onDragEnd={handleDragEnd}>
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
                              <button
                                onClick={() => handleMoveToWatched(movie)}
                                className="flex items-center justify-center h-6 w-6 rounded-md bg-[#4CAF50]/10 hover:bg-[#4CAF50]/20 text-[#4CAF50] transition-colors"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </button>
                              <button
                                onClick={() => handleRemoveFromWatchList(movie)}
                                className="flex items-center justify-center h-6 w-6 rounded-md bg-[#8B4513]/10 hover:bg-[#8B4513]/20 text-[#8B4513] transition-colors"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                </svg>
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
