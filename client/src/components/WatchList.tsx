
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Trash2, ChevronUp, ChevronDown } from "lucide-react";

type Movie = {
  id: number;
  imdbID: string;
  title: string;
  year: string;
  poster: string;
  order: number;
};

export default function WatchList({ movies }: { movies: Movie[] }) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const removeMovie = useMutation({
    mutationFn: async (movieId: string) => {
      const response = await fetch(`/api/watchlist/${movieId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove movie");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  const reorderMovie = useMutation({
    mutationFn: async ({ movieId, direction }: { movieId: string; direction: "up" | "down" }) => {
      const response = await fetch(`/api/watchlist/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, direction }),
      });
      if (!response.ok) throw new Error("Failed to reorder movie");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  if (!movies.length) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">No movies in watch list</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {movies.map((movie, index) => (
        <Card key={movie.imdbID} className="relative">
          <CardContent className="pt-6 flex items-center gap-4">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-20 h-auto rounded"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{movie.title}</h3>
              <p className="text-sm text-gray-500">{movie.year}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="icon"
                disabled={index === 0 || isLoading}
                onClick={() => reorderMovie.mutate({ movieId: movie.imdbID, direction: "up" })}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={index === movies.length - 1 || isLoading}
                onClick={() => reorderMovie.mutate({ movieId: movie.imdbID, direction: "down" })}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="destructive"
              size="icon"
              disabled={isLoading}
              onClick={() => removeMovie.mutate(movie.imdbID)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
