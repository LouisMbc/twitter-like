import Image from 'next/image';
import { useEffect, useState } from 'react';
import styles from './loader.module.css';
// Utilisez une image qui existe vraiment dans votre dossier public
import logo from '/public/logo_Flow.png'; 

export default function LogoLoader() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prevProgress + 1;
      });
    }, 30); // Ajustez la vitesse selon vos préférences
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.loaderContainer}>
      {/* Background circle */}
      <div className={styles.progressCircleBg}></div>
      
      {/* Cercle de chargement rouge */}
      <div 
        className={styles.progressCircle}
        style={{ 
          background: `conic-gradient(#ff3333 ${progress}%, transparent ${progress}%)`
        }}
      ></div>
      
      {/* Halo lumineux */}
      <div className={styles.halo}></div>
      
      {/* Élément de rotation inverse */}
      <div className={styles.reverseRotation}></div>
      
      {/* Lignes futuristes */}
      <div className={styles.futuristicLines}>
        <div className={`${styles.line} ${styles.horizontalLine}`}></div>
        <div className={`${styles.line} ${styles.verticalLine}`}></div>
      </div>
      
      {/* Logo avec effet de pulsation */}
      <div className={styles.logoWrapper}>
        <Image 
          src={logo}
          alt="Logo"
          width={80}
          height={80}
          className={styles.logo}
          priority
        />
      </div>
      
      {/* <div className={styles.loadingText}>Chargement...</div> */}
    </div>
  );
}