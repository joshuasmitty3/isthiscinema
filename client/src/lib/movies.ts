
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

  const { data: fetchedWatchlist } = useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const response = await fetch('/api/watchlist');
      if (!response.ok) throw new Error('Failed to fetch watchlist');
      const data = await response.json();
      setWatchlist(data);
      return data;
    },
  });

  const updateWatchlistOrder = useMutation({
    mutationFn: async (movies: Movie[]) => {
      const movieIds = movies.map(movie => Number(movie.id));
      const response = await fetch('/api/watchlist/order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieIds }),
      });
      if (!response.ok) throw new Error('Failed to update watchlist order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  return {
    watchlist: fetchedWatchlist || watchlist,
    reorderWatchlist: (startIndex: number, endIndex: number) => {
      reorderWatchlist(startIndex, endIndex);
      updateWatchlistOrder.mutate(watchlist);
    },
  };
}
