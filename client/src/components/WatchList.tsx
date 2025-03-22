
import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { useMovies } from "@/lib/movies";
import { useQueryClient } from "@tanstack/react-query";
import type { Movie } from "@/lib/types";

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
                          <div className="flex-1 pl-3 min-w-0">
                            <h3 className="font-medium mb-2">{movie.title}</h3>
                            <button 
                              onClick={() => handleRemoveFromWatchList(movie)}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
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
