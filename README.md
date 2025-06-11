# Flow - Réseau Social Moderne

Flow est une plateforme de réseau social moderne construite avec Next.js, offrant une expérience similaire à Twitter avec des fonctionnalités avancées comme les stories, la messagerie en temps réel, et un système de premium.

![Flow Logo](public/logo_Flow.png)

## 🚀 Fonctionnalités

### ✨ Fonctionnalités Principales
- **Publications (Tweets)** - Partagez vos pensées avec texte, images et vidéos
- **Système de commentaires** - Répondez et engagez-vous avec la communauté
- **Stories temporaires** - Partagez des moments éphémères (24h)
- **Messagerie privée** - Conversations en temps réel entre utilisateurs
- **Système de suivi** - Suivez vos utilisateurs préférés
- **Notifications en temps réel** - Restez informé des interactions
- **Hashtags et mentions** - Organisez et taguez vos contenus
- **Mode sombre/clair** - Interface adaptative

### 💎 Fonctionnalités Premium
- **Tweets illimités** - Plus de limite quotidienne
- **Badge certifié** - Statut premium visible
- **Fonctionnalités exclusives** - Accès anticipé aux nouvelles features

### 🔐 Authentification
- **Connexion classique** - Email/mot de passe
- **Profils personnalisables** - Photos de profil et bannières

## 🛠️ Technologies Utilisées

- **Frontend**: Next.js 15, TypeScript
- **Styling**: Tailwind CSS, Mode sombre
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **Stockage**: Supabase Storage
- **Paiements**: Stripe (Premium)
- **Temps réel**: Supabase Realtime
- **Déploiement**: Vercel

## 📦 Installation

### Prérequis
- Node.js 18+ 
- npm, yarn, pnpm ou bun
- Compte Supabase
- Compte Stripe (pour les paiements)

### Configuration

1. **Cloner le repository**
```bash
git clone https://github.com/LouisMbc/twitter-like.git
cd twitter-like
```

2. **Installation des dépendances**

Choisissez votre gestionnaire de packages préféré :

**Avec npm :**
```bash
npm install
```

**Avec yarn :**
```bash
yarn install
```

**Avec pnpm :**
```bash
pnpm install
```

**Avec bun :**
```bash
bun install
```

> ⚠️ **Important** : Assurez-vous d'utiliser le même gestionnaire de packages tout au long du projet pour éviter les conflits.

**Vérifier l'installation :**
```bash
# Vérifier que toutes les dépendances sont installées
npm list --depth=0
# ou
yarn list --depth=0
```

3. **Variables d'environnement**
Créez un fichier `.env.local` :
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_publique
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service

# Stripe
STRIPE_SECRET_KEY=votre_cle_secrete_stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=votre_cle_publique_stripe
STRIPE_PREMIUM_PRICE_ID=votre_price_id_premium

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Configuration Supabase**
- Créez un nouveau projet Supabase
- Configurez les tables nécessaires (Profile, Tweets, Comments, etc.)
- Activez l'authentification et les providers OAuth
- Configurez les buckets de stockage

## 🚀 Démarrage

### Développement
```bash
npm run dev
```
Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Build de production
```bash
npm run build
npm start
```

## 📁 Structure du Projet

```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── auth/              # Pages d'authentification
│   ├── dashboard/         # Tableau de bord principal
│   ├── profile/           # Gestion des profils
│   ├── messages/          # Messagerie
│   ├── tweets/            # Gestion des tweets
│   └── premium/           # Fonctionnalités premium
├── components/            # Composants réutilisables
│   ├── shared/           # Composants partagés
│   ├── tweets/           # Composants liés aux tweets
│   ├── profile/          # Composants de profil
│   ├── stories/          # Composants des stories
│   └── comments/         # Système de commentaires
├── hooks/                # Hooks React personnalisés
├── services/             # Services et API
│   └── supabase/        # Client et services Supabase
├── lib/                  # Utilitaires et configuration
└── types/               # Définitions TypeScript
```

## 🔧 Scripts Disponibles

- `npm run dev` - Mode développement
- `npm run build` - Build de production
- `npm run start` - Serveur de production
- `npm run lint` - Vérification du code

## 🌟 Fonctionnalités Techniques

### Temps Réel
- Notifications instantanées
- Messages en direct
- Mise à jour des compteurs

### Performance
- Optimisation des images avec Next.js
- Lazy loading des composants
- Cache intelligent

### Sécurité
- Authentification sécurisée
- Protection CSRF
- Validation des données côté serveur

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request


## 👥 Équipe de Développement

Flow a été créé par une équipe de développeurs passionnés :

- **Ismail Abou-zaid** - Développeur Frontend
- **Paul Bellanger** - 
- **Alexandre Peltier** - Concepteur de la maquette (Figma) 
- **Louis Malbec** - [LouisMbc](https://github.com/LouisMbc) - Développeur Backend

## 📞 Support

Pour toute question ou problème :
- Ouvrez une [issue](https://github.com/LouisMbc/twitter-like/issues)
- Contactez l'équipe de développement

## 🔄 Mises à Jour

Consultez les [releases](https://github.com/LouisMbc/twitter-like/releases) pour les dernières mises à jour et changements.

---

**Flow** - Connectez-vous aux conversations qui comptent vraiment. 🌊