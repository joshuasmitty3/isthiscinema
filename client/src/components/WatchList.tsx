import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useCallback } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query'; // Added imports
import { useMovies } from '@/lib/movies';
import MovieCard from './MovieCard';

interface WatchListProps {
  onListsChange?: () => void;
}

export default function WatchList({ onListsChange }: WatchListProps) {
  const queryClient = useQueryClient(); // Added useQueryClient
  const { watchlist, watchedlist, reorderWatchlist, refetchLists } = useMovies();

  const handleDragEnd = useCallback(async (result: any) => {
    if (!result.destination) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    try {
      const newOrder = [...watchlist];
      const [movedItem] = newOrder.splice(startIndex, 1);
      newOrder.splice(endIndex, 0, movedItem);

      // Optimistically update the UI
      queryClient.setQueryData(['watchlist'], newOrder);

      // Update server
      const response = await fetch('/api/watchlist/order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieIds: newOrder.map(movie => movie.id) })
      });

      if (!response.ok) {
        throw new Error('Failed to update order on server');
      }
    } catch (error) {
      console.error('Failed to update order:', error);
      // Revert optimistic update on error
      queryClient.setQueryData(['watchlist'], watchlist);
    }
  }, [reorderWatchlist, watchlist, queryClient]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Watch List</h2>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="watchlist">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {watchlist.map((movie, index) => (
                  <Draggable key={movie.id} draggableId={movie.id.toString()} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <MovieCard
                          movie={movie}
                          actionType="watch"
                          isCompact={true}
                          onListsChange={onListsChange}
                        />
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

      <div>
        <h2 className="text-2xl font-bold mb-4">Watched List</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchedlist.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              actionType="remove"
              isCompact={true}
              onListsChange={() => {
                queryClient.invalidateQueries(['watchlist']);
                queryClient.invalidateQueries(['watchedlist']);
                refetchLists(); // Call refetchLists to update the UI
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}