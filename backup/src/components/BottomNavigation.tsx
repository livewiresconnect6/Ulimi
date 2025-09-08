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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navigationItems.map(({ path, label, icon: Icon }) => {
          const isActive = location === path;
          
          return (
            <Button
              key={path}
              variant="ghost"
              size="sm"
              onClick={() => setLocation(path)}
              className={`flex flex-col items-center space-y-1 p-2 h-auto ${
                isActive ? "text-accent" : "text-gray-600 hover:text-primary"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
