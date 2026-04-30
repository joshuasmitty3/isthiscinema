import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Home from "@/pages/Home";
import LoginPage from "@/pages/LoginPage";
import { getCurrentUser, logout } from "@/lib/api";
import { User } from "@/lib/types";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getCurrentUser().then(u => {
      setUser(u);
      setChecking(false);
    });
  }, []);

  async function handleLogout() {
    await logout();
    queryClient.clear();
    setUser(null);
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        {user ? (
          <Home user={user} onLogout={handleLogout} />
        ) : (
          <LoginPage onLogin={setUser} />
        )}
        <Toaster />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
