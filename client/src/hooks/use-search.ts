import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { searchMovies } from "@/lib/api";
import { SearchResult } from "@/lib/types";
import { useToast } from "./use-toast";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const MIN_SEARCH_LENGTH = 2;
  const DEBOUNCE_MS = 400;

  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length < MIN_SEARCH_LENGTH) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const results = await searchMovies(trimmedQuery);
      setResults(results || []);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "Failed to search for movies. Please try again.",
        variant: "destructive",
      });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, DEBOUNCE_MS);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return { query, setQuery, results, isLoading };
}