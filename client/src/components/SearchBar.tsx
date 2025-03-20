import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RiSearchLine } from "react-icons/ri";
import { searchMovies } from "@/lib/api";
import { SearchResult } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useDebouncedCallback } from "use-debounce";

interface SearchBarProps {
  onSearch: (results: SearchResult[], query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      onSearch([], "");
      return;
    }
    
    setIsLoading(true);
    try {
      const results = await searchMovies(searchQuery);
      onSearch(results, searchQuery);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "Failed to search for movies. Please try again.",
        variant: "destructive",
      });
      onSearch([], searchQuery);
    } finally {
      setIsLoading(false);
    }
  }, 500);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    debouncedSearch.flush();
  };

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full py-3 px-4 pr-10 bg-white border border-neutral-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-primary transition-colors"
          disabled={isLoading}
        >
          <RiSearchLine className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
