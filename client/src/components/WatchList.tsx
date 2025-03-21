
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useCallback } from 'react';
import { useMovies } from '@/lib/movies';
import MovieCard from './MovieCard';

interface WatchListProps {
  onListsChange?: () => void;
}

export default function WatchList({ onListsChange }: WatchListProps) {
  const { watchlist, watchedlist, reorderWatchlist } = useMovies();

  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    reorderWatchlist(startIndex, endIndex);
  }, [reorderWatchlist]);

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
              onListsChange={onListsChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
