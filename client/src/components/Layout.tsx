import { User } from "@/lib/types";

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout?: () => void;
}

export default function Layout({ children, user, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="container mx-auto px-4 pt-6 pb-1 flex justify-between items-center">
        <h1 className="font-heading text-lg font-semibold tracking-tight">
          is this <span className="text-primary">cinema</span>
        </h1>
        {onLogout && (
          <button
            onClick={onLogout}
            className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            sign out
          </button>
        )}
      </div>

      {children}

      <footer className="py-10 text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4">
          <p className="font-mono">is this cinema? &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
