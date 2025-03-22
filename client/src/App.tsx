import React, { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { LoadingSpinner } from "./components/ui/loading-spinner";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import MovieCardTest from "@/components/MovieCardTest";
import NotFound from "@/pages/not-found";
import { apiRequest } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

function App() {
  const [location, setLocation] = useState<{ pathname: string; }>(useLocation());
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
      setLocation({pathname: "/login"});
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
    <Switch location={location}>
      <Route path="/login">
        {user ? <Redirect to="/" /> : <Login onLoginSuccess={setUser} />}
      </Route>
      <Route path="/test/movie-card" component={MovieCardTest} />
      <Route path="/">
        {!user ? <Redirect to="/login" /> : <Home user={user} onLogout={handleLogout} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;