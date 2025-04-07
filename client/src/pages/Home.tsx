import { useState } from "react";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import WatchList from "@/components/WatchList";
import WatchedList from "@/components/WatchedList";
import MovieDetail from "@/components/MovieDetail";
import { Movie, SearchResult, User, ListChangeHandler } from "@/lib/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { useSearch } from "@/hooks/use-search";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Home({ user }: { user: User }) {
  const queryClient = useQueryClient();
  const { query, setQuery, results, isLoading } = useSearch();
  
  const handleListsChange: ListChangeHandler = () => {
    queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    queryClient.invalidateQueries({ queryKey: ["watchedlist"] });
  };

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
    <Layout user={user}>
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
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                  }}
                  className="w-full h-full px-3 py-1.5 bg-transparent border-none focus:outline-none text-sm"
                />
                {isLoading ? (
                  <LoadingSpinner size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4" />
                ) : (
                  <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none opacity-50" />
                )}
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="watchlist">
            <WatchList onListsChange={handleListsChange} />
          </TabsContent>

          <TabsContent value="watched">
            <WatchedList 
              movies={watchedList} 
              onListsChange={handleListsChange}
            />
          </TabsContent>

          <TabsContent value="search">
            <SearchResults 
              results={results}
              query={query}
              isLoading={isLoading}
              onSelectMovie={() => {}}
              onListsChange={handleListsChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}