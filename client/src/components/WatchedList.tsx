import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Movie } from "@/lib/types";
import { format } from "date-fns";
import { getCSVExportUrl } from "@/lib/api";
import { RiDownloadLine } from "react-icons/ri";
import MovieDetail from "./MovieDetail"; // Assuming MovieDetail component exists
import { useState } from "react";

interface WatchedListProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onOpenReviewModal: (movie: Movie) => void;
}

export default function WatchedList({ movies, onOpenReviewModal }: WatchedListProps) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleExportCSV = () => {
    window.open(getCSVExportUrl(), "_blank");
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsDetailOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailOpen(false);
    setSelectedMovie(null);
  };

  const handleListsChange = () => {
    // Implement if needed for refreshing the lists
  };

  return (
    <div> {/*Added a div to encompass both the list and modal */}
    <Card className="border border-neutral-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium font-heading">Movies You've Watched</h2>
          <Button
            onClick={handleExportCSV}
            variant="ghost"
            className="text-sm text-primary hover:text-primary/80 flex items-center space-x-1"
          >
            <RiDownloadLine className="mr-1" />
            <span>Export CSV</span>
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
                        className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        onClick={() => handleMovieClick(movie)}
                      >
                        Details
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs px-2 py-1 bg-[#D2B48C]/10 text-primary hover:bg-[#D2B48C]/20"
                        onClick={() => onOpenReviewModal(movie)}
                      >
                        Edit Review
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
      onListsChange={handleListsChange}
    />
    </div>
  );
}