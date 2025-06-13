# Flow

Flow est une application Android de type réseau social inspirée de Twitter, permettant de publier, explorer et interagir avec des tweets, de gérer un profil, d'envoyer des messages privés et de recevoir des notifications.

## Fonctionnalités principales
- **Authentification** : Inscription et connexion sécurisées (via Supabase).
- **Fil d'actualité** : Affichage des tweets récents, avec images et hashtags.
- **Recherche** : Explorer les tweets, hashtags et profils.
- **Messagerie** : Envoyer et recevoir des messages privés.
- **Notifications** : Recevoir des alertes pour les interactions importantes.
- **Gestion du profil** : Modifier son profil, voir ses abonnés et abonnements.
- **Premium** : (optionnel) Accès à des fonctionnalités avancées.

## Technologies utilisées
- **Kotlin** (Android)
- **Supabase** (authentification, base de données, stockage)
- **Ktor** (client HTTP)
- **Jetpack** (Navigation, RecyclerView, ConstraintLayout, etc.)
- **Glide** (chargement d'images)

## Installation
1. **Prérequis** :
   - Android Studio (Giraffe ou plus récent recommandé)
   - JDK 21+
2. **Cloner le dépôt** :
   ```sh
   git clone <url-du-repo>
   ```
3. **Ouvrir dans Android Studio** :
   - Sélectionner le dossier `Flow2 tweets+dashboard`.
4. **Configurer Supabase** :
   - Renseigner les clés API et l'URL de votre projet Supabase dans `MyApplication.kt` ou dans un fichier de configuration sécurisé.
5. **Lancer l'application** :
   - Brancher un émulateur ou un appareil Android.
   - Cliquer sur "Run" dans Android Studio.

## Structure du projet
- `app/src/main/java/com/example/flow2/` : Code source principal (fragments, activités, modèles, adaptateurs...)
- `app/src/main/res/` : Ressources (layouts XML, images, couleurs, menus...)
- `build.gradle.kts` et `app/build.gradle.kts` : Configuration Gradle

## Contribution
Les contributions sont les bienvenues !
- Forkez le projet
- Créez une branche (`feature/ma-fonctionnalite`)
- Faites un *pull request* avec une description claire

## Licence
Ce projet est sous licence Apache 2.0.

## Auteurs
- Paul (polow)
- Merci à tous les contributeurs !
