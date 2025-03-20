import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import { useEffect, useState } from "react";
import { apiRequest } from "./lib/queryClient";
import { LoadingSpinner } from "./components/ui/loading-spinner"; // Added import
import MovieCard from "@/components/MovieCard"; // Assuming MovieCard exists


// Dummy data for MovieCardTest
const dummyMovieData = [
  { title: "Movie 1", poster: "/poster1.jpg", rating: 4.5 },
  { title: "Movie 2", poster: "/poster2.jpg", rating: 3.8 },
  { title: "Movie 3", poster: "/poster3.jpg", rating: 4.9 },
];

function MovieCardTest() {
  return (
    <div>
      <h1>MovieCard Test</h1>
      {dummyMovieData.map((movie) => (
        <MovieCard key={movie.title} {...movie} />
      ))}
    </div>
  );
}


function Router() {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/me", {
          credentials: "include",
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout", {});
      setUser(null);
      setLocation("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" className="text-primary" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login">
        {user ? <Redirect to="/" /> : <Login onLoginSuccess={setUser} />}
      </Route>
      <Route path="/">
        {!user ? <Redirect to="/login" /> : <Home user={user} onLogout={handleLogout} />}
      </Route>
      <Route path="/test/movie-card">
        <MovieCardTest />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;