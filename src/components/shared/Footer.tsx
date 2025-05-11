import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 py-4 text-sm text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center">
          <Link href="/about" className="mx-2 hover:underline text-gray-300 hover:text-white">À propos</Link>
          <Link href="/help" className="mx-2 hover:underline text-gray-300 hover:text-white">Centre d'assistance</Link>
          <Link href="/terms" className="mx-2 hover:underline text-gray-300 hover:text-white">Conditions d'utilisation</Link>
          <Link href="/privacy" className="mx-2 hover:underline text-gray-300 hover:text-white">Politique de confidentialité</Link>
          <Link href="/cookies" className="mx-2 hover:underline text-gray-300 hover:text-white">Politique d'utilisation des cookies</Link>
          <Link href="/accessibility" className="mx-2 hover:underline text-gray-300 hover:text-white">Accessibilité</Link>
        </div>
        <div className="text-center mt-2">
          © {new Date().getFullYear()} Flow - Tous droits réservés
        </div>
      </div>
    </footer>
  );
}
