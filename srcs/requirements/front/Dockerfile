# Étape 1: Préparer l'environnement de build
FROM node:14-alpine as build

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le reste des fichiers du projet
COPY . .

# Compiler l'application
RUN npm run build

# Étape 2: Servir l'application avec un serveur HTTP simple
FROM node:14-alpine

# Installer le serveur HTTP simple (serve)
RUN npm install -g serve

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de build depuis l'étape précédente
COPY --from=build /app/build /app

# Exposer le port sur lequel le serveur HTTP écoutera
EXPOSE 3000

# Démarrer le serveur HTTP
CMD ["serve", "-s", "/app", "-l", "3000"]
