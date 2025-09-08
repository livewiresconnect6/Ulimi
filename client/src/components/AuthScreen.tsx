import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { login } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { LogIn, User, Mail, Lock, UserPlus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { ForgotPassword } from "./ForgotPassword";
import ulimiIcon from "@assets/CutPaste_2023-03-05_17-37-28-115_1754699695574.png";

interface AuthScreenProps {
  onComplete: () => void;
}

export function AuthScreen({ onComplete }: AuthScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [signInData, setSignInData] = useState({ username: "", password: "" });
  const [signUpData, setSignUpData] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    displayName: "" 
  });
  const { handleDemoLogin } = useAuth();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await login();
      
      if (result && result.user) {
        // Clear any previous data first (data reset for Google login)
        localStorage.removeItem('ulimi_user');
        localStorage.removeItem('ulimi_onboarding_completed');
        localStorage.removeItem('ulimi_user_preferences');
        localStorage.removeItem('ulimi_reading_progress');
        localStorage.removeItem('ulimi_library_data');
        
        // Store new user data - always trigger onboarding for Google login
        localStorage.setItem('ulimi_user', JSON.stringify({
          id: result.user.uid,
          firebaseUid: result.user.uid,
          username: result.user.displayName || result.user.email,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          onboardingCompleted: false // Always trigger onboarding after data reset
        }));
        console.log('Google login with data reset completed - onboarding will be triggered');
      }
      
      onComplete();
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Sign-in failed",
        description: "Please check your internet connection and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      // Check if user exists
      const response = await apiRequest('POST', '/api/auth/signin', {
        username: signInData.username,
        password: signInData.password,
      });
      
      const user = await response.json();
      
      // Store user data
      localStorage.setItem('ulimi_user', JSON.stringify(user));
      onComplete();
    } catch (error) {
      toast({
        title: "Sign-in failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      // Create new user
      const response = await apiRequest('POST', '/api/auth/signup', {
        username: signUpData.username,
        email: signUpData.email,
        password: signUpData.password,
        displayName: signUpData.displayName,
      });
      
      const user = await response.json();
      
      // Store user data
      localStorage.setItem('ulimi_user', JSON.stringify(user));
      onComplete();
    } catch (error) {
      toast({
        title: "Sign-up failed",
        description: "Username might already be taken",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsLoading(true);
    await handleDemoLogin();
    onComplete();
    setIsLoading(false);
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <ForgotPassword onBack={() => setShowForgotPassword(false)} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img 
                src={ulimiIcon} 
                alt="Ulimi Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">Welcome to Ulimi</CardTitle>
            <p className="text-gray-600">Sign in to continue your reading journey</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Sign In */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              variant="outline"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            {/* Username Auth Tabs */}
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleUsernameSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Username"
                        value={signInData.username}
                        onChange={(e) => setSignInData({ ...signInData, username: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    Sign In
                  </Button>
                  <div className="text-center">
                    <Button 
                      variant="link" 
                      type="button" 
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot your password?
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleUsernameSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Username"
                        value={signUpData.username}
                        onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Display Name"
                        value={signUpData.displayName}
                        onChange={(e) => setSignUpData({ ...signUpData, displayName: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    Sign Up
                  </Button>
                </form>
              </TabsContent>
            </Tabs>


          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}