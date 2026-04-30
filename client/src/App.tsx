import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Home from "@/pages/Home";
import LoginPage from "@/pages/LoginPage";
import SetupPage from "@/pages/SetupPage";
import { getCurrentUser, logout } from "@/lib/api";
import { User } from "@/lib/types";

type View = "checking" | "login" | "setup" | "app";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>("checking");

  useEffect(() => {
    getCurrentUser().then(u => {
      setUser(u);
      setView(u ? "app" : "login");
    });
  }, []);

  async function handleLogout() {
    await logout();
    queryClient.clear();
    setUser(null);
    setView("login");
  }

  function handleLogin(u: User) {
    setUser(u);
    setView("app");
  }

  if (view === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (view === "setup") {
    return (
      <QueryClientProvider client={queryClient}>
        <SetupPage onSetup={handleLogin} onBack={() => setView("login")} />
        <Toaster />
      </QueryClientProvider>
    );
  }

  if (view === "login") {
    return (
      <QueryClientProvider client={queryClient}>
        <LoginPage onLogin={handleLogin} onSetup={() => setView("setup")} />
        <Toaster />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Home user={user!} onLogout={handleLogout} />
        <Toaster />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
