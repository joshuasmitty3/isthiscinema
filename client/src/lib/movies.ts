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
  watchlist: any[];
  watchedlist: any[];
  setWatchlist: (movies: any[]) => void;
  setWatchedlist: (movies: any[]) => void;
  reorderWatchlist: (startIndex: number, endIndex: number) => void;
}

const useMoviesStore = create<MoviesStore>((set) => ({
  watchlist: [],
  watchedlist: [],
  setWatchlist: (movies) => set({ watchlist: movies }),
  setWatchedlist: (movies) => set({ watchedlist: movies }),
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
  const { watchlist, watchedlist, setWatchlist, setWatchedlist, reorderWatchlist } = useMoviesStore();

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

  const { data: fetchedWatchedlist } = useQuery({
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
    reorderWatchlist,
  };
}