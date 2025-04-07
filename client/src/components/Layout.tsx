import { User } from "@/lib/types";

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout?: () => void; // Made optional since we're not using it
}

export default function Layout({ children, user }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-heading font-semibold">is it cinema?</h1>
          {/* Username display removed */}
        </div>
      </header>
      
      {children}
      
      <footer className="bg-primary/10 py-3 text-center text-sm text-neutral-600">
        <div className="container mx-auto px-4">
          <p>is it cinema? &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
