import { apiRequest } from "./queryClient";
import { Movie, SearchResult, User } from "./types";

export async function searchMovies(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  // Add artificial delay for testing loading states
  await new Promise(resolve => setTimeout(resolve, 1000));
  const res = await fetch(`/api/movies/search?query=${encodeURIComponent(query)}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to search movies");
  }

  const data = await res.json();
  return data.results || [];
}

export async function getMovieDetails(imdbId: string): Promise<Movie> {
  const res = await fetch(`/api/movies/${imdbId}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to get movie details");
  }

  return await res.json();
}

export async function login(username: string, password: string): Promise<User> {
  const res = await apiRequest("POST", "/api/login", { username, password });
  return await res.json();
}

export async function addToWatchList(movieId: number): Promise<void> {
  await apiRequest("POST", "/api/watchlist", { movieId });
}

export async function removeFromWatchList(movieId: number): Promise<void> {
  await apiRequest("DELETE", `/api/watchlist/${movieId}`);
}

export async function updateWatchListOrder(movieIds: number[]): Promise<void> {
  await apiRequest("PUT", "/api/watchlist/order", { movieIds });
}

export async function addToWatchedList(movieId: number, review?: string): Promise<void> {
  await apiRequest("POST", "/api/watchedlist", { 
    movieId, 
    review,
    watchedDate: new Date().toISOString()
  });
}

export async function updateReview(movieId: number, review: string): Promise<void> {
  await apiRequest("PUT", `/api/watchedlist/${movieId}/review`, { review });
}

export async function moveToWatched(movieId: number, review?: string): Promise<void> {
  await apiRequest("POST", `/api/movies/${movieId}/move-to-watched`, { review });
}

export function getCSVExportUrl(): string {
  return "/api/export/csv";
}