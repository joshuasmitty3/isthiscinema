
import { MovieDetails, SearchResults } from '../../../shared/schema';
import { QueryClient } from '@tanstack/react-query';

export async function searchMovies(query: string): Promise<SearchResults> {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to search movies');
  }
  return response.json();
}

export async function getMovieDetails(id: string): Promise<MovieDetails> {
  const response = await fetch(`/api/movies/${id}`);
  if (!response.ok) {
    throw new Error('Failed to get movie details');
  }
  return response.json();
}

export async function addToWatchList(movieId: number) {
  const response = await fetch('/api/watchlist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ movieId }),
  });
  if (!response.ok) {
    throw new Error('Failed to add to watch list');
  }
  return response.json();
}

export async function removeFromWatchList(movieId: number) {
  const response = await fetch(`/api/watchlist/${movieId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to remove from watch list');
  }
  return response.json();
}

export async function getWatchList() {
  const response = await fetch('/api/watchlist');
  if (!response.ok) {
    throw new Error('Failed to get watch list');
  }
  return response.json();
}

export async function getWatchedList() {
  const response = await fetch('/api/watchedlist');
  if (!response.ok) {
    throw new Error('Failed to get watched list');
  }
  return response.json();
}

export async function moveToWatched(movieId: number, review?: string) {
  const response = await fetch(`/api/movies/${movieId}/move-to-watched`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ review }),
  });
  if (!response.ok) {
    throw new Error('Failed to move to watched');
  }
  return response.json();
}

export async function updateReview(movieId: number, review: string) {
  const response = await fetch(`/api/watchedlist/${movieId}/review`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ review }),
  });
  if (!response.ok) {
    throw new Error('Failed to update review');
  }
  return response.json();
}

export async function updateWatchListOrder(movieIds: number[]) {
  const response = await fetch('/api/watchlist/order', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ movieIds }),
  });
  if (!response.ok) {
    throw new Error('Failed to update watch list order');
  }
  return response.json();
}

export async function removeFromWatchedList(movieId: number) {
  const response = await fetch(`/api/watchedlist/${movieId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to remove from watched list');
  }
  return response.json();
}

export async function exportToCSV(): Promise<Blob> {
  const response = await fetch('/api/export/csv');
  if (!response.ok) {
    throw new Error('Failed to export CSV');
  }
  return response.blob();
}
