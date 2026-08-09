import { useState } from "react";
import Layout from "@/components/Layout";
import SearchResults from "@/components/SearchResults";
import WatchList from "@/components/WatchList";
import WatchedList from "@/components/WatchedList";
import { User, ListChangeHandler } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { useMovies } from "@/lib/movies";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { useSearch } from "@/hooks/use-search";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const tabClass =
  "relative rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3 -mb-px text-sm font-medium text-muted-foreground shadow-none transition-colors data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none";

export default function Home({ user, onLogout }: { user: User; onLogout?: () => void }) {
  const queryClient = useQueryClient();
  const { query, setQuery, results, isLoading } = useSearch();
  const { watchlist, watchedlist } = useMovies();
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = () => setSearchOpen(true);
  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };

  const handleListsChange: ListChangeHandler = () => {
    queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    queryClient.invalidateQueries({ queryKey: ["watchedlist"] });
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="container mx-auto px-4 pt-4 pb-4">
        <Tabs defaultValue="watchlist" className="w-full">
          <div className="border-b border-border">
            <TabsList className="h-auto gap-6 rounded-none bg-transparent p-0">
              <TabsTrigger value="watchlist" className={tabClass} onClick={closeSearch}>
                worth watching
                <span className="ml-1.5 font-mono text-xs text-muted-foreground">{watchlist.length}</span>
              </TabsTrigger>
              <TabsTrigger value="watched" className={tabClass} onClick={closeSearch}>
                already watched
                <span className="ml-1.5 font-mono text-xs text-muted-foreground">{watchedlist.length}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {searchOpen ? (
            <div className="mt-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  ) : (
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  )}
                  <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="search for a film to add…"
                    aria-label="Search movies"
                    className="h-10 w-full rounded-md border border-border bg-input pl-9 pr-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <button
                  type="button"
                  onClick={closeSearch}
                  className="flex-none font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  cancel
                </button>
              </div>

              <div className="mt-6">
                {query.trim().length < 2 ? (
                  <p className="py-10 text-center font-mono text-sm text-muted-foreground">
                    start typing to find a film…
                  </p>
                ) : (
                  <SearchResults
                    results={results}
                    query={query}
                    isLoading={isLoading}
                    onSelectMovie={() => {}}
                    onListsChange={handleListsChange}
                  />
                )}
              </div>
            </div>
          ) : (
            <>
              <TabsContent value="watchlist" className="mt-4">
                <div className="mb-2 flex justify-end">
                  <button
                    type="button"
                    onClick={openSearch}
                    className="rounded-md border border-dashed border-primary/50 px-3 py-1.5 font-mono text-sm text-primary transition-colors hover:bg-primary/10"
                  >
                    + add a film
                  </button>
                </div>
                <WatchList onListsChange={handleListsChange} />
              </TabsContent>

              <TabsContent value="watched" className="mt-4">
                <WatchedList movies={watchedlist} onListsChange={handleListsChange} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}
