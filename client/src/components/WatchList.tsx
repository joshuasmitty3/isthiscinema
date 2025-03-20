import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Movie } from "@/lib/types";
import { RiDragMoveLine } from "react-icons/ri";
import { useToast } from "@/hooks/use-toast";
import { removeFromWatchList, moveToWatched, updateWatchListOrder } from "@/lib/api";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

interface WatchListProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onListsChange: () => void;
}

export default function WatchList({ movies, onSelectMovie, onListsChange }: WatchListProps) {
  const [processingMovies, setProcessingMovies] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  const handleRemoveMovie = async (movieId: number) => {
    try {
      setProcessingMovies(prev => ({ ...prev, [movieId]: true }));
      await removeFromWatchList(movieId);
      toast({
        title: "Movie removed",
        description: "The movie has been removed from your watch list.",
      });
      onListsChange();
    } catch (error) {
      console.error("Failed to remove movie:", error);
      toast({
        title: "Failed to remove movie",
        description: "There was an error removing the movie.",
        variant: "destructive",
      });
    } finally {
      setProcessingMovies(prev => ({ ...prev, [movieId]: false }));
    }
  };

  const handleMoveToWatched = async (movieId: number) => {
    try {
      setProcessingMovies(prev => ({ ...prev, [movieId]: true }));
      await moveToWatched(movieId);
      toast({
        title: "Moved to Watched",
        description: "The movie has been moved to your watched list.",
      });
      onListsChange();
    } catch (error) {
      console.error("Failed to move movie:", error);
      toast({
        title: "Failed to move movie",
        description: "There was an error moving the movie to your watched list.",
        variant: "destructive",
      });
    } finally {
      setProcessingMovies(prev => ({ ...prev, [movieId]: false }));
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(movies);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update the order in the UI immediately to make it feel responsive
    // The actual order will be updated server-side
    
    try {
      await updateWatchListOrder(items.map(movie => movie.id));
      onListsChange();
    } catch (error) {
      console.error("Failed to update order:", error);
      toast({
        title: "Failed to update order",
        description: "There was an error updating the movie order.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border border-neutral-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium font-heading">Movies to Watch</h2>
          <div className="text-sm text-neutral-600">
            <span>{movies.length} movies</span>
          </div>
        </div>

        {movies.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            Your watch list is empty. Search for movies to add them here.
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="watchlist">
              {(provided) => (
                <div 
                  className="space-y-3"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {movies.map((movie, index) => (
                    <Draggable key={movie.id} draggableId={`movie-${movie.id}`} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="movie-card flex bg-white border border-neutral-200 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div 
                            className="drag-handle flex items-center px-2 text-neutral-400 hover:text-neutral-600"
                            {...provided.dragHandleProps}
                          >
                            <RiDragMoveLine />
                          </div>
                          <div 
                            className="w-16 h-24 flex-shrink-0 cursor-pointer"
                            onClick={() => onSelectMovie(movie)}
                          >
                            <img 
                              src={movie.poster !== "N/A" ? movie.poster : "https://via.placeholder.com/300x450?text=No+Poster"}
                              alt={movie.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                            <div>
                              <h3 
                                className="font-medium truncate cursor-pointer"
                                onClick={() => onSelectMovie(movie)}
                              >
                                {movie.title}
                              </h3>
                              <p className="text-xs text-neutral-600">{movie.year}</p>
                            </div>
                            <div className="flex space-x-2 mt-1">
                              <Button
                                size="sm"
                                className="text-xs px-2 py-1 bg-[#4CAF50]/10 text-[#4CAF50] hover:bg-[#4CAF50]/20"
                                onClick={() => handleMoveToWatched(movie.id)}
                                disabled={processingMovies[movie.id]}
                              >
                                Watched
                              </Button>
                              <Button
                                size="sm"
                                className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                onClick={() => onSelectMovie(movie)}
                              >
                                Details
                              </Button>
                              <Button
                                size="sm"
                                className="text-xs px-2 py-1 bg-[#F44336]/10 text-[#F44336] hover:bg-[#F44336]/20"
                                onClick={() => handleRemoveMovie(movie.id)}
                                disabled={processingMovies[movie.id]}
                              >
                                Remove
                              </Button>
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
        )}
      </CardContent>
    </Card>
  );
}
