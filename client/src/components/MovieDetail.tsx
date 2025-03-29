import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Movie } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { addToWatchList, moveToWatched } from "@/lib/api";

interface MovieDetailProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onListsChange: () => void;
}

export default function MovieDetail({ movie, isOpen, onClose, onListsChange }: MovieDetailProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const { toast } = useToast();

  if (!movie) return null;

  const handleAddToWatchList = async () => {
    try {
      setIsLoading(true);
      await addToWatchList(movie.id);
      
      toast({
        title: "Added to Watch List",
        description: `${movie.title} has been added to your watch list.`,
      });
      
      onListsChange();
    } catch (error) {
      console.error("Failed to add movie:", error);
      toast({
        title: "Failed to add movie",
        description: "There was an error adding the movie to your watch list.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWatched = async () => {
  try {
    setIsLoading(true);
    await removeFromWatchedList(movie.id);
    
    toast({
      title: "Removed from Watched",
      description: `${movie.title} has been removed from your watched list.`,
    });
    
    onListsChange();
  } catch (error) {
    console.error("Failed to remove movie:", error);
    toast({
      title: "Failed to remove movie",
      description: "There was an error removing the movie from your watched list.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

const handleMoveToWatched = async () => {
    try {
      setIsLoading(true);
      await moveToWatched(movie.id);
      
      toast({
        title: "Moved to Watched",
        description: `${movie.title} has been moved to your watched list.`,
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
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium font-heading">Movie Details</DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-1/3">
              <div 
                className={`${isZoomed ? "fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" : "aspect-[2/3] rounded-md overflow-hidden shadow-sm"}`}
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <img 
                  src={movie.poster !== "N/A" ? movie.poster : "https://via.placeholder.com/300x450?text=No+Poster"}
                  alt={movie.title} 
                  className={`${isZoomed ? "max-h-[90vh] max-w-full object-contain" : "w-full h-full object-cover"} cursor-pointer`}
                />
              </div>
            </div>
            
            <div className="sm:w-2/3">
              <h4 className="text-xl font-medium mb-1">{movie.title}</h4>
              <div className="text-sm text-neutral-600 mb-3">
                <p>{movie.year} • {movie.director} {movie.runtime && `• ${movie.runtime}`}</p>
                {movie.genre && <p className="mt-1">{movie.genre}</p>}
              </div>
              
              <div className="mb-4">
                <h5 className="text-sm font-medium mb-1">Synopsis</h5>
                <p className="text-sm">{movie.plot}</p>
              </div>
              
              {movie.actors && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium mb-1">Cast</h5>
                  <p className="text-sm">{movie.actors}</p>
                </div>
              )}
              
              <div className="pt-2 border-t border-neutral-200">
                <div className="flex space-x-2">
                  {!movie.inWatchList && !movie.inWatchedList ? (
                    <Button 
                      onClick={handleAddToWatchList}
                      disabled={isLoading}
                      className="flex-1 py-2 px-3 bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                      Add to Watch List
                    </Button>
                  ) : movie.inWatchList && !movie.inWatchedList ? (
                    <Button 
                      onClick={handleMoveToWatched}
                      disabled={isLoading}
                      className="flex-1 py-2 px-3 bg-[#4CAF50] text-white rounded-md hover:bg-[#4CAF50]/90"
                    >
                      Mark as Watched
                    </Button>
                  ) : (
                    <Button 
                      disabled
                      className="flex-1 py-2 px-3 bg-neutral-200 text-neutral-600 rounded-md"
                    >
                      In Watched List
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
