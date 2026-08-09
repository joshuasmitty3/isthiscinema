import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Movie, CommonModalProps, ListChangeHandler } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { addToWatchList, moveToWatched, removeFromWatchedList } from "@/lib/api";
import { handleError, ErrorSeverity } from "@/utils/errorHandler";

interface MovieDetailProps extends CommonModalProps {
  movie: Movie | null;
  onListsChange: ListChangeHandler;
  refetch: ListChangeHandler;
}

export default function MovieDetail({ movie, isOpen, onClose, onListsChange, refetch }: MovieDetailProps) {
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
      handleError(error, {
        component: "MovieDetail",
        title: "Failed to Add Movie",
        fallbackMessage: "There was an error adding the movie to your watch list.",
        severity: ErrorSeverity.ERROR,
        showToast: true
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
      handleError(error, {
        component: "MovieDetail",
        title: "Failed to Move Movie",
        fallbackMessage: "There was an error moving the movie to your watched list.",
        severity: ErrorSeverity.ERROR,
        showToast: true
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
      
      refetch(); // Added refetch call
      onListsChange();
    } catch (error) {
      handleError(error, {
        component: "MovieDetail",
        title: "Failed to Remove Movie",
        fallbackMessage: "There was an error removing the movie from your watched list.",
        severity: ErrorSeverity.ERROR,
        showToast: true
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-xs uppercase tracking-wider text-muted-foreground">details</DialogTitle>
        </DialogHeader>

        <div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-1/3">
              <div
                className={`${isZoomed ? "fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" : "aspect-[2/3] rounded-md overflow-hidden bg-card"}`}
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
              <h4 className="font-heading text-xl font-medium mb-2 text-foreground">{movie.title}</h4>
              <div className="font-mono text-[11px] text-muted-foreground mb-4 space-y-1">
                <p>{[movie.year, movie.director, movie.runtime].filter(Boolean).join("  ·  ")}</p>
                {movie.genre && <p>{movie.genre}</p>}
              </div>

              <div className="mb-4">
                <h5 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">synopsis</h5>
                <p className="text-sm text-foreground/90 leading-relaxed">{movie.plot}</p>
              </div>

              {movie.actors && (
                <div className="mb-4">
                  <h5 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">cast</h5>
                  <p className="text-sm text-foreground/90">{movie.actors}</p>
                </div>
              )}

              <div className="pt-3 border-t border-border">
                <div className="flex flex-wrap gap-2">
                  {!movie.inWatchList && !movie.inWatchedList ? (
                    <Button
                      onClick={handleAddToWatchList}
                      disabled={isLoading}
                      className="flex-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      add to watch list
                    </Button>
                  ) : movie.inWatchList && !movie.inWatchedList ? (
                    <Button
                      onClick={handleMoveToWatched}
                      disabled={isLoading}
                      className="flex-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      mark as watched
                    </Button>
                  ) : (
                    <div className="w-full">
                      {movie.inWatchedList && (
                        <>
                          <div className="mb-3 font-mono text-[11px] text-muted-foreground space-y-1">
                            <p>watched {new Date(movie.watchedDate!).toLocaleDateString()}</p>
                            {movie.review && (
                              <p className="border-l border-border pl-3 text-muted-foreground/90">{movie.review}</p>
                            )}
                          </div>
                          <Button
                            onClick={handleRemoveFromWatched}
                            disabled={isLoading}
                            variant="outline"
                            className="w-full border-border text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
                          >
                            remove from watched list
                          </Button>
                        </>
                      )}
                    </div>
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