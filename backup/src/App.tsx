import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HeaderNavigation } from "@/components/HeaderNavigation";

import { SplashScreen } from "@/components/SplashScreen";
import { AuthScreen } from "@/components/AuthScreen";
import { OnboardingFlow, type UserPreferences } from "@/components/OnboardingFlow";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "./lib/queryClient";

// Pages
import Home from "@/pages/Home";
import Browse from "@/pages/Browse";
import Write from "@/pages/Write";
import Read from "@/pages/Read";
import Audiobook from "@/pages/Audiobook";
import Library from "@/pages/Library";
import Profile from "@/pages/Profile";
import Author from "@/pages/Author";
import NotFound from "@/pages/not-found";

function Router() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading, refreshUser } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Removed the localStorage clearing on app start to allow returning users to stay signed in

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (!user.onboardingCompleted) {
        setShowOnboarding(true);
      } else {
        // User has already completed onboarding, go directly to app
        setShowOnboarding(false);
        setShowAuth(false);
      }
    }
  }, [isAuthenticated, user, loading]);

  const handleOnboardingComplete = async (preferences: UserPreferences) => {
    if (!user) return;
    
    try {
      const response = await apiRequest('PUT', `/api/users/${user.id}`, {
        userType: preferences.userType,
        preferredGenres: preferences.preferredGenres,
        topicsOfInterest: preferences.topicsOfInterest,
        onboardingCompleted: true,
      });
      
      const updatedUser = await response.json();
      
      // Update localStorage with the updated user data
      localStorage.setItem('ulimi_user', JSON.stringify(updatedUser));
      
      // Refresh the user data in the auth context
      await refreshUser();
      
      setShowOnboarding(false);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => {
      setShowSplash(false);
      if (!isAuthenticated) {
        setShowAuth(true);
      }
    }} />;
  }

  if (showAuth && !isAuthenticated) {
    return <AuthScreen onComplete={() => {
      setShowAuth(false);
      // Refresh the page to trigger auth state update
      window.location.reload();
    }} />;
  }

  if (showOnboarding && isAuthenticated) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderNavigation />
      
      <main className="min-h-screen">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/browse" component={Browse} />
          <Route path="/write" component={Write} />
          <Route path="/read/:id" component={Read} />
          <Route path="/audiobook/:id" component={Audiobook} />
          <Route path="/library" component={Library} />
          <Route path="/profile" component={Profile} />
          <Route path="/author/:authorId" component={Author} />
          <Route component={NotFound} />
        </Switch>
      </main>

      {/* Floating Action Button */}
      <Button
        onClick={() => setLocation("/write")}
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-lg hover:bg-orange-600 transition-all hover:scale-110 z-30"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>


    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
