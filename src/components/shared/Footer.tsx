import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black/50 backdrop-blur-sm border-t border-gray-800/50 py-6 text-sm text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-1">
          <Link href="/about" className="mx-3 hover:underline text-gray-400 hover:text-white transition-colors duration-200">À propos</Link>
          <Link href="/help" className="mx-3 hover:underline text-gray-400 hover:text-white transition-colors duration-200">Centre d'assistance</Link>
          <Link href="/terms" className="mx-3 hover:underline text-gray-400 hover:text-white transition-colors duration-200">Conditions d'utilisation</Link>
          <Link href="/privacy" className="mx-3 hover:underline text-gray-400 hover:text-white transition-colors duration-200">Politique de confidentialité</Link>
          <Link href="/cookies" className="mx-3 hover:underline text-gray-400 hover:text-white transition-colors duration-200">Cookies</Link>
          <Link href="/accessibility" className="mx-3 hover:underline text-gray-400 hover:text-white transition-colors duration-200">Accessibilité</Link>
        </div>
        <div className="text-center mt-4 text-gray-500">
          © {new Date().getFullYear()} Flow - Tous droits réservés
        </div>
      </div>
    </footer>
  );
}
