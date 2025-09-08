import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, Check, Move, ZoomIn, ZoomOut } from "lucide-react";

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
  aspectRatio?: number; // width/height ratio
  cropSize?: { width: number; height: number };
}

export function ImageCropper({ 
  image, 
  onCropComplete, 
  onCancel, 
  aspectRatio = 1,
  cropSize = { width: 200, height: 200 }
}: ImageCropperProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      
      // Center the image initially
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const imgRect = img.getBoundingClientRect();
        setPosition({
          x: (containerRect.width - imgRect.width) / 2,
          y: (containerRect.height - imgRect.height) / 2
        });
      }
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleZoomChange = useCallback((newScale: number[]) => {
    setScale(newScale[0]);
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    handleImageLoad();
  }, [handleImageLoad]);

  const handleApplyCrop = useCallback(() => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    // Set canvas size
    canvas.width = cropSize.width;
    canvas.height = cropSize.height;

    // Calculate crop area
    const imgRect = img.getBoundingClientRect();
    const containerCenterX = containerRect.width / 2;
    const containerCenterY = containerRect.height / 2;
    
    const cropX = containerCenterX - cropSize.width / 2;
    const cropY = containerCenterY - cropSize.height / 2;
    
    // Calculate source coordinates relative to original image
    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;
    
    const sourceX = (cropX - position.x) * scaleX;
    const sourceY = (cropY - position.y) * scaleY;
    const sourceWidth = cropSize.width * scaleX;
    const sourceHeight = cropSize.height * scaleY;

    // Draw cropped image
    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, cropSize.width, cropSize.height
    );

    // Convert to blob and return
    canvas.toBlob((blob) => {
      if (blob) {
        const reader = new FileReader();
        reader.onload = () => {
          onCropComplete(reader.result as string);
        };
        reader.readAsDataURL(blob);
      }
    }, 'image/jpeg', 0.9);
  }, [position, scale, cropSize, onCropComplete]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Move className="w-5 h-5" />
          Crop Image
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Crop Preview Container */}
        <div 
          ref={containerRef}
          className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Image */}
          <img
            ref={imageRef}
            src={image}
            alt="Crop preview"
            className="absolute cursor-move select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'top left'
            }}
            onLoad={handleImageLoad}
            onMouseDown={handleMouseDown}
            draggable={false}
          />
          
          {/* Crop Overlay */}
          <div 
            className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              width: cropSize.width,
              height: cropSize.height,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Crop corners */}
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
          </div>
        </div>

        {/* Zoom Control */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ZoomOut className="w-4 h-4" />
            <Slider
              value={[scale]}
              onValueChange={handleZoomChange}
              min={0.5}
              max={3}
              step={0.1}
              className="flex-1"
            />
            <ZoomIn className="w-4 h-4" />
            <span className="text-sm font-medium min-w-12">{Math.round(scale * 100)}%</span>
          </div>
          <p className="text-xs text-gray-500">
            Drag the image to position it, use the slider to zoom
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApplyCrop}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Apply Crop
          </Button>
        </div>

        {/* Hidden canvas for cropping */}
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}