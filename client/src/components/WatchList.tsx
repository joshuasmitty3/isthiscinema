
import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const deleteMovie = useMutation({
    mutationFn: async (movieId: number) => {
      console.log(`Attempting to delete movie with ID: ${movieId}`);
      const response = await fetch(`/api/watchlist/${movieId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Delete movie failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.message || "Failed to remove movie");
      }
      
      console.log(`Successfully deleted movie with ID: ${movieId}`);
      return response.json();
    },
    onSuccess: (_, movieId) => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast({
        title: "Success",
        description: "Movie removed from watchlist",
      });
      console.log(`Movie ${movieId} removed and cache invalidated`);
    },
    onError: (error: Error) => {
      const errorMessage = error.message || "Failed to remove movie";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Delete movie mutation error:', error);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {movies.map((movie) => (
          <div key={movie.id} className="bg-white rounded-lg shadow p-4">
            <img 
              src={movie.poster} 
              alt={movie.title} 
              className="w-full h-48 object-cover rounded"
            />
            <h3 className="mt-2 font-semibold">{movie.title}</h3>
            <p className="text-gray-500">{movie.year}</p>
            <button
              onClick={() => deleteMovie.mutate(movie.id.toString())}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              disabled={deleteMovie.isPending}
            >
              {deleteMovie.isPending ? "Removing..." : "Remove"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
