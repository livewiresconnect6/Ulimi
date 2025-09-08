export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isLoading: boolean;
  hasCustomAudio?: boolean;
  audioUrl?: string;
}

export class TextToSpeechEngine {
  private synthesis: SpeechSynthesis;
  private utterance: SpeechSynthesisUtterance | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private currentText: string = '';
  private currentLanguage: string = 'en';
  private onStateChange: (state: Partial<AudioState>) => void;
  private currentPosition: number = 0;
  private intervalId: number | null = null;
  private customAudioUrl: string | null = null;
  private estimatedDuration: number = 0;

  constructor(onStateChange: (state: Partial<AudioState>) => void) {
    this.synthesis = window.speechSynthesis;
    this.onStateChange = onStateChange;
  }

  async loadCustomAudio(audioFile: File): Promise<void> {
    this.onStateChange({ isLoading: true });
    
    // Create audio URL from file
    if (this.customAudioUrl) {
      URL.revokeObjectURL(this.customAudioUrl);
    }
    this.customAudioUrl = URL.createObjectURL(audioFile);
    
    // Create audio element
    this.audioElement = new Audio(this.customAudioUrl);
    
    this.audioElement.addEventListener('loadedmetadata', () => {
      this.onStateChange({ 
        isLoading: false, 
        duration: this.audioElement!.duration,
        hasCustomAudio: true,
        audioUrl: this.customAudioUrl!
      });
    });
    
    this.audioElement.addEventListener('timeupdate', () => {
      if (this.audioElement) {
        this.onStateChange({ currentTime: this.audioElement.currentTime });
      }
    });
    
    this.audioElement.addEventListener('ended', () => {
      this.onStateChange({ isPlaying: false });
    });
    
    this.audioElement.addEventListener('play', () => {
      this.onStateChange({ isPlaying: true });
    });
    
    this.audioElement.addEventListener('pause', () => {
      this.onStateChange({ isPlaying: false });
    });
    
    this.audioElement.load();
  }

  private preprocessTextForSmoothSpeech(text: string): string {
    // Minimal preprocessing for natural flow
    return text
      // Just ensure proper spacing around punctuation
      .replace(/\s+/g, ' ')
      .trim();
  }

  async loadText(text: string, language: string = 'en'): Promise<void> {
    this.onStateChange({ isLoading: true });
    
    // Pre-process text for smoother delivery
    const processedText = this.preprocessTextForSmoothSpeech(text);
    
    this.currentText = processedText;
    this.currentLanguage = language;
    this.currentPosition = 0;
    
    if (this.utterance) {
      this.synthesis.cancel();
    }

    // Wait for voices to be loaded
    await this.waitForVoices();

    this.utterance = new SpeechSynthesisUtterance(processedText);
    this.utterance.lang = this.getVoiceLanguage(language);
    this.utterance.rate = 1;
    this.utterance.pitch = 1;
    this.utterance.volume = 1;

    // Set optimal voice with Maya Angelou-style characteristics for English
    const optimalVoice = this.selectOptimalVoice(language);
    if (optimalVoice) {
      this.utterance.voice = optimalVoice;
      // Balanced Maya Angelou-style characteristics for natural delivery
      this.utterance.rate = 0.85; // Natural reading pace with slight deliberation
      this.utterance.pitch = 0.9; // Slightly lower for warmth but more natural
      this.utterance.volume = 1.0; // Clear and confident
    }

    this.utterance.onstart = () => {
      this.estimatedDuration = this.estimateDuration(text);
      this.onStateChange({ isPlaying: true, isLoading: false, duration: this.estimatedDuration });
      this.startPositionTracking();
    };

    this.utterance.onend = () => {
      this.onStateChange({ isPlaying: false });
      this.stopPositionTracking();
    };

    this.utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.onStateChange({ isPlaying: false, isLoading: false });
      this.stopPositionTracking();
    };

    this.utterance.onpause = () => {
      this.onStateChange({ isPlaying: false });
      this.stopPositionTracking();
    };

    this.utterance.onresume = () => {
      this.onStateChange({ isPlaying: true });
      this.startPositionTracking();
    };

