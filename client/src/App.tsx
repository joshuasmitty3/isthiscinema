import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import { useEffect, useState } from "react";
import { apiRequest } from "./lib/queryClient";
import { LoadingSpinner } from "./components/ui/loading-spinner";
import MovieCard from "@/components/MovieCard";
import MovieCardTest from './components/MovieCardTest';
import Layout from "./components/Layout";
import { Router } from "wouter";

const logEvent = (event, data) => {
  console.log(`Event: ${event}`, data);
};

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  const handleError = (error) => {
    logEvent('Error', error);
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

const AppRouter = () => {
  return (
    <Switch>
      <Route path="/login">{(params) => <Login />}</Route>
      <Route path="/">{(params) => <Home />}</Route>
      <Route path="/test/movie-card">{(params) => <MovieCardTest />}</Route>
      <Route>{(params) => <NotFound />}</Route>
    </Switch>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiRequest("GET", "/api/me")
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <LoadingSpinner size="lg" className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppRouter />
          <Toaster />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}