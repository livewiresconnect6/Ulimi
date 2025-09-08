import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  currentImage?: string | null;
  onImageChange: (imageUrl: string) => void;
  label: string;
  className?: string;
  accept?: string;
}

export function ImageUpload({ 
  currentImage, 
  onImageChange, 
  label, 
  className = "",
  accept = "image/*"
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(currentImage || "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        onImageChange(result);
        setUploading(false);
        
        toast({
          title: "Image uploaded successfully",
          description: "Your image has been saved",
        });
      };
      reader.onerror = () => {
        setUploading(false);
        toast({
          title: "Upload failed",
          description: "Failed to process the image",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploading(false);
      toast({
        title: "Upload failed",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  const handleRemove = () => {
    setPreview("");
    onImageChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      <Label className="text-sm font-medium text-gray-700 mb-2 block">
        {label}
      </Label>
      
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-6">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Upload preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <ImageIcon className="h-full w-full" />
              </div>
              <div className="text-sm text-gray-600 mb-4">
                <span className="font-medium">Click to upload</span> or drag and drop
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </div>
          )}
          
          <Input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          
          <Button
            type="button"
            variant="outline"
            className="w-full mt-4"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : preview ? "Change Image" : "Upload Image"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}