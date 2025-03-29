import { User } from "@/lib/types";
import { RiLogoutBoxLine, RiUser3Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

export default function Layout({ children, user, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-heading font-semibold">is it cinema?</h1>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm hidden sm:inline">{user.username}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-primary/30 transition-colors rounded-full"
              onClick={onLogout}
              title="Logout"
            >
              <RiLogoutBoxLine className="h-5 w-5" />
            </Button>
          </div>
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
