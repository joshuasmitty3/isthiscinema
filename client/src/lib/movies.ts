import { create } from 'zustand';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface MoviesStore {
  watchlist: any[];
  watchedlist: any[];
  setWatchlist: (movies: any[]) => void;
  setWatchedlist: (movies: any[]) => void;
  reorderWatchlist: ({ startIndex, endIndex }: { startIndex: number; endIndex: number }) => Promise<void>;
}

const useMoviesStore = create<MoviesStore>((set) => ({
  watchlist: [],
  watchedlist: [],
  setWatchlist: (movies) => set({ watchlist: movies }),
  setWatchedlist: (movies) => set({ watchedlist: movies }),
  reorderWatchlist: async ({ startIndex, endIndex }) => {
    const currentWatchlist = useMoviesStore.getState().watchlist;
    const newWatchlist = [...currentWatchlist];
    const [movedItem] = newWatchlist.splice(startIndex, 1);
    newWatchlist.splice(endIndex, 0, movedItem);

    const response = await fetch('/api/watchlist/order', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        movieIds: newWatchlist.map(movie => movie.id)
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update order');
    }

    set({ watchlist: newWatchlist });
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
    mutationFn: async ({ startIndex, endIndex }: { startIndex: number; endIndex: number }) => {
      const watchlist = queryClient.getQueryData(['watchlist']) as any[];
      const newOrder = [...watchlist];
      const [movedItem] = newOrder.splice(startIndex, 1);
      newOrder.splice(endIndex, 0, movedItem);

      const response = await fetch('/api/watchlist/order', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          movieIds: newOrder.map(movie => movie.id)
        }),
      });

      if (!response.ok) throw new Error('Failed to update watchlist order');
      return newOrder;
    },
    onMutate: async ({ startIndex, endIndex }) => {
      await queryClient.cancelQueries(['watchlist']);
      const previousWatchlist = queryClient.getQueryData(['watchlist']) as Movie[];
      const newWatchlist = [...previousWatchlist];
      const [movedItem] = newWatchlist.splice(startIndex, 1);
      newWatchlist.splice(endIndex, 0, movedItem);
      queryClient.setQueryData(['watchlist'], newWatchlist);
      return { previousWatchlist };
    },
    onError: (_, __, context) => {
      if (context?.previousWatchlist) {
        queryClient.setQueryData(['watchlist'], context.previousWatchlist);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(['watchlist']);
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