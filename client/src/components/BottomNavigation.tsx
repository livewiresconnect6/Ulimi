import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Book, PenTool, Bookmark, User } from "lucide-react";

const navigationItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/browse", label: "Browse", icon: Book },
  { path: "/write", label: "Write", icon: PenTool },
  { path: "/library", label: "Library", icon: Bookmark },
  { path: "/profile", label: "Profile", icon: User },
];

export function BottomNavigation() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-amber-100 border-t-4 border-amber-300 px-2 py-4 z-50 shadow-xl" style={{ display: 'block', position: 'fixed' }}>
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navigationItems.map(({ path, label, icon: Icon }) => {
          const isActive = location === path;
          
          return (
            <button
              key={path}
              onClick={() => setLocation(path)}
              className={`mobile-button flex flex-col items-center space-y-1 min-h-[64px] min-w-[64px] ${
                isActive 
                  ? "bg-amber-300 text-amber-900 border-3 border-amber-500" 
                  : "bg-amber-50 text-amber-800 border-3 border-amber-400 hover:bg-amber-100"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
