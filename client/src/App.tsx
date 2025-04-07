import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Home from "@/pages/Home";

function App() {
  // Create a default user (bypassing login)
  const defaultUser = {
    id: 1,
    username: "moviefan"
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Home user={defaultUser} />
        <Toaster />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
