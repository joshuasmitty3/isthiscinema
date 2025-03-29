import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import WatchList from "@/components/WatchList";
import WatchedList from "@/components/WatchedList";
import MovieDetail from "@/components/MovieDetail";
import ReviewModal from "@/components/ReviewModal";
import { Movie, SearchResult, User } from "@/lib/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { useSearch } from "@/hooks/use-search";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Home({ user, onLogout }: { user: User; onLogout: () => void }) {
  const queryClient = useQueryClient();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { isLoading, debouncedSearch } = useSearch((results, query, loading) => {
    setSearchResults(results);
    setSearchQuery(query);
    setIsSearching(loading);
  });

  const { data: watchedList = [] } = useQuery({
    queryKey: ["watchedlist"],
    queryFn: async () => {
      const response = await fetch("/api/watchedlist");
      if (!response.ok) {
        throw new Error("Failed to fetch watched list");
      }
      return response.json();
    },
  });

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="container mx-auto px-4 py-4">
        <Tabs defaultValue="watchlist" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="watchlist" className="flex-1">worth watching</TabsTrigger>
            <TabsTrigger value="watched" className="flex-1">already watched</TabsTrigger>
            <TabsTrigger asChild value="search" className="flex-1 !p-0">
              <div className="relative w-full">
                <input 
                  type="text" 
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    debouncedSearch(e.target.value);
                  }}
                  className="w-full h-full px-3 py-1.5 bg-transparent border-none focus:outline-none text-sm"
                />
                {isSearching ? (
                  <LoadingSpinner size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4" />
                ) : (
                  <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none opacity-50" />
                )}
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="watchlist">
            <WatchList 
              onListsChange={() => {
                queryClient.invalidateQueries({ queryKey: ["watchlist"] });
              }}
            />
          </TabsContent>

          <TabsContent value="watched">
            <WatchedList movies={watchedList} />
          </TabsContent>

          <TabsContent value="search">
            <SearchResults 
              results={searchResults}
              query={searchQuery}
              isLoading={isSearching}
              onSelectMovie={() => {}}
              onListsChange={() => {
                queryClient.invalidateQueries({ queryKey: ["watchlist"] });
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
      <Footer /> {/* Added Footer component */}
    </Layout>
  );
}