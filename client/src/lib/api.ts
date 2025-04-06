import { apiRequest } from "./queryClient";
import { Movie, SearchResult, User } from "./types";
import { queryClient } from "./queryClient";
import { ErrorSeverity, handleError } from "@/utils/errorHandler";

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
    handleError(error, {
      component: "Authentication",
      title: "Login Failed",
      fallbackMessage: "Authentication failed. Please check your credentials.",
      severity: ErrorSeverity.ERROR,
      showToast: true
    });
    throw error;
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
    handleError(error, {
      component: "MovieSearch",
      title: "Search Failed",
      fallbackMessage: "Failed to search movies. Please try again.",
      severity: ErrorSeverity.ERROR
    });
    throw error;
  }
}

export async function getMovieDetails(imdbId: string): Promise<Movie> {
  try {
    const res = await apiRequest("GET", `/api/movies/${imdbId}`);
    return await res.json();
  } catch (error) {
    handleError(error, {
      component: "MovieDetails",
      title: "Failed to Load Movie",
      fallbackMessage: "Could not retrieve movie details. Please try again.",
      severity: ErrorSeverity.ERROR
    });
    throw error;
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
    handleError(error, {
      component: "WatchList",
      title: "Failed to Add Movie",
      fallbackMessage: "Could not add movie to your watch list. Please try again.",
      severity: ErrorSeverity.ERROR
    });
    throw error;
  }
}

export async function removeFromWatchList(movieId: number): Promise<void> {
  try {
    await apiRequest("DELETE", `/api/watchlist/${movieId}`);
    await invalidateMovieQueries();
  } catch (error) {
    handleError(error, {
      component: "WatchList",
      title: "Failed to Remove Movie",
      fallbackMessage: "Could not remove movie from your watch list. Please try again.",
      severity: ErrorSeverity.ERROR
    });
    throw error;
  }
}

export async function updateWatchListOrder(movieIds: number[]): Promise<void> {
  try {
    await apiRequest("PUT", "/api/watchlist/order", { movieIds });
    await invalidateMovieQueries();
  } catch (error) {
    handleError(error, {
      component: "WatchList",
      title: "Failed to Reorder List",
      fallbackMessage: "Could not update the order of your watch list. Please try again.",
      severity: ErrorSeverity.ERROR
    });
    throw error;
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
    handleError(error, {
      component: "WatchedList",
      title: "Failed to Add Movie",
      fallbackMessage: "Could not add movie to your watched list. Please try again.",
      severity: ErrorSeverity.ERROR
    });
    throw error;
  }
}

export async function updateReview(movieId: number, review: string): Promise<void> {
  try {
    await apiRequest("PUT", `/api/watchedlist/${movieId}/review`, { review });
    await invalidateMovieQueries();
  } catch (error) {
    handleError(error, {
      component: "Reviews",
      title: "Failed to Update Review",
      fallbackMessage: "Could not update your review. Please try again.",
      severity: ErrorSeverity.ERROR
    });
    throw error;
  }
}

export async function removeFromWatchedList(movieId: number): Promise<any> {
  try {
    const response = await apiRequest("DELETE", `/api/watchedlist/${movieId}`);
    await invalidateMovieQueries();
    return await response.json();
  } catch (error) {
    handleError(error, {
      component: "WatchedList",
      title: "Failed to Remove Movie",
      fallbackMessage: "Could not remove movie from your watched list. Please try again.",
      severity: ErrorSeverity.ERROR
    });
    throw error;
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
    handleError(error, {
      component: "MovieLists",
      title: "Failed to Move Movie",
      fallbackMessage: "Could not move movie to your watched list. Please try again.",
      severity: ErrorSeverity.ERROR
    });
    throw error;
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
    handleError(error, {
      component: "Export",
      title: "Export Failed",
      fallbackMessage: "Could not export your movie lists to CSV. Please try again.",
      severity: ErrorSeverity.ERROR
    });
    throw error;
  }
}
