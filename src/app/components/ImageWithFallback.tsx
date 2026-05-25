import { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export function ImageWithFallback({ src, alt, className = '', ...props }: ImageWithFallbackProps) {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (imageError) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 ${className}`}>
        <span className="text-xs text-gray-400">{alt}</span>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className={`flex items-center justify-center bg-gray-100 animate-pulse ${className}`} />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'hidden' : ''}`}
        onError={() => setImageError(true)}
        onLoad={() => setLoading(false)}
        {...props}
      />
    </>
  );
}
