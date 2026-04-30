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
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-heading font-semibold">is it cinema?</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-neutral-800 mb-1 text-center">create account</h2>
          <p className="text-sm text-neutral-500 text-center mb-6">pick a username and password for yourself</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="username">
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
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="password">
                password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="confirm">
                confirm password
              </label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "creating account…" : "create account"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-neutral-500">
            already have an account?{" "}
            <button onClick={onBack} className="text-primary hover:underline">
              sign in
            </button>
          </p>
        </div>
      </main>

      <footer className="bg-primary/10 py-3 text-center text-sm text-neutral-600">
        <p>is it cinema? &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
