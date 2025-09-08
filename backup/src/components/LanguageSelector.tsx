import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/translation";
import { Languages } from "lucide-react";

interface LanguageSelectorProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  disabled?: boolean;
}

export function LanguageSelector({ currentLanguage, onLanguageChange, disabled }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage);

  const handleLanguageSelect = (languageCode: LanguageCode) => {
    onLanguageChange(languageCode);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled} className="flex items-center space-x-2">
          <Languages className="h-4 w-4" />
          <span>{currentLang?.flag}</span>
          <span>{currentLang?.name}</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Translation Language</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {SUPPORTED_LANGUAGES.map((language) => (
            <Button
              key={language.code}
              variant="ghost"
              className="w-full justify-start p-3 h-auto"
              onClick={() => handleLanguageSelect(language.code)}
            >
              <span className="text-2xl mr-3">{language.flag}</span>
              <div className="text-left">
                <div className="font-medium">{language.name}</div>
                <div className="text-sm text-gray-500">
                  {language.code === 'en' ? 'Original' : 'Translation available'}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
