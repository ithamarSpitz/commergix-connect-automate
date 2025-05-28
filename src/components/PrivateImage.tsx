import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PrivateImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

export const PrivateImage = ({ src, alt, className = "", style = {} }: PrivateImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>("/placeholder.svg");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      // If it's not a Supabase URL or doesn't contain "private", use as is
      if (!src || !src.includes("supabase.co") || !src.includes("/private/")) {
        setImageSrc(src);
        setLoading(false);
        return;
      }

      try {
        // Extract the path from the URL
        const pathMatch = src.match(/\/products\/(private\/.*?)($|\?)/);
        if (!pathMatch || !pathMatch[1]) {
          console.error("Could not parse path from URL:", src);
          setError(true);
          setLoading(false);
          return;
        }

        const path = pathMatch[1];
        console.log("Extracted path:", path);

        // Try to download the file using authenticated download
        const { data, error } = await supabase.storage
          .from('products')
          .download(path);

        if (error) {
          console.error("Error downloading image:", error);
          setError(true);
          setLoading(false);
          return;
        }

        // Convert the blob to a data URL we can use directly
        const url = URL.createObjectURL(data);
        setImageSrc(url);
        setError(false);

        // Clean up the object URL when the component unmounts
        return () => URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Error processing private image:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [src]);

  if (loading) {
    return (
      <div 
        className={`${className} bg-gray-100 flex items-center justify-center`} 
        style={{ minHeight: '200px', ...style }}
      >
        <div className="animate-pulse flex space-x-2">
          <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
          <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
          <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`${className} bg-gray-100 flex items-center justify-center`}
        style={{ minHeight: '200px', ...style }}
      >
        <span className="text-gray-500">Failed to load image</span>
      </div>
    );
  }

  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      className={className}
      style={style}
      onError={() => {
        console.error('Image still failed to load:', src);
        setImageSrc('/placeholder.svg');
      }}
    />
  );
};