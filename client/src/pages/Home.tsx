import { useState } from "react";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import WatchList from "@/components/WatchList";
import WatchedList from "@/components/WatchedList";
import MovieDetail from "@/components/MovieDetail";
import ReviewModal from "@/components/ReviewModal";
import { Movie, SearchResult, User } from "@/lib/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Home({ user, onLogout }: { user: User; onLogout: () => void }) {
  const queryClient = useQueryClient();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

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
            <TabsTrigger value="watchlist" className="flex-1">Watch List</TabsTrigger>
            <TabsTrigger value="watched" className="flex-1">Watched</TabsTrigger>
            <TabsTrigger value="search" className="flex-1">Search</TabsTrigger>
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
            <SearchBar 
              onSearch={(results, query, loading) => {
                setSearchResults(results);
                setSearchQuery(query);
                setIsSearching(loading);
              }} 
            />
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
    </Layout>
  );
}