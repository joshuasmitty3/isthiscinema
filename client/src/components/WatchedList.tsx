import { Movie, ListChangeHandler } from "@/lib/types";
import { format } from "date-fns";
import { removeFromWatchedList } from "@/lib/api";
import MovieDetail from "./MovieDetail";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ReviewModal } from "./ReviewModal";
import { handleError, ErrorSeverity } from "@/utils/errorHandler";

interface WatchedListProps {
  movies: Movie[];
  canEdit?: boolean;
  onSelectMovie?: (movie: Movie) => void;
  onOpenReviewModal?: (movie: Movie) => void;
  onListsChange?: ListChangeHandler;
}

export default function WatchedList({
  movies,
  canEdit = false,
  onOpenReviewModal = () => {},
  onListsChange
}: WatchedListProps) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();

  const toggleReview = (id: number) => {
    setExpandedReviews((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsDetailOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailOpen(false);
    setSelectedMovie(null);
  };

  const handleRemoveFromWatchedList = async (movie: Movie) => {
    try {
      // Optimistically update UI
      queryClient.setQueryData(['watchedlist'], (old: Movie[] | undefined) => 
        old?.filter(m => m.id !== movie.id) || []
      );
      
      await removeFromWatchedList(movie.id);
      
      // Invalidate both watchlist and watchedlist queries
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['watchedlist'] });
      
      if (onListsChange) {
        onListsChange();
      }
    } catch (error) {
      handleError(error, {
        component: "WatchedList",
        title: "Failed to Remove Movie",
        fallbackMessage: `Could not remove "${movie.title}" from your watched list.`,
        severity: ErrorSeverity.ERROR,
        showToast: true
      });
      
      // Revert optimistic update if it fails
      queryClient.invalidateQueries({ queryKey: ['watchedlist'] });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    }
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    queryClient.invalidateQueries({ queryKey: ['watchedlist'] });
  };

  return (
    <div>
        {movies.length === 0 ? (
          <div className="py-16 text-center font-mono text-sm text-muted-foreground">
            nothing watched yet — mark a film as watched from your list.
          </div>
        ) : (
          <div className="border-t border-border">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="group flex items-start gap-4 py-4 border-b border-border"
              >
                <button
                  type="button"
                  className="flex-none w-12 h-16 rounded-sm overflow-hidden bg-card"
                  onClick={() => handleMovieClick(movie)}
                  aria-label={`details for ${movie.title}`}
                >
                  {movie.poster && movie.poster !== "N/A" ? (
                    <img src={movie.poster} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="flex w-full h-full items-center justify-center font-mono text-[9px] text-muted-foreground">
                      poster
                    </span>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-3">
                    <h3
                      className="font-heading text-base font-medium text-foreground truncate cursor-pointer"
                      onClick={() => handleMovieClick(movie)}
                    >
                      {movie.title}
                    </h3>
                    <span className="font-mono text-xs text-muted-foreground/70 whitespace-nowrap flex-none">
                      {movie.watchedDate ? format(new Date(movie.watchedDate), "MMM d, yyyy") : ""}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground mt-1 truncate">
                    {[movie.year, movie.director].filter(Boolean).join("  ·  ")}
                  </p>

                  {movie.review && (
                    <button
                      type="button"
                      aria-expanded={expandedReviews.has(movie.id)}
                      onClick={() => toggleReview(movie.id)}
                      className={`mt-2 w-full bg-transparent border-l pl-3 text-left font-mono text-xs transition-all duration-150 ease-out hover:-translate-y-px active:-translate-y-px ${
                        expandedReviews.has(movie.id)
                          ? "block text-foreground border-primary"
                          : "text-muted-foreground/90 line-clamp-2 border-border"
                      }`}
                    >
                      {movie.review}
                    </button>
                  )}

                  {canEdit && (
                    <div className="mt-2 flex gap-4 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => {
                          setSelectedMovie(movie);
                          setIsReviewModalOpen(true);
                        }}
                      >
                        review
                      </button>
                      <button
                        className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => handleRemoveFromWatchedList(movie)}
                      >
                        remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    <MovieDetail
      canEdit={canEdit}
      movie={selectedMovie}
      isOpen={isDetailOpen}
      onClose={handleCloseModal}
      onListsChange={() => {
        if (onListsChange) onListsChange();
      }}
      refetch={refetch}
    />
    <ReviewModal
      movie={selectedMovie}
      isOpen={isReviewModalOpen}
      onClose={() => setIsReviewModalOpen(false)}
      onSave={refetch}
    />
    </div>
  );
}