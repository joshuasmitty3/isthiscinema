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
  const { data: watchList = [] } = useQuery({
    queryKey: ["watchlist"],
    queryFn: async () => {
      const response = await fetch("/api/watchlist");
      if (!response.ok) {
        throw new Error("Failed to fetch watch list");
      }
      return response.json();
    },
  });

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Search Movies</h2>
            <SearchBar />
            <SearchResults />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Watch List</h2>
            <WatchList movies={watchList} />
          </div>
        </div>
      </div>
    </Layout>
  );
}