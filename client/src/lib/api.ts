import { apiRequest } from "./queryClient";
import { Movie, SearchResult, User } from "./types";
import { QueryClient } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

/**
 * Cache Invalidation
 */
const invalidateMovieQueries = async () => {
  // Using the shared queryClient instance instead of creating a new one each time
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['watchlist'] }),
    queryClient.invalidateQueries({ queryKey: ['watchedlist'] })
  ]);
};

/**
 * Authentication API Functions
 */
export async function login(username: string, password: string): Promise<User> {
  try {
    const res = await apiRequest("POST", "/api/login", { username, password });
    return await res.json();
  } catch (error) {
    console.error("Login failed:", error);
    throw new Error("Authentication failed. Please check your credentials.");
  }
}

/**
 * Movie Search and Details API Functions
 */
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

/**
 * Watch List API Functions
 */
export async function addToWatchList(movieId: number): Promise<void> {
  try {
    console.log('API call - Adding movie:', movieId);
    await apiRequest("POST", "/api/watchlist", { 
      movieId,
      order: 1, // The server will calculate the correct order anyway
      userId: 1
    });
    await invalidateMovieQueries();
    console.log('API response: success');
  } catch (error) {
    console.error("Failed to add to watch list:", error);
    throw new Error("Failed to add movie to watch list");
  }
}

export async function removeFromWatchList(movieId: number): Promise<void> {
  try {
    await apiRequest("DELETE", `/api/watchlist/${movieId}`);
    await invalidateMovieQueries();
  } catch (error) {
    console.error("Failed to remove from watch list:", error);
    throw new Error("Failed to remove movie from watch list");
  }
}

export async function updateWatchListOrder(movieIds: number[]): Promise<void> {
  try {
    await apiRequest("PUT", "/api/watchlist/order", { movieIds });
    await invalidateMovieQueries();
  } catch (error) {
    console.error("Failed to update watch list order:", error);
    throw new Error("Failed to reorder watch list");
  }
}

/**
 * Watched List API Functions
 */
export async function addToWatchedList(movieId: number, review?: string): Promise<void> {
  try {
    await apiRequest("POST", "/api/watchedlist", { 
      movieId, 
      review,
      watchedDate: new Date().toISOString(),
      userId: 1
    });
    await invalidateMovieQueries();
  } catch (error) {
    console.error("Failed to add to watched list:", error);
    throw new Error("Failed to add movie to watched list");
  }
}

export async function updateReview(movieId: number, review: string): Promise<void> {
  try {
    await apiRequest("PUT", `/api/watchedlist/${movieId}/review`, { review });
    await invalidateMovieQueries();
  } catch (error) {
    console.error("Failed to update review:", error);
    throw new Error("Failed to update movie review");
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

/**
 * List Management API Functions
 */
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

/**
 * Export API Functions
 */
export async function exportToCSV(): Promise<Blob> {
  try {
    const response = await apiRequest("GET", '/api/export/csv');
    return await response.blob();
  } catch (error) {
    console.error('Failed to export CSV:', error);
    throw new Error('Failed to export CSV');
  }
}
