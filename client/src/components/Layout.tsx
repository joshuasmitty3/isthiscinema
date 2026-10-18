import { User } from "@/lib/types";

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout?: () => void;
  onSignIn?: () => void;
  light?: boolean; // light "reader" palette (used by essay pages)
}

export default function Layout({ children, user, onLogout, onSignIn, light }: LayoutProps) {
  const rootClass = light
    ? "min-h-screen flex flex-col bg-[#EBEBEB] text-neutral-900"
    : "min-h-screen flex flex-col bg-background text-foreground";
  const buttonClass = light
    ? "font-mono text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
    : "font-mono text-sm text-muted-foreground hover:text-foreground transition-colors";
  const footerClass = light
    ? "py-10 text-center text-xs text-neutral-500"
    : "py-10 text-center text-xs text-muted-foreground";

  return (
    <div className={rootClass}>
      <div className="container mx-auto px-4 pt-6 pb-1 flex justify-between items-center">
        <h1 className="font-heading text-lg font-semibold tracking-tight">
          is this <span className="text-primary">cinema</span>
        </h1>
        {user ? (
          onLogout && (
            <button onClick={onLogout} className={buttonClass}>
              sign out
            </button>
          )
        ) : (
          onSignIn && (
            <button onClick={onSignIn} className={buttonClass}>
              sign in
            </button>
          )
        )}
      </div>

      {children}

      <footer className={footerClass}>
        <div className="container mx-auto px-4">
          <p className="font-mono">is this cinema? &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
