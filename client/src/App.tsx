
import React, { useState, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { LoadingSpinner } from "./components/ui/loading-spinner";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import MovieCardTest from "@/components/MovieCardTest";
import NotFound from "@/pages/not-found";
import { apiRequest } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import type { User } from "./lib/types";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await apiRequest<User>("/api/me");
      setUser(response);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    await apiRequest("/api/logout", { method: "POST" });
    setUser(null);
    setLocation("/login");
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/login">
          {user ? (setLocation("/"), null) : <Login onLogin={setUser} />}
        </Route>
        <Route path="/test/movie-card" component={MovieCardTest} />
        <Route path="/">
          {!user ? (setLocation("/login"), null) : <Home user={user} onLogout={handleLogout} />}
        </Route>
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
