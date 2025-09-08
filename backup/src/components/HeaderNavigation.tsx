import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Search, Home, BookOpen, PenTool, Library, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { login, logout } from "@/lib/firebase";
import logoImage from "@assets/Asset 18@100x-100_1749745258723.jpg";

interface HeaderNavigationProps {
  onSearch?: (query: string) => void;
}

export function HeaderNavigation({ onSearch }: HeaderNavigationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAuthenticated, handleDemoLogin } = useAuth();
  const [location, setLocation] = useLocation();


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      try {
        await logout();
        localStorage.removeItem('ulimi_user');
        window.location.reload();
      } catch (error) {
        console.error('Logout error:', error);
      }
    } else {
      await handleDemoLogin();
      window.location.reload();
    }
  };

  const navigationItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: BookOpen, label: "Browse", path: "/browse" },
    { icon: PenTool, label: "Write", path: "/write" },
    { icon: Library, label: "Library", path: "/library" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src={logoImage} 
                alt="Ulimi" 
                className="h-10 w-auto"
              />
            </div>
          </div>

          {/* Main Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-6 ml-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    onClick={() => setLocation(item.path)}
                    className={`flex items-center space-x-2 ${
                      isActive ? 'text-primary bg-primary/10' : 'text-gray-600 hover:text-primary'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </nav>
          )}
          
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search stories, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </form>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
                <Button onClick={handleAuthAction} variant="outline" size="sm">
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={handleAuthAction} className="bg-accent hover:bg-orange-600">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
