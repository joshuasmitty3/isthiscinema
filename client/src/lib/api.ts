import { apiRequest } from "./queryClient";
import { Movie, SearchResult, User } from "./types";
import { QueryClient } from "@tanstack/react-query";

// Create a shared function for query invalidation with proper types
const invalidateMovieQueries = async () => {
  const queryClient = new QueryClient();
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['watchlist'] }),
    queryClient.invalidateQueries({ queryKey: ['watchedlist'] })
  ]);
};

export async function searchMovies(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  try {
    const res = await apiRequest("GET", `/api/movies/search?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Failed to search movies:", error);
    throw new Error("Failed to search movies");
  }
}

export async function getMovieDetails(imdbId: string): Promise<Movie> {
  try {
    const res = await apiRequest("GET", `/api/movies/${imdbId}`);
    return await res.json();
  } catch (error) {
    console.error("Failed to get movie details:", error);
    throw new Error("Failed to get movie details");
  }
}

export async function login(username: string, password: string): Promise<User> {
  const res = await apiRequest("POST", "/api/login", { username, password });
  return await res.json();
}

export async function addToWatchList(movieId: number): Promise<void> {
  console.log('API call - Adding movie:', movieId);
  // Include the order parameter required by the schema
  await apiRequest("POST", "/api/watchlist", { 
    movieId,
    order: 1, // The server will calculate the correct order anyway
    userId: 1
  });
  await invalidateMovieQueries();
  console.log('API response: success');
}

export async function removeFromWatchList(movieId: number): Promise<void> {
  await apiRequest("DELETE", `/api/watchlist/${movieId}`);
  await invalidateMovieQueries();
}

export async function updateWatchListOrder(movieIds: number[]): Promise<void> {
  await apiRequest("PUT", "/api/watchlist/order", { movieIds });
  await invalidateMovieQueries();
}

export async function addToWatchedList(movieId: number, review?: string): Promise<void> {
  await apiRequest("POST", "/api/watchedlist", { 
    movieId, 
    review,
    watchedDate: new Date().toISOString(),
    userId: 1
  });
  await invalidateMovieQueries();
}

export async function updateReview(movieId: number, review: string): Promise<void> {
  await apiRequest("PUT", `/api/watchedlist/${movieId}/review`, { review });
  await invalidateMovieQueries();
}

export async function moveToWatched(movieId: number, review?: string): Promise<any> {
  try {
    const response = await apiRequest(
      "POST", 
      `/api/movies/${movieId}/move-to-watched`, 
      { 
        review,
        userId: 1
      }
    );
    
    console.log(`Successfully moved movie ${movieId} to watched list`);
    await invalidateMovieQueries();
    
    return await response.json();
  } catch (error) {
    console.error('Error moving movie to watched:', error);
    throw error; // Re-throw to handle in the component
  }
}

export async function exportToCSV(): Promise<Blob> {
  try {
    const response = await apiRequest("GET", '/api/export/csv');
    return await response.blob();
  } catch (error) {
    console.error('Failed to export CSV:', error);
    throw new Error('Failed to export CSV');
  }
}

export async function removeFromWatchedList(movieId: number): Promise<any> {
  try {
    const response = await apiRequest("DELETE", `/api/watchedlist/${movieId}`);
    await invalidateMovieQueries();
    return await response.json();
  } catch (error) {
    console.error('Failed to remove from watched list:', error);
    throw new Error('Failed to remove from watched list');
  }
}
