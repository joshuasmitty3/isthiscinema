import { create } from 'zustand';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Movie {
  id: number;
  imdbId: string;
  title: string;
  year: string;
  poster: string;
}

interface MoviesStore {
  watchlist: Movie[];
  setWatchlist: (movies: Movie[]) => void;
  reorderWatchlist: (startIndex: number, endIndex: number) => void;
}

const useMoviesStore = create<MoviesStore>((set) => ({
  watchlist: [],
  setWatchlist: (movies) => set({ watchlist: movies }),
  reorderWatchlist: (startIndex, endIndex) => {
    set((state) => {
      const newWatchlist = [...state.watchlist];
      const [movedItem] = newWatchlist.splice(startIndex, 1);
      newWatchlist.splice(endIndex, 0, movedItem);
      return { watchlist: newWatchlist };
    });
  },
}));

export function useMovies() {
  const queryClient = useQueryClient();
  const { watchlist, setWatchlist, reorderWatchlist } = useMoviesStore();

  const { data: fetchedWatchlist, refetch } = useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const response = await fetch('/api/watchlist');
      if (!response.ok) throw new Error('Failed to fetch watchlist');
      return response.json();
    },
  });

  const updateWatchlistOrder = useMutation({
    mutationFn: async (movies: Movie[]) => {
      const response = await fetch('/api/watchlist/order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieIds: movies.map(movie => movie.id) }),
      });
      if (!response.ok) throw new Error('Failed to update watchlist order');
      await refetch(); //refetch after successful update
      return response.json();
    },
    onMutate: async (newMovies) => {
      await queryClient.cancelQueries({ queryKey: ['watchlist'] });
      const previousWatchlist = queryClient.getQueryData(['watchlist']);
      queryClient.setQueryData(['watchlist'], newMovies);
      return { previousWatchlist };
    },
    onError: (err, newMovies, context) => {
      console.error("Error updating watchlist order:", err); //Added error logging
      queryClient.setQueryData(['watchlist'], context?.previousWatchlist);
      refetch(); //refetch on error to revert to previous state
    }
  });

  return {
    watchlist: fetchedWatchlist || [],
    reorderWatchlist: (startIndex: number, endIndex: number) => {
      const newWatchlist = [...(fetchedWatchlist || [])];
      const [movedItem] = newWatchlist.splice(startIndex, 1);
      newWatchlist.splice(endIndex, 0, movedItem);
      setWatchlist(newWatchlist);
      updateWatchlistOrder.mutate(newWatchlist);
    },
  };
}