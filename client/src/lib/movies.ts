
import { create } from 'zustand';
import { useQuery } from '@tanstack/react-query';

interface MoviesStore {
  watchlist: any[];
  watchedlist: any[];
  setWatchlist: (movies: any[]) => void;
  setWatchedlist: (movies: any[]) => void;
}

const useMoviesStore = create<MoviesStore>((set) => ({
  watchlist: [],
  watchedlist: [],
  setWatchlist: (movies) => set({ watchlist: movies }),
  setWatchedlist: (movies) => set({ watchedlist: movies }),
}));

export function useMovies() {
  const { watchlist, watchedlist, setWatchlist, setWatchedlist } = useMoviesStore();

  const { data: fetchedWatchlist, refetch: refetchWatchlist } = useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const response = await fetch('/api/watchlist');
      if (!response.ok) throw new Error('Failed to fetch watchlist');
      const data = await response.json();
      setWatchlist(data);
      return data;
    },
  });

  const { data: fetchedWatchedlist, refetch: refetchWatchedlist } = useQuery({
    queryKey: ['watchedlist'],
    queryFn: async () => {
      const response = await fetch('/api/watchedlist');
      if (!response.ok) throw new Error('Failed to fetch watched list');
      const data = await response.json();
      setWatchedlist(data);
      return data;
    },
  });

  return {
    watchlist: fetchedWatchlist || [],
    watchedlist: fetchedWatchedlist || [],
    refetchLists: () => {
      return Promise.all([
        refetchWatchlist(),
        refetchWatchedlist()
      ]);
    }
  };
}
