# DevAtHome

## Description
DevAtHome est un projet conçu pour aider les utilisateurs à développer leurs pellicules à la maison en toute simplicité. Ce site web fournit des ressources, des guides pratiques, et des outils interactifs pour accompagner les passionnés de photographie argentique dans leurs projets de développement photo.

## Objectif
Mon objectif principal avec ce projet est de démocratiser le développement de pellicules chez soi. DevAtHome s'adresse autant aux débutants qu'aux amateurs expérimentés qui souhaitent explorer ou perfectionner leurs techniques de développement à domicile.

## Fonctionnalités principales
- **Guides interactifs** : Étapes détaillées pour développer différentes pellicules (noir et blanc, couleur, etc.).
- **Calculateur de chimie** : Un outil pour ajuster facilement les quantités de chimie en fonction du volume requis.
- **Blog** : Articles sur les techniques, astuces et équipements recommandés.
- **FAQ** : Réponses aux questions courantes sur le développement de pellicules.

## Technologies utilisées
DevAtHome est construit avec les technologies modernes pour assurer une expérience utilisateur optimale :

- **Front-end** :
  - React.js pour une interface utilisateur dynamique et réactive.
  - Tailwind CSS pour un design moderne et personnalisable.

- **Back-end** :
  - Node.js pour gérer les requêtes serveur.
  - Prisma ORM pour une gestion efficace et intuitive de la base de données.

- **Base de données** :
  - PostgreSQL pour stocker les données utilisateur et les contenus du site.

- **Autres outils** :
  - Git pour le contrôle de version.
  - Docker pour une conteneurisation et un déploiement simplifiés.

## Installation
Suivez ces étapes pour exécuter le projet en local :

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/votre-utilisateur/devathome.git
   ```
2. Accédez au répertoire du projet :
   ```bash
   cd devathome
   ```
3. Installez les dépendances :
   ```bash
   npm install
   ```
4. Configurez les variables d'environnement dans un fichier `.env` (voir le fichier `.env.example` pour les champs requis).
5. Exécutez la base de données avec Prisma :
   ```bash
   npx prisma migrate dev
   ```
6. Lancez le serveur :
   ```bash
   npm run dev
   ```

## Contribuer
Les contributions sont les bienvenues ! Si vous souhaitez améliorer DevAtHome, suivez les étapes suivantes :

1. Forkez le projet.
2. Créez une nouvelle branche :
   ```bash
   git checkout -b ma-fonctionnalite
   ```
3. Faites vos modifications et ajoutez un commit :
   ```bash
   git commit -m "Ajout d'une nouvelle fonctionnalité"
   ```
4. Poussez vos modifications :
   ```bash
   git push origin ma-fonctionnalite
   ```
5. Créez une pull request sur le dépôt principal.

## Licence
Ce projet est sous licence MIT. Vous êtes libre de l'utiliser, le modifier et le distribuer.

## Contact
Pour toute question ou suggestion, n'hésitez pas à me contacter via Github.

Merci d'utiliser DevAtHome et bon développement photo !

