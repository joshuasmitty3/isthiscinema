import { useState } from "react";
import { User } from "@/lib/types";
import { login } from "@/lib/api";

interface LoginPageProps {
  onLogin: (user: User) => void;
  onSetup: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(username, password);
      onLogin(user);
    } catch {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[360px]">
          <div className="aspect-[16/10] w-full overflow-hidden rounded-[10px] bg-card">
            <img
              src="/cinema-login.jpg"
              alt=""
              className="h-full w-full object-cover"
            />
          </div>

          <h1 className="mt-6 mb-6 text-center font-heading text-lg font-semibold tracking-tight">
            is this <span className="text-primary">cinema</span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-muted-foreground mb-1.5" htmlFor="username">
                username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
                placeholder="username"
                className="w-full h-[45px] px-3 rounded-lg border border-border bg-input font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-muted-foreground mb-1.5" htmlFor="password">
                password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="password"
                className="w-full h-[45px] px-3 rounded-lg border border-border bg-input font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
              />
            </div>
            {error && (
              <p className="font-mono text-xs text-destructive">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[43px] rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "signing in…" : "sign in"}
            </button>
          </form>
        </div>
      </main>

      <footer className="py-8 text-center text-xs text-muted-foreground">
        <p className="font-mono">is this cinema? &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
