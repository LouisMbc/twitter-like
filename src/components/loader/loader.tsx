import Image from 'next/image';
import { useEffect, useState } from 'react';

interface LogoLoaderProps {
  size?: "small" | "medium" | "large";
}

export default function LogoLoader({ size = "medium" }: LogoLoaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12", 
    large: "w-16 h-16"
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin`}>
      <Image
        src="/logo_Flow.png"
        alt="Loading"
        width={size === 'small' ? 32 : size === 'medium' ? 48 : 64}
        height={size === 'small' ? 32 : size === 'medium' ? 48 : 64}
        className="rounded-lg"
      />
    </div>
  );
}