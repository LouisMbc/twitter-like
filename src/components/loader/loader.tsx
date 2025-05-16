import Image from 'next/image';
import { useEffect, useState } from 'react';
import styles from './loader.module.css';
// Utilisez une image qui existe vraiment dans votre dossier public
import logo from '/public/Capture_d_écran_du_2025-05-15_11-40-36-removebg-preview.png'; 

interface LogoLoaderProps {
  size?: string; // Rendre la prop optionnelle
}

export default function LogoLoader({ size = "medium" }: LogoLoaderProps) {
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

  // Définir des tailles différentes en fonction de la prop
  const getLoaderSize = () => {
    switch(size) {
      case "small":
        return "w-6 h-6";
      case "large":
        return "w-12 h-12";
      default:
        return "w-8 h-8"; // medium par défaut
    }
  };

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