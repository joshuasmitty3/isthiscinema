
import { create } from 'zustand';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

  const reorderMutation = useMutation({
    mutationFn: async (movies: any[]) => {
      const response = await fetch('/api/watchlist/order', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movieIds: movies.map(movie => movie.id) }),
      });
      if (!response.ok) throw new Error('Failed to update watchlist order');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch both lists
      Promise.all([
        queryClient.invalidateQueries(['watchlist']),
        queryClient.invalidateQueries(['watchedlist'])
      ]);
    }
  });

  return {
    watchlist: fetchedWatchlist || [],
    watchedlist: fetchedWatchedlist || [],
    reorderWatchlist,
    refetchLists: () => {
      return Promise.all([
        refetchWatchlist(),
        refetchWatchedlist()
      ]);
    }
  };
}
