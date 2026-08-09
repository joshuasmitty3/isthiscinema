import { useState } from "react";
import { User } from "@/lib/types";
import { setupAccount } from "@/lib/api";

interface SetupPageProps {
  onSetup: (user: User) => void;
  onBack: () => void;
}

export default function SetupPage({ onSetup, onBack }: SetupPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const user = await setupAccount(username, password);
      onSetup(user);
    } catch (err: any) {
      setError(err.message || "Could not create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <h1 className="font-heading text-3xl font-semibold tracking-tight mb-2">
          is this <span className="text-primary">cinema</span>
        </h1>
        <p className="font-mono text-xs text-muted-foreground mb-10">pick a username and password for yourself</p>
        <div className="w-full max-w-sm">
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
                autoComplete="username"
                className="w-full h-10 px-3 rounded-md border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
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
                autoComplete="new-password"
                className="w-full h-10 px-3 rounded-md border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-muted-foreground mb-1.5" htmlFor="confirm">
                confirm password
              </label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full h-10 px-3 rounded-md border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
              />
            </div>
            {error && (
              <p className="font-mono text-xs text-destructive">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "creating account…" : "create account"}
            </button>
          </form>
          <p className="mt-6 text-center font-mono text-xs text-muted-foreground">
            already have an account?{" "}
            <button onClick={onBack} className="text-primary hover:underline">
              sign in
            </button>
          </p>
        </div>
      </main>

      <footer className="py-10 text-center text-xs text-muted-foreground">
        <p className="font-mono">is this cinema? &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
