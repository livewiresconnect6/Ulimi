import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload, X } from "lucide-react";
import { ImageCropper } from "./ImageCropper";
import { useToast } from "@/hooks/use-toast";

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null;
  onPhotoUpdate: (newPhotoUrl: string) => void;
  userName?: string;
  size?: "sm" | "md" | "lg";
}

export function ProfilePhotoUpload({ 
  currentPhotoUrl, 
  onPhotoUpdate, 
  userName = "User",
  size = "lg"
}: ProfilePhotoUploadProps) {
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24", 
    lg: "w-32 h-32"
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImageData: string) => {
    try {
      setIsUploading(true);
      
      // Simulate upload delay (replace with actual upload logic)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would upload to Firebase Storage or similar
      // For now, we'll use the cropped data URL directly
      onPhotoUpdate(croppedImageData);
      
      setShowCropper(false);
      setSelectedImage(null);
      
      toast({
        title: "Photo updated",
        description: "Your profile photo has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to update profile photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedImage(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    onPhotoUpdate('');
    toast({
      title: "Photo removed",
      description: "Your profile photo has been removed",
    });
  };

  if (showCropper && selectedImage) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <ImageCropper
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
          cropSize={{ width: 200, height: 200 }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Display */}
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={currentPhotoUrl || undefined} />
          <AvatarFallback className="bg-primary text-white text-xl font-semibold">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {/* Camera Button Overlay */}
        <Button
          size="sm"
          variant="outline"
          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 bg-white border-2 border-white shadow-lg hover:bg-gray-50"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {currentPhotoUrl ? 'Change Photo' : 'Upload Photo'}
        </Button>
        
        {currentPhotoUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemovePhoto}
            disabled={isUploading}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
            Remove
          </Button>
        )}
      </div>

      {/* Upload Status */}
      {isUploading && (
        <p className="text-sm text-gray-500">Uploading photo...</p>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}