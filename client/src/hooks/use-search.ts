
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { searchMovies } from "@/lib/api";
import { SearchResult } from "@/lib/types";
import { useToast } from "./use-toast";

export function useSearch(onSearch: (results: SearchResult[], query: string, loading: boolean) => void) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const MIN_SEARCH_LENGTH = 2;
  const DEBOUNCE_MS = 400;

  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    
    if (trimmedQuery.length < MIN_SEARCH_LENGTH) {
      onSearch([], "", false);
      return;
    }

    setIsLoading(true);
    onSearch([], trimmedQuery, true);
    
    try {
      const results = await searchMovies(trimmedQuery);
      onSearch(results, trimmedQuery, false);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "Failed to search for movies. Please try again.",
        variant: "destructive",
      });
      onSearch([], trimmedQuery, false);
    } finally {
      setIsLoading(false);
    }
  }, DEBOUNCE_MS);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return { query, setQuery, isLoading, debouncedSearch };
}