    this.onStateChange({ isLoading: false });
  }

  play(): void {
    if (this.audioElement) {
      // Play custom audio
      this.audioElement.play().catch(console.error);
    } else if (this.utterance) {
      // Play text-to-speech
      this.synthesis.cancel();
      setTimeout(() => {
        this.synthesis.speak(this.utterance!);
      }, 100);
    }
  }

  pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    } else if (this.synthesis.speaking) {
      this.synthesis.pause();
    }
  }

  stop(): void {
    this.synthesis.cancel();
    this.currentPosition = 0;
    this.onStateChange({ isPlaying: false, currentTime: 0 });
    this.stopPositionTracking();
  }

  setPlaybackRate(rate: number): void {
    if (this.utterance) {
      this.utterance.rate = rate * 0.85; // Natural pace with slight deliberation
      this.onStateChange({ playbackRate: rate });
      
      // Restart speech with new rate if currently playing
      if (this.synthesis.speaking) {
        const wasPlaying = !this.synthesis.paused;
        this.synthesis.cancel();
        if (wasPlaying) {
          setTimeout(() => this.play(), 100);
        }
      }
    }
  }

  seekTo(position: number): void {
    if (this.audioElement) {
      // For custom audio, seek directly to the position
      this.audioElement.currentTime = position;
      this.onStateChange({ currentTime: position });
    } else {
      // For text-to-speech, restart from calculated position
      const estimatedDuration = this.estimateDuration(this.currentText);
      const progressRatio = position / estimatedDuration;
      const words = this.currentText.split(' ');
      const totalWords = words.length;
      const targetWordIndex = Math.floor(progressRatio * totalWords);
      
      if (targetWordIndex < totalWords && targetWordIndex >= 0) {
        const remainingText = words.slice(targetWordIndex).join(' ');
        const wasPlaying = this.synthesis.speaking && !this.synthesis.paused;
        
        this.synthesis.cancel();
        this.currentPosition = position;
        this.onStateChange({ currentTime: position });
        
        if (remainingText.trim() && this.utterance) {
          this.utterance.text = remainingText;
          
          if (wasPlaying) {
            setTimeout(() => {
              this.synthesis.speak(this.utterance!);
              this.onStateChange({ isPlaying: true });
            }, 100);
          }
        }
      }
    }
  }

  getCurrentPosition(): number {
    return this.currentPosition;
  }

  private getVoiceLanguage(languageCode: string): string {
    const languageMap: Record<string, string> = {
      'en': 'en-US',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'pt': 'pt-PT',
      'zh': 'zh-CN',
      'st': 'en-US', // Fallback to English for Sesotho
      'zu': 'en-US', // Fallback to English for Zulu
      've': 'en-US', // Fallback to English for Venda
    };
    
    return languageMap[languageCode] || 'en-US';
  }

  private selectOptimalVoice(languageCode: string): SpeechSynthesisVoice | null {
    const voices = this.synthesis.getVoices();
    const targetLang = this.getVoiceLanguage(languageCode);
    
    // Priority selection for English voices focusing on most natural-sounding options
    if (languageCode === 'en') {
      // First priority: Neural/online voices (most natural)
      const neuralVoices = voices.filter(v => 
        v.lang.startsWith('en') && 
        (v.name.toLowerCase().includes('neural') || 
         v.name.toLowerCase().includes('natural') ||
         v.name.toLowerCase().includes('online') ||
         v.name.toLowerCase().includes('aria') ||
         v.name.toLowerCase().includes('jenny'))
      );
      
      if (neuralVoices.length > 0) {
        const selectedVoice = neuralVoices[0];
        console.log('Selected natural voice:', selectedVoice.name);
        return selectedVoice;
      }
      
      // Second priority: High-quality platform voices
      const qualityVoiceNames = [
        'Samantha', // macOS - very natural
        'Alex', // macOS - clear and expressive
        'Google US English', // Google's natural voice
        'Microsoft Zira', // Windows quality voice
        'Karen', // Windows alternative
      ];
      
      for (const name of qualityVoiceNames) {
        const voice = voices.find(v => 
          v.name.includes(name) && v.lang.startsWith('en')
        );
        if (voice) {
          console.log('Selected quality voice:', voice.name);
          return voice;
        }
      }
      
      // Third priority: Any female English voice (typically less robotic)
      const femaleVoice = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.toLowerCase().includes('female') || 
         v.name.toLowerCase().includes('woman'))
      );
      if (femaleVoice) {
        console.log('Selected female voice:', femaleVoice.name);
        return femaleVoice;
      }
      
      // Final fallback: Best available English voice
      const englishVoice = voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) {
        console.log('Selected fallback English voice:', englishVoice.name);
        return englishVoice;
      }
    }
    
    // For other languages, find the best available voice
    const exactMatch = voices.find(v => v.lang === targetLang);
    if (exactMatch) return exactMatch;
    
    const langMatch = voices.find(v => v.lang.startsWith(targetLang.substring(0, 2)));
    return langMatch || voices[0] || null;
  }

  private startPositionTracking(): void {
    this.intervalId = window.setInterval(() => {
      if (this.synthesis.speaking && !this.synthesis.paused) {
        this.currentPosition = Math.min(this.currentPosition + 1, this.estimatedDuration);
        this.onStateChange({ currentTime: this.currentPosition });
      }
    }, 1000);
  }

  private stopPositionTracking(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async waitForVoices(): Promise<void> {
    return new Promise((resolve) => {
      if (this.synthesis.getVoices().length > 0) {
        resolve();
        return;
      }
      
      const voicesChangedHandler = () => {
        if (this.synthesis.getVoices().length > 0) {
          this.synthesis.removeEventListener('voiceschanged', voicesChangedHandler);
          resolve();
        }
      };
      
      this.synthesis.addEventListener('voiceschanged', voicesChangedHandler);
      
      // Fallback timeout
      setTimeout(() => {
        this.synthesis.removeEventListener('voiceschanged', voicesChangedHandler);
        resolve();
      }, 1000);
    });
  }

  private estimateDuration(text: string): number {
    // Estimate duration based on word count and natural reading speed
    const wordCount = text.split(/\s+/).length;
    const wordsPerMinute = 160; // Natural reading pace with slight deliberation
    const estimatedMinutes = wordCount / wordsPerMinute;
    const estimatedSeconds = Math.ceil(estimatedMinutes * 60);
    
    console.log(`Estimated duration for ${wordCount} words: ${estimatedSeconds} seconds (${Math.round(estimatedMinutes * 10) / 10} minutes)`);
    return estimatedSeconds;
  }

  destroy(): void {
    this.synthesis.cancel();
    this.stopPositionTracking();
  }
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function estimateReadingTime(text: string, wordsPerMinute: number = 200): number {
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}