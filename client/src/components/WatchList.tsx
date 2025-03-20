import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Movie {
  id: number;
  imdbId: string;
  title: string;
  year: string;
  poster: string;
}

export default function WatchList({ movies }: { movies: Movie[] }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const deleteMovie = useMutation({
    mutationFn: async (movieId: string) => {
      const response = await fetch(`/api/watchlist/${movieId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to remove movie");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  if (movies.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No movies in your watch list
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 text-red-500 mb-4">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {movies.map((movie) => (
        <div
          key={movie.imdbId}
          className="flex items-center gap-4 bg-card p-4 rounded-lg shadow-sm"
        >
          <img
            src={movie.poster}
            alt={movie.title}
            className="h-24 w-16 object-cover rounded"
          />
          <div className="flex-1">
            <h3 className="font-medium">{movie.title}</h3>
            <p className="text-sm text-gray-500">{movie.year}</p>
          </div>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => deleteMovie.mutate(movie.imdbId)}
            disabled={deleteMovie.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}