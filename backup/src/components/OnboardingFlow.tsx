import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, PenTool, BookOpen, 
  ChevronLeft, ChevronRight, Check 
} from "lucide-react";

export interface UserPreferences {
  userType: string[];
  preferredGenres: string[];
  topicsOfInterest: string[];
}

interface OnboardingFlowProps {
  onComplete: (preferences: UserPreferences) => void;
}

const USER_TYPES = [
  { id: 'Educator', label: 'Educator', icon: GraduationCap, description: 'I teach and educate others' },
  { id: 'Writer', label: 'Writer', icon: PenTool, description: 'I create and share stories' },
  { id: 'Casual Reader', label: 'Casual Reader', icon: BookOpen, description: 'I love reading for pleasure' },
];

const FICTION_GENRES = [
  'Mystery & Thriller',
  'Romance',
  'Science Fiction',
  'Fantasy',
  'Historical Fiction',
  'Horror',
  'Young Adult',
  'Literary Fiction'
];

const NON_FICTION_GENRES = [
  'Biography & Memoir',
  'Self-Help',
  'Business',
  'Health & Wellness',
  'Travel',
  'Politics',
  'History',
  'True Crime'
];

const TOPICS = [
  'Writing',
  'Business',
  'Sports',
  'Travel',
  'Food',
  'Technology',
  'Education',
  'Psychology',
  'Culture',
  'Personal Development'
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<UserPreferences>({
    userType: [],
    preferredGenres: [],
    topicsOfInterest: [],
  });

  const steps = [
    {
      title: "What are you using the app for?",
      subtitle: "Help us personalize your experience",
      content: (
        <div className="grid grid-cols-1 gap-4">
          {USER_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = preferences.userType.includes(type.id);
            
            return (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => toggleSelection('userType', type.id)}
              >
                <CardContent className="flex items-center p-4">
                  <Icon className={`h-8 w-8 mr-4 ${isSelected ? 'text-primary' : 'text-gray-400'}`} />
                  <div>
                    <h3 className="font-semibold">{type.label}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                  {isSelected && <Check className="h-5 w-5 text-primary ml-auto" />}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ),
    },
    {
      title: "What genres do you prefer?",
      subtitle: "Select at least one from Fiction or Non-Fiction to discover content you'll love",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Fiction</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {FICTION_GENRES.map((genre) => {
                const isSelected = preferences.preferredGenres.includes(genre);
                
                return (
                  <Badge
                    key={genre}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer p-3 justify-center transition-all hover:scale-105 text-center ${
                      isSelected ? 'bg-primary text-white' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => toggleSelection('preferredGenres', genre)}
                  >
                    {genre}
                  </Badge>
                );
              })}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Non-Fiction</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {NON_FICTION_GENRES.map((genre) => {
                const isSelected = preferences.preferredGenres.includes(genre);
                
                return (
                  <Badge
                    key={genre}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer p-3 justify-center transition-all hover:scale-105 text-center ${
                      isSelected ? 'bg-primary text-white' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => toggleSelection('preferredGenres', genre)}
                  >
                    {genre}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Please choose topics of interest",
      subtitle: "Select topics you'd like to explore and learn about",
      content: (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {TOPICS.map((topic) => {
            const isSelected = preferences.topicsOfInterest.includes(topic);
            
            return (
              <Badge
                key={topic}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer p-3 justify-center transition-all hover:scale-105 ${
                  isSelected ? 'bg-primary text-white' : 'hover:bg-gray-100'
                }`}
                onClick={() => toggleSelection('topicsOfInterest', topic)}
              >
                {topic}
              </Badge>
            );
          })}
        </div>
      ),
    },
  ];

  const toggleSelection = (field: keyof UserPreferences, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return preferences.userType.length > 0;
      case 1:
        return preferences.preferredGenres.length > 0;
      case 2:
        return preferences.topicsOfInterest.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(preferences);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index <= currentStep ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {steps[currentStep].title}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {steps[currentStep].subtitle}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {steps[currentStep].content}
            </motion.div>
            
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center bg-primary hover:bg-primary/90"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    Complete Setup
                    <Check className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}