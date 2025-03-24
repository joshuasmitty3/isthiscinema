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


// Using the previously defined MovieCardTest component instead
import MovieCardTest from './components/MovieCardTest';

// Added logging utility
const logEvent = (event, data) => {
  console.log(`Event: ${event}`, data);
};

//Added ErrorBoundary component
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  const handleError = (error) => {
    logEvent('Error', error); //Log the error
    setHasError(true);
  };

  if (hasError) {
    return (
      <div>
        <h1>Something went wrong.</h1>
      </div>
    );
  }

  return children;
};


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
        logEvent('Auth Check Failed', error); //Log the error
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
      logEvent('Logout Failed', error); //Log the error
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
      <Route path="/test/movie-card" component={MovieCardTest} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial authentication
    apiRequest("GET", "/api/me")
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <LoadingSpinner size="lg" className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary> {/* Added ErrorBoundary */}
        <Router />
        <Toaster />
      </ErrorBoundary> {/* Closed ErrorBoundary */}
    </QueryClientProvider>
  );
}

export default App;