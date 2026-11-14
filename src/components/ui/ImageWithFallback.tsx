import { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className = 'w-full h-48 object-cover',
  fallbackLabel = 'No photograph provided',
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 border-b border-slate-200/70 dark:border-slate-800 text-slate-500 dark:text-slate-400 px-4 text-center ${className}`}
      >
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <ImageOff className="w-5 h-5" />
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
          {fallbackLabel}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
