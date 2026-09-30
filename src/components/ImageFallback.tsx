import React, { useState, useEffect } from 'react';
import { PackageOpen, AlertCircle } from 'lucide-react';
import { getCategoryFallbackSvg } from '../utils/formatters';

interface ImageFallbackProps {
  src?: string | null;
  alt: string;
  category?: string;
  code?: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string;
  onClick?: () => void;
  lazy?: boolean;
}

export const ImageFallback: React.FC<ImageFallbackProps> = ({
  src,
  alt,
  category = 'Repuestos',
  code = '',
  className = 'w-auto h-auto max-w-full max-h-full object-contain',
  containerClassName = 'relative w-full h-full flex items-center justify-center overflow-hidden',
  onClick,
  lazy = true,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Normalize source
  const validSrc = (src && typeof src === 'string' && src.trim().length > 0) ? src.trim() : null;

  // Reset states when src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(!validSrc);
  }, [validSrc]);

  // Fallback SVG data URI generated dynamically based on category & code
  const fallbackSvgUrl = getCategoryFallbackSvg(category, code);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // If no source provided initially or error occurred, render fallback
  const displaySrc = (!hasError && validSrc) ? validSrc : fallbackSvgUrl;
  const isUsingFallback = hasError || !validSrc;

  return (
    <div 
      className={`${containerClassName} select-none`}
      onClick={onClick}
    >
      {/* Subtle loading skeleton pulse while loading real image */}
      {isLoading && validSrc && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200/60 to-slate-100 animate-pulse flex items-center justify-center z-1"
          aria-hidden="true"
        >
          <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-red-600 animate-spin opacity-50" />
        </div>
      )}

      <img
        src={displaySrc}
        alt={alt}
        referrerPolicy="no-referrer"
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`${className} transition-all duration-300 ${
          isLoading && validSrc ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        } ${isUsingFallback ? 'drop-shadow-none' : 'drop-shadow-sm'}`}
      />

      {/* Technical badge when using generated schematic fallback */}
      {isUsingFallback && (
        <span className="sr-only">Imagen ilustrativa técnica de repuesto</span>
      )}
    </div>
  );
};

export default ImageFallback;
