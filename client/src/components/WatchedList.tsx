import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Movie, ListChangeHandler } from "@/lib/types";
import { format } from "date-fns";
import { exportToCSV, removeFromWatchedList } from "@/lib/api";
import { RiDownloadLine } from "react-icons/ri";
import MovieDetail from "./MovieDetail";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ReviewModal } from "./ReviewModal";
import { downloadBlob } from "@/lib/downloadUtils";
import { handleError, ErrorSeverity } from "@/utils/errorHandler";

interface WatchedListProps {
  movies: Movie[];
  onSelectMovie?: (movie: Movie) => void;
  onOpenReviewModal?: (movie: Movie) => void;
  onListsChange?: ListChangeHandler;
}

export default function WatchedList({ 
  movies, 
  onOpenReviewModal = () => {},
  onListsChange 
}: WatchedListProps) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleExportCSV = async () => {
    try {
      const blob = await exportToCSV();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `movie-list-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      handleError(error, {
        component: "WatchedList",
        title: "Export Failed",
        fallbackMessage: "Could not export your movie lists to CSV. Please try again.",
        severity: ErrorSeverity.ERROR,
        showToast: true
      });
    }
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
    <Card className="border border-neutral-200">
      <CardContent className="p-4">
        <div className="flex justify-end items-center mb-4">
          <Button
            onClick={handleExportCSV}
            variant="ghost"
            className="text-sm text-primary hover:text-primary/80"
            title="Export CSV"
          >
            <RiDownloadLine />
          </Button>
        </div>

        {movies.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            You haven't watched any movies yet. Mark movies as watched from your watch list.
          </div>
        ) : (
          <div className="space-y-4">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="movie-card bg-white border border-neutral-200 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start p-3">
                  <div
                    className="w-20 h-28 flex-shrink-0 rounded overflow-hidden cursor-pointer"
                    onClick={() => handleMovieClick(movie)}
                  >
                    <img
                      src={movie.poster !== "N/A" ? movie.poster : "https://via.placeholder.com/300x450?text=No+Poster"}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 pl-3 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3
                        className="font-medium cursor-pointer"
                        onClick={() => handleMovieClick(movie)}
                      >
                        {movie.title}
                      </h3>
                      <span className="text-xs text-neutral-600 whitespace-nowrap">
                        {movie.watchedDate ? format(new Date(movie.watchedDate), "MMM d, yyyy") : "N/A"}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 mb-1">
                      {movie.year} • {movie.director}
                    </p>

                    {movie.review && (
                      <div className="mt-2 bg-neutral-100 rounded p-2">
                        <p className="text-xs line-clamp-2">{movie.review}</p>
                      </div>
                    )}

                    <div className="mt-2 flex space-x-2">
                      <Button
                        size="sm"
                        className="text-xs px-2 py-1 bg-[#D2B48C]/10 text-primary hover:bg-[#D2B48C]/20"
                        onClick={() => {
                          setSelectedMovie(movie);
                          setIsReviewModalOpen(true);
                        }}
                      >
                        Review
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs px-2 py-1 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
                        onClick={() => handleRemoveFromWatchedList(movie)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    <MovieDetail 
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