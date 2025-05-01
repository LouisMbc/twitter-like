import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 text-sm text-gray-500">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center">
          <Link href="/about" className="mx-2 hover:underline">À propos</Link>
          <Link href="/help" className="mx-2 hover:underline">Centre d'assistance</Link>
          <Link href="/terms" className="mx-2 hover:underline">Conditions d'utilisation</Link>
          <Link href="/privacy" className="mx-2 hover:underline">Politique de confidentialité</Link>
          <Link href="/cookies" className="mx-2 hover:underline">Politique d'utilisation des cookies</Link>
          <Link href="/accessibility" className="mx-2 hover:underline">Accessibilité</Link>
        </div>
        <div className="text-center mt-2">
          © {new Date().getFullYear()} Flow - Tous droits réservés
        </div>
      </div>
    </footer>
  );
}
