import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
  src?: string;
  name?: string;
  handle?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  shape?: 'circle' | 'rounded';
  ringColor?: string;
  showStatus?: boolean;
  status?: string;
  statusColor?: string;
  onClick?: () => void;
  title?: string;
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-14 h-14 text-lg font-bold',
  '2xl': 'w-16 h-16 text-xl font-bold',
};

const GRADIENTS = [
  'from-cyan-500 to-blue-600',
  'from-indigo-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-sky-500 to-indigo-600',
];

function getInitials(name?: string, handle?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (handle && handle.trim()) {
    return handle.replace(/^@/, '').slice(0, 2).toUpperCase();
  }
  return 'DP';
}

function getGradientForString(str?: string): string {
  if (!str) return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  handle,
  size = 'md',
  className = '',
  shape = 'rounded',
  ringColor,
  showStatus = false,
  status,
  statusColor = 'bg-emerald-400',
  onClick,
  title,
}) => {
  const [imgErrorCount, setImgErrorCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);

  const cleanHandle = (handle || '').trim().replace(/^@/, '');
  const ghFallback = cleanHandle ? `https://github.com/${cleanHandle}.png` : undefined;

  useEffect(() => {
    setCurrentSrc(src || ghFallback);
    setImgErrorCount(0);
  }, [src, ghFallback]);

  const handleError = () => {
    if (imgErrorCount === 0 && ghFallback && currentSrc !== ghFallback) {
      // Try GitHub fallback once
      setCurrentSrc(ghFallback);
      setImgErrorCount(1);
    } else {
      // Fallback to stylized SVG initials
      setCurrentSrc(undefined);
      setImgErrorCount(2);
    }
  };

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';
  const ringClass = ringColor ? ringColor : 'ring-1 ring-cyan-500/30';
  const initials = getInitials(name, handle);
  const gradientClass = getGradientForString(name || handle || 'DevPulse');

  return (
    <div 
      className={`relative inline-flex shrink-0 select-none ${className}`}
      onClick={onClick}
      title={title || name || handle}
    >
      {currentSrc && imgErrorCount < 2 ? (
        <img
          src={currentSrc}
          alt={name || handle || 'Avatar'}
          className={`${sizeClass} ${shapeClass} object-cover ${ringClass} bg-slate-900 shadow-md transition-all`}
          referrerPolicy="no-referrer"
          onError={handleError}
          loading="lazy"
        />
      ) : (
        <div 
          className={`${sizeClass} ${shapeClass} ${ringClass} bg-gradient-to-br ${gradientClass} text-white flex items-center justify-center font-mono tracking-wider shadow-md`}
        >
          <span>{initials}</span>
        </div>
      )}

      {showStatus && (
        <span 
          className={`absolute -bottom-0.5 -right-0.5 ${size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3.5 h-3.5'} rounded-full ${statusColor} ring-2 ring-slate-950 flex items-center justify-center`}
          title={status || 'Active'}
        >
          {size !== 'xs' && size !== 'sm' && (
            <span className="w-1 h-1 rounded-full bg-white opacity-80" />
          )}
        </span>
      )}
    </div>
  );
};
