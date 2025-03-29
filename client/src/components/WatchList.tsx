import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { useMovies } from "@/lib/movies";
import { useQueryClient } from "@tanstack/react-query";
import type { Movie } from "@/lib/types";
import { moveToWatched } from "@/lib/api";
import { logStateChange, logError } from '../utils/logger';
import MovieCard from './MovieCard';
import MovieDetail from './MovieDetail'; // Added logError import

interface WatchListProps {
  onListsChange?: () => void;
}

export default function WatchList({ onListsChange }: WatchListProps) {
  const queryClient = useQueryClient();
  const { watchlist, reorderWatchlist } = useMovies();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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

  const handleRemoveFromWatchedList = async (movie: Movie) => {
    try {
      const response = await fetch(`/api/watchedlist/${movie.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove movie');
      }

      console.log(`Successfully removed movie ${movie.title} from watched list`);

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
      console.error('Failed to reorder watchlist:', error);
      queryClient.invalidateQueries(['watchlist']);
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
                {watchlist?.map((movie, index) => (
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
        />
      )}
    </>
  );
}


// Added WatchedList component
import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { useMovies } from "@/lib/movies";
import { useQueryClient } from "@tanstack/react-query";
import type { Movie } from "@/lib/types";
import MovieCard from './MovieCard';
import MovieDetail from './MovieDetail';


interface WatchedListProps {
  onListsChange?: () => void;
}

const WatchedList: React.FC<WatchedListProps> = ({ onListsChange }) => {
  const { watchedList, reorderWatchedList } = useMovies();
  const queryClient = useQueryClient();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleRemoveFromWatchedList = async (movie: Movie) => {
    try {
      const response = await fetch(`/api/watchedlist/${movie.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to remove movie');
      }

      console.log(`Successfully removed movie ${movie.title} from watched list`);
      onListsChange?.();
    } catch (error) {
      console.error('Failed to remove movie:', error);
    }
  };

  const handleShowDetails = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsDetailOpen(true);
  };

  return (
    <>
      <Card className="border border-neutral-200">
        <CardContent>
          {watchedList?.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              actions={[
                { type: "remove", handler: () => handleRemoveFromWatchedList(movie) },
                { type: "details", handler: () => handleShowDetails(movie) },
              ]}
            />
          ))}
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
};

export default WatchedList;