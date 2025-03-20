import { useState } from "react";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import WatchList from "@/components/WatchList";
import WatchedList from "@/components/WatchedList";
import MovieDetail from "@/components/MovieDetail";
import ReviewModal from "@/components/ReviewModal";
import { Movie, SearchResult, User } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

interface HomeProps {
  user: User;
  onLogout: () => void;
}

export default function Home({ user, onLogout }: HomeProps) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false); // Added state for search loading
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [movieToReview, setMovieToReview] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch watch list
  const { data: watchList = [], refetch: refetchWatchList } = useQuery({
    queryKey: ["/api/watchlist"],
  });

  // Fetch watched list
  const { data: watchedList = [], refetch: refetchWatchedList } = useQuery({
    queryKey: ["/api/watchedlist"],
  });

  const handleSearch = (results: SearchResult[], query: string, isLoading: boolean) => {
    setSearchResults(results);
    setSearchQuery(query);
    setIsSearchLoading(isLoading); // Update isSearchLoading state
  };

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsDetailModalOpen(true);
  };

  const handleOpenReviewModal = (movie: Movie) => {
    setMovieToReview(movie);
    setIsReviewModalOpen(true);
  };

  const handleRefreshLists = () => {
    refetchWatchList();
    refetchWatchedList();
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <main className="flex-1 container mx-auto px-4 py-6">
        <SearchBar onSearch={handleSearch} />

        {searchResults.length > 0 && (
          <SearchResults
            results={searchResults}
            query={searchQuery}
            onSelectMovie={handleSelectMovie}
            onListsChange={handleRefreshLists}
            isLoading={isSearchLoading} // Pass isSearchLoading to SearchResults
          />
        )}

        <div className="mb-4 border-b border-neutral-200">
          <div className="flex space-x-1">
            <button
              onClick={() => setSelectedTab("watchlist")}
              className={`py-2 px-4 font-medium transition-colors ${
                selectedTab === "watchlist"
                  ? "text-primary border-b-2 border-primary"
                  : "text-neutral-600 hover:text-primary border-b-2 border-transparent hover:border-primary/30"
              }`}
            >
              Watch List
            </button>
            <button
              onClick={() => setSelectedTab("watched")}
              className={`py-2 px-4 font-medium transition-colors ${
                selectedTab === "watched"
                  ? "text-primary border-b-2 border-primary"
                  : "text-neutral-600 hover:text-primary border-b-2 border-transparent hover:border-primary/30"
              }`}
            >
              Watched
            </button>
          </div>
        </div>

        {selectedTab === "watchlist" ? (
          <WatchList
            movies={watchList}
            onSelectMovie={handleSelectMovie}
            onListsChange={handleRefreshLists}
          />
        ) : (
          <WatchedList
            movies={watchedList}
            onSelectMovie={handleSelectMovie}
            onOpenReviewModal={handleOpenReviewModal}
          />
        )}

        <MovieDetail
          movie={selectedMovie}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onListsChange={handleRefreshLists}
        />

        <ReviewModal
          movie={movieToReview}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSave={() => {
            setIsReviewModalOpen(false);
            refetchWatchedList();
          }}
        />
      </main>
    </Layout>
  );
}