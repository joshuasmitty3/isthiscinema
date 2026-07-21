import { User } from "@/lib/types";

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout?: () => void;
}

export default function Layout({ children, user, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <div className="container mx-auto px-4 pt-5 pb-1 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <img
            src="/mark.png"
            alt=""
            width={40}
            height={40}
            className="w-10 h-10 flex-none"
          />
          <h1 className="font-heading text-lg font-semibold tracking-tight text-primary">
            is this cinema?
          </h1>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="text-sm text-neutral-500 hover:text-primary transition-colors"
          >
            sign out
          </button>
        )}
      </div>

      {children}

      <footer className="py-4 text-center text-xs text-neutral-400">
        <div className="container mx-auto px-4">
          <p>is this cinema? &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
