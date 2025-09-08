import { useState, useEffect, useRef, useCallback } from "react";
import { TextToSpeechEngine, type AudioState } from "@/lib/audio";
import type { LanguageCode } from "@/lib/translation";

export function useAudio() {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0, // Will be set based on text length
    playbackRate: 1,
    isLoading: false,
  });

  const engineRef = useRef<TextToSpeechEngine | null>(null);

  useEffect(() => {
    engineRef.current = new TextToSpeechEngine((state) => {
      setAudioState(prev => ({ ...prev, ...state }));
    });

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, []);

  const loadText = useCallback(async (text: string, language: LanguageCode = 'en') => {
    if (engineRef.current) {
      setAudioState(prev => ({ ...prev, isLoading: true }));
      await engineRef.current.loadText(text, language);
      setAudioState(prev => ({ ...prev, currentTime: 0 }));
    }
  }, []);

  const loadCustomAudio = useCallback(async (audioFile: File) => {
    if (engineRef.current) {
      await engineRef.current.loadCustomAudio(audioFile);
    }
  }, []);

  const play = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.play();
    }
  }, []);

  const pause = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (audioState.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [audioState.isPlaying, play, pause]);

  const setPlaybackRate = useCallback((rate: number) => {
    if (engineRef.current) {
      engineRef.current.setPlaybackRate(rate);
    }
  }, []);

  const seekTo = useCallback((position: number) => {
    if (engineRef.current) {
      engineRef.current.seekTo(position);
    }
  }, []);

  const rewind = useCallback((seconds: number = 15) => {
    const newPosition = Math.max(0, audioState.currentTime - seconds);
    seekTo(newPosition);
  }, [audioState.currentTime, seekTo]);

  const forward = useCallback((seconds: number = 15) => {
    const newPosition = Math.min(audioState.duration, audioState.currentTime + seconds);
    seekTo(newPosition);
  }, [audioState.currentTime, audioState.duration, seekTo]);

  return {
    audioState,
    loadText,
    loadCustomAudio,
    play,
    pause,
    stop,
    togglePlayPause,
    setPlaybackRate,
    seekTo,
    rewind,
    forward,
  };
}
