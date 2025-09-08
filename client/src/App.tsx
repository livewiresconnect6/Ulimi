import { QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import { queryClient } from "@/lib/queryClient";

// Import pages
import Home from "@/pages/Home";
import Browse from "@/pages/Browse";
import Library from "@/pages/Library";
import Profile from "@/pages/Profile";
import Write from "@/pages/Write";
import Read from "@/pages/Read";
import Author from "@/pages/Author";
import Audiobook from "@/pages/Audiobook";
import NotFound from "@/pages/not-found";

// Import components
import { HeaderNavigation } from "@/components/HeaderNavigation";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Toaster } from "@/components/ui/toaster";

export default function App() {
  const isMobile = useIsMobile();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Router>
          {!isMobile && <HeaderNavigation />}
          
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/browse" component={Browse} />
            <Route path="/library" component={Library} />
            <Route path="/profile" component={Profile} />
            <Route path="/write" component={Write} />
            <Route path="/read/:id" component={Read} />
            <Route path="/author/:id" component={Author} />
            <Route path="/audiobook/:id" component={Audiobook} />
            <Route component={NotFound} />
          </Switch>

          {isMobile && <BottomNavigation />}
        </Router>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}