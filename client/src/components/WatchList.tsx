import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { useMovies } from "@/lib/movies";
import type { Movie } from "@/lib/types";
import MovieCard from './MovieCard';
import MovieDetail from './MovieDetail';

interface WatchListProps {
  listType: 'watch' | 'watched';
  onListsChange?: () => void;
}

export default function WatchList({ listType, onListsChange }: WatchListProps) {
  const { watchlist, watchedList, reorderWatchlist } = useMovies();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const movies = listType === 'watch' ? watchlist : watchedList;

  const handleRemoveMovie = async (movie: Movie) => {
    try {
      const endpoint = listType === 'watch' ? 
        `/api/watchlist/${movie.id}` : 
        `/api/watchedlist/${movie.id}`;

      const response = await fetch(endpoint, {
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

  const handleMoveToWatchedList = async (movie: Movie) => {
    try {
      await fetch(`/api/movies/${movie.id}/move-to-watched`, {
        method: 'POST',
      });

      if (onListsChange) {
        onListsChange();
      }
    } catch (error) {
      console.error('Failed to move movie:', error);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination || listType !== 'watch') return;
    reorderWatchlist(result.source.index, result.destination.index);
  };

  const List = () => (
    <div>
      {movies?.map((movie, index) => (
        <Draggable
          key={movie.id}
          draggableId={movie.id.toString()}
          index={index}
          isDragDisabled={listType === 'watched'}
        >
          {(provided, snapshot) => (
            <MovieCard
              movie={movie}
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              actions={[
                { 
                  type: "remove", 
                  handler: () => handleRemoveMovie(movie) 
                },
                ...(listType === 'watch' ? [{
                  type: "watched",
                  handler: () => handleMoveToWatchedList(movie)
                }] : []),
                { 
                  type: "details", 
                  handler: () => {
                    setSelectedMovie(movie);
                    setIsDetailOpen(true);
                  }
                }
              ]}
              isDragging={snapshot.isDragging}
            />
          )}
        </Draggable>
      ))}
    </div>
  );

  return (
    <>
      <Card className="border border-neutral-200">
        <CardContent>
          {listType === 'watch' ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="watchlist">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    <List />
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <List />
          )}
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
        />
      )}
    </>
  );
}