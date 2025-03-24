import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getMovieDetails } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { RiAddLine } from "react-icons/ri";
import { Movie, SearchResult } from "@/lib/types";
import { Button } from "./ui/button";
import { LoadingSpinner } from "./ui/loading-spinner";

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  onSelectMovie: (movie: Movie) => void;
  onListsChange: () => void;
  isLoading?: boolean;
}

import { MovieSkeleton } from "./MovieSkeleton";

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  onSelectMovie: (movie: Movie) => void;
  onListsChange: () => void;
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
      console.log("Movie details fetched:", movie); // Added logging for debugging
      const order = 1; //  Simplified order - needs better implementation in a real app
      await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId: movie.id, // Use the internal movie ID instead of IMDB ID
          order,
          userId: 1 // This should match the logged in user's ID
        }),
      });

      // Play success sound
      new Audio('/success.mp3').play().catch(console.error);
      // Trigger button animation via class
      const button = document.querySelector(`button[data-movie-id="${searchResult.imdbID}"]`);
      button?.classList.add('animate-success');
      setTimeout(() => button?.classList.remove('animate-success'), 500);

      if (onListsChange) { //Added check to prevent errors if onListsChange is undefined
        onListsChange();
      }
    } catch (error) {
      console.error("Failed to add movie:", error);
      toast({
        title: "Failed to add movie",
        description: "There was an error adding the movie to your watch list.",
        variant: "destructive",
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
      console.error("Failed to get movie details:", error);
      toast({
        title: "Failed to load movie details",
        description: "There was an error loading the movie details.",
        variant: "destructive",
      });
    }
  };

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8 border border-neutral-200">
      <CardContent className="p-4">
        <h2 className="text-lg font-medium mb-4 font-heading">
          Search Results for "{query}"
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
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
              className="movie-card bg-white border border-neutral-200 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              onClick={() => handleMovieClick(result)}
            >
              <div className="relative aspect-[2/3] cursor-pointer">
                <img
                  src={result.Poster !== "N/A" ? result.Poster : "https://via.placeholder.com/300x450?text=No+Poster"}
                  alt={result.Title}
                  className="w-full h-full object-cover"
                />
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToWatchList(result);
                  }}
                  disabled={addingMovie === result.imdbID}
                  className="absolute top-2 right-2 p-1 bg-primary/90 text-white rounded-full hover:bg-primary transition-all duration-300 hover:rotate-90 active:scale-95 active:bg-green-500"
                  size="icon"
                  variant="ghost"
                >
                  <RiAddLine className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-2">
                <h3 className="text-sm font-medium truncate">{result.Title}</h3>
                <p className="text-xs text-neutral-600">{result.Year}</p>
              </div>
            </div>
          ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}