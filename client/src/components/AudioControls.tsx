import { Button } from "@/components/ui/button";
import { CustomAudioSlider } from "@/components/CustomAudioSlider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Play, Pause, SkipBack, SkipForward, 
  RotateCcw, RotateCw, Volume2, Upload, Headphones
} from "lucide-react";
import { formatTime } from "@/lib/audio";
import type { AudioState } from "@/lib/audio";
import type { LanguageCode } from "@/lib/translation";
import { useState, useRef, useCallback } from "react";

interface AudioControlsProps {
  audioState: AudioState;
  currentLanguage: LanguageCode;
  onPlayPause: () => void;
  onSeek: (position: number) => void;
  onRewind: () => void;
  onForward: () => void;
  onSpeedChange: (speed: number) => void;
  onLanguageChange: (language: LanguageCode) => void;
  onPreviousChapter?: () => void;
  onNextChapter?: () => void;
  onAudioUpload?: (file: File) => void;
}

export function AudioControls({
  audioState,
  currentLanguage,
  onPlayPause,
  onSeek,
  onRewind,
  onForward,
  onSpeedChange,
  onLanguageChange,
  onPreviousChapter,
  onNextChapter,
  onAudioUpload,
}: AudioControlsProps) {
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onAudioUpload) {
      onAudioUpload(file);
      setShowUpload(false);
    }
  };

  const handleSeek = useCallback((position: number) => {
    console.log('Seeking to position:', position, 'Current time:', audioState.currentTime, 'Duration:', audioState.duration);
    onSeek(position);
  }, [onSeek, audioState.currentTime, audioState.duration]);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Progress Bar with Time Display */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{formatTime(audioState.currentTime)}</span>
            <span className="font-medium text-primary">Audio Player</span>
            <span>{formatTime(audioState.duration)}</span>
          </div>
          
          <CustomAudioSlider
            value={audioState.currentTime}
            max={audioState.duration}
            onSeek={handleSeek}
            disabled={audioState.isLoading}
          />
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {/* Chapter Navigation */}
          {onPreviousChapter && (
            <Button
              variant="outline"
              size="lg"
              onClick={onPreviousChapter}
              className="flex flex-col items-center space-y-1 h-auto py-2 px-3"
            >
              <SkipBack className="h-5 w-5" />
              <span className="text-xs">Previous</span>
            </Button>
          )}

          {/* Rewind */}
          <Button
            variant="outline"
            size="lg"
            onClick={onRewind}
            className="flex flex-col items-center space-y-1 h-auto py-2 px-3"
          >
            <RotateCcw className="h-5 w-5" />
            <span className="text-xs">15s Back</span>
          </Button>

          {/* Play/Pause */}
          <Button
            onClick={onPlayPause}
            disabled={audioState.isLoading}
            size="lg"
            className="flex flex-col items-center space-y-1 h-auto py-3 px-6 bg-primary hover:bg-primary/90"
          >
            {audioState.isLoading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : audioState.isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
            <span className="text-xs font-medium">
              {audioState.isLoading ? 'Loading...' : audioState.isPlaying ? 'Pause' : 'Play'}
            </span>
          </Button>

          {/* Forward */}
          <Button
            variant="outline"
            size="lg"
            onClick={onForward}
            className="flex flex-col items-center space-y-1 h-auto py-2 px-3"
          >
            <RotateCw className="h-5 w-5" />
            <span className="text-xs">15s Forward</span>
          </Button>

          {/* Chapter Navigation */}
          {onNextChapter && (
            <Button
              variant="outline"
              size="lg"
              onClick={onNextChapter}
              className="flex flex-col items-center space-y-1 h-auto py-2 px-3"
            >
              <SkipForward className="h-5 w-5" />
              <span className="text-xs">Next</span>
            </Button>
          )}
        </div>

        {/* Secondary Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Playback Speed */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <Volume2 className="h-4 w-4" />
              <span>Speed</span>
            </Label>
            <Select 
              value={audioState.playbackRate.toString()} 
              onValueChange={(value) => onSpeedChange(parseFloat(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {playbackSpeeds.map(speed => (
                  <SelectItem key={speed} value={speed.toString()}>
                    {speed}x {speed === 1 ? '(Normal)' : speed < 1 ? '(Slower)' : '(Faster)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <Headphones className="h-4 w-4" />
              <span>Language</span>
            </Label>
            <Select 
              value={currentLanguage} 
              onValueChange={(value) => onLanguageChange(value as LanguageCode)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="st">Sesotho</SelectItem>
                <SelectItem value="zu">Zulu</SelectItem>
                <SelectItem value="ve">Venda</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Audio Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Your Audio</span>
            </Label>
            <Button 
              variant="outline" 
              onClick={() => setShowUpload(!showUpload)}
              className="w-full justify-start"
            >
              {audioState.hasCustomAudio ? 'Custom Audio Loaded' : 'Upload Your Narration'}
            </Button>
          </div>
        </div>

        {/* Upload Interface */}
        {showUpload && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <div className="space-y-3">
              <Label htmlFor="audio-upload" className="text-sm font-medium">
                Upload your own narration for this story
              </Label>
              <Input
                id="audio-upload"
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Supported formats: MP3, WAV, M4A, OGG</p>
                <p>• Your upload will be saved for this specific story</p>
                <p>• High-quality audio recommended for best experience</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {audioState.hasCustomAudio && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-700">
              <Headphones className="h-4 w-4" />
              <span className="text-sm font-medium">
                Playing your custom narration
              </span>
            </div>
          </div>
        )}

        {audioState.isLoading && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-700">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span className="text-sm">
                Loading audio with Maya Angelou-inspired voice...
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}