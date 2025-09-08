import { useState, useRef, useCallback, useEffect } from "react";

interface CustomAudioSliderProps {
  value: number;
  max: number;
  onSeek: (position: number) => void;
  disabled?: boolean;
}

export function CustomAudioSlider({ value, max, onSeek, disabled }: CustomAudioSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Use drag position while dragging, otherwise use actual audio position
  const currentPosition = isDragging ? dragPosition : value;

  const calculatePositionFromEvent = useCallback((event: MouseEvent | React.MouseEvent) => {
    if (!sliderRef.current) return 0;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return percentage * max;
  }, [max]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    setIsDragging(true);
    
    const newValue = calculatePositionFromEvent(event);
    setDragPosition(newValue);
    onSeek(newValue);
    
    console.log('Mouse down - seeking to:', newValue);
  }, [disabled, calculatePositionFromEvent, onSeek]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging) return;
    
    const newValue = calculatePositionFromEvent(event);
    setDragPosition(newValue);
    onSeek(newValue);
    
    console.log('Mouse move - seeking to:', newValue);
  }, [isDragging, calculatePositionFromEvent, onSeek]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      console.log('Mouse up - finished dragging, syncing with audio position');
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const progress = max > 0 ? (currentPosition / max) * 100 : 0;

  return (
    <div className="space-y-2">
      <div 
        ref={sliderRef}
        className={`relative h-2 bg-gray-200 rounded-full cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'
        }`}
        onMouseDown={handleMouseDown}
      >
        {/* Progress bar */}
        <div 
          className="absolute h-full bg-primary rounded-full transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
        
        {/* Thumb */}
        <div 
          className={`absolute w-4 h-4 bg-primary border-2 border-white rounded-full shadow-md transform -translate-y-1 -translate-x-2 transition-all duration-75 ${
            isDragging ? 'scale-125' : 'hover:scale-110'
          }`}
          style={{ left: `${progress}%` }}
        />
      </div>
      
      <div className="text-xs text-center text-gray-400">
        {isDragging ? 'Dragging to position...' : 'Click or drag to jump to any part of the story'}
      </div>
    </div>
  );
}