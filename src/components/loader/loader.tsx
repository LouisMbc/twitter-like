import Image from 'next/image';
import { useEffect, useState } from 'react';
import styles from './loader.module.css';

interface LogoLoaderProps {
  size?: string;
}

export default function LogoLoader({ size = "medium" }: LogoLoaderProps) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          return 0; // Redémarre l'animation
        }
        return prevProgress + 2; // Animation plus fluide
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.loaderContainer}>
      {/* Effet de fond comme sur auth */}
      <div className={styles.backgroundEffects}>
        <div className={styles.redGlow}></div>
        <div className={styles.blueGlow}></div>
      </div>
      
      {/* Logo avec les mêmes effets que auth */}
      <div className={styles.logoSection}>
        <div className={styles.logoGroup}>
          <div className={styles.logoGradientEffect}></div>
          <Image
            src="/logo_Flow.png"
            alt="Flow Logo"
            width={280}
            height={280}
            priority
            className={styles.authLogo}
          />
        </div>
        
        {/* Cercle de progression autour du logo */}
        <div className={styles.progressCircle}>
          <svg className={styles.progressSvg} viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              className={styles.progressBackground}
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              className={styles.progressBar}
              style={{
                strokeDasharray: `${progress * 2.83} 283`,
              }}
            />
          </svg>
        </div>
      </div>
      
      {/* Texte de chargement */}
      <div className={styles.loadingText}>Chargement...</div>
    </div>
  );
}