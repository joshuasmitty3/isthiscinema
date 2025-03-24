import { Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "./components/ui/loading-spinner";
import MovieCardTest from './components/MovieCardTest';

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  const handleError = (error) => {
    console.log('Error', error);
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

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Route path="/login" component={Login} />
          <Route path="/" component={Home} />
          <Route path="/test/movie-card" component={MovieCardTest} />
          <Route component={NotFound} />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}