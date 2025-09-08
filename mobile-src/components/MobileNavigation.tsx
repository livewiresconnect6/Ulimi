import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Search, Library, User, Headphones } from 'lucide-react';

const navigationItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/browse', icon: Search, label: 'Browse' },
  { path: '/library', icon: Library, label: 'Library' },
  { path: '/audiobooks', icon: Headphones, label: 'Audio' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function MobileNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navigationItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path || (path !== '/' && location.startsWith(path));
          
          return (
            <Link
              key={path}
              href={path}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 text-xs transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Icon 
                size={20} 
                className={`mb-1 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} 
              />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}