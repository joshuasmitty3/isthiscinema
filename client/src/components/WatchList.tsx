import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useCallback } from "react";
import MovieCard from "./MovieCard";
import { useMovies } from "@/lib/movies";

export default function WatchList() {
  const { watchlist, reorderWatchlist } = useMovies();

  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    reorderWatchlist(startIndex, endIndex);
  }, [reorderWatchlist]);

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4">Watch List</h2>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="watchlist">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-4"
            >
              {watchlist.map((movie, index) => (
                <Draggable 
                  key={movie.imdbId} 
                  draggableId={movie.imdbId} 
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
                    >
                      <MovieCard movie={movie} />
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
  );
}