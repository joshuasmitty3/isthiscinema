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

  const handleDragEnd = useCallback(async (result: any) => {
    setIsDragging(true);
    if (!result.destination) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    const newOrder = [...watchlist];
    const [movedItem] = newOrder.splice(startIndex, 1);
    newOrder.splice(endIndex, 0, movedItem);

    queryClient.setQueryData(['watchlist'], newOrder);

    try {
      await reorderWatchlist(
        result.draggableId,
        startIndex,
        endIndex
      );
    } catch (error) {
      console.error('Failed to reorder watchlist:', error);
    } finally {
      setIsDragging(false);
    }
  }, [watchlist, reorderWatchlist, queryClient]);

  return (
    <Card className="border border-neutral-200">
      <CardContent className="p-4">
        <h2 className="text-lg font-medium font-heading mb-4">Watch List</h2>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="watchlist">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {watchlist.map((movie, index) => (
                  <Draggable key={movie.id} draggableId={movie.id.toString()} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="movie-card bg-white border border-neutral-200 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start p-3">
                          <div className="w-20 h-28 flex-shrink-0 rounded overflow-hidden">
                            <img 
                              src={movie.poster !== "N/A" ? movie.poster : "https://via.placeholder.com/300x450?text=No+Poster"}
                              alt={movie.title} 
                              className="w-full h-full object-cover"
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