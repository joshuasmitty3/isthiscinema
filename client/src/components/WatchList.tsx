import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useCallback } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useMovies } from '@/lib/movies';
import MovieCard from './MovieCard';
import { ListSkeleton } from './ListSkeleton';

import { useState } from 'react';

interface WatchListProps {
  onListsChange?: () => void;
}

export default function WatchList({ onListsChange }: WatchListProps) {
  const queryClient = useQueryClient();
  const { watchlist, reorderWatchlist, refetchLists } = useMovies();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = useCallback(async (result: any) => {
    setIsDragging(true);
    if (!result.destination) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    // Update local state immediately
    const newOrder = [...watchlist];
    const [movedItem] = newOrder.splice(startIndex, 1);
    newOrder.splice(endIndex, 0, movedItem);

    // Set optimistic update
    queryClient.setQueryData(['watchlist'], newOrder);

    try {
      // Update server
      await fetch('/api/watchlist/order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieIds: newOrder.map(movie => movie.id) })
      });
    } catch (error) {
      console.error('Failed to update order:', error);
      // Only refetch on error
      queryClient.invalidateQueries(['watchlist']);
    } finally {
      setIsDragging(false);
    }
  }, [watchlist, queryClient]);

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
                            <h3 className="font-medium">{movie.title}</h3>
                            <MovieCard
                              movie={movie}
                              actionType="watch"
                              isCompact={true}
                              onListsChange={onListsChange}
                            />
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
      </div>
    </div>
  );
}