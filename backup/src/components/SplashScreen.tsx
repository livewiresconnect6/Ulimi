import { useEffect } from "react";
import { motion } from "framer-motion";
import coverImage from "@assets/Asset 17@100x-100_1749743298499.jpg";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    // Auto-transition to auth screen after 2.5 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <img 
          src={coverImage} 
          alt="Ulimi" 
          className="w-[450px] h-[450px] md:w-[600px] md:h-[600px] lg:w-[700px] lg:h-[700px] object-contain"
        />
      </motion.div>
    </div>
  );
}