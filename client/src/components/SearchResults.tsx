import { useState } from "react";
import { getMovieDetails, addToWatchList } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { RiAddLine } from "react-icons/ri";
import { Movie, SearchResult, ListChangeHandler } from "@/lib/types";
import { MovieSkeleton } from "./MovieSkeleton";
import { handleError, ErrorSeverity } from "@/utils/errorHandler";

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  onSelectMovie: (movie: Movie) => void;
  onListsChange: ListChangeHandler;
  isLoading?: boolean;
}

export default function SearchResults({ 
  results, 
  query, 
  onSelectMovie,
  onListsChange,
  isLoading = false
}: SearchResultsProps) {
  const [addingMovie, setAddingMovie] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddToWatchList = async (searchResult: SearchResult) => {
    try {
      setAddingMovie(searchResult.imdbID);
      const movie = await getMovieDetails(searchResult.imdbID);
      console.log("Movie details fetched:", movie);
      
      await addToWatchList(movie.id);

      // Play success sound
      new Audio('/success.mp3').play().catch(console.error);
      // Trigger button animation via class
      const button = document.querySelector(`button[data-movie-id="${searchResult.imdbID}"]`);
      button?.classList.add('animate-success');
      setTimeout(() => button?.classList.remove('animate-success'), 500);

      if (onListsChange) {
        onListsChange();
      }
    } catch (error) {
      handleError(error, {
        component: "SearchResults",
        title: "Failed to Add Movie",
        fallbackMessage: "There was an error adding the movie to your watch list.",
        severity: ErrorSeverity.ERROR,
        showToast: true
      });
    } finally {
      setAddingMovie(null);
    }
  };

  const handleMovieClick = async (searchResult: SearchResult) => {
    try {
      const movie = await getMovieDetails(searchResult.imdbID);
      onSelectMovie(movie);
    } catch (error) {
      handleError(error, {
        component: "SearchResults",
        title: "Failed to Load Movie Details",
        fallbackMessage: "There was an error loading the movie details.",
        severity: ErrorSeverity.ERROR,
        showToast: true
      });
    }
  };

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
        results for "{query}"
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {isLoading ? (
          <>
            {Array.from({ length: 10 }).map((_, i) => (
              <MovieSkeleton key={i} />
            ))}
          </>
        ) : (
          results.map((result) => (
            <div
              key={result.imdbID}
              className="group bg-card border border-border rounded-md overflow-hidden hover:border-primary/40 transition-colors"
              onClick={() => handleMovieClick(result)}
            >
              <div className="relative aspect-[2/3] cursor-pointer">
                <img
                  src={result.Poster !== "N/A" ? result.Poster : "https://via.placeholder.com/300x450?text=No+Poster"}
                  alt={result.Title}
                  className="w-full h-full object-cover"
                />
                <button
                  data-movie-id={result.imdbID}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToWatchList(result);
                  }}
                  disabled={addingMovie === result.imdbID}
                  className="absolute top-2 right-2 grid place-items-center h-7 w-7 rounded-full bg-primary text-primary-foreground shadow-sm hover:rotate-90 active:scale-95 transition-all duration-300 disabled:opacity-50"
                  aria-label={`add ${result.Title}`}
                >
                  <RiAddLine className="h-4 w-4" />
                </button>
              </div>
              <div className="p-2.5">
                <h3 className="font-heading text-sm font-medium text-foreground truncate">{result.Title}</h3>
                <p className="font-mono text-[11px] text-muted-foreground mt-0.5">{result.Year}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}