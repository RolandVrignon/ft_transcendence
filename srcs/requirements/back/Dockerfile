# Utiliser une image Node.js LTS (Long Term Support) comme base
FROM node:14

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci


# Install netcat for our wait-for-it script
RUN apt-get update && apt-get install -y netcat

# Copier le reste des fichiers du projet
COPY . .

# Compiler l'application
RUN npm install webpack --save-dev; \
		npm run build

# Exposer le port sur lequel l'application sera accessible
EXPOSE 8080

# Démarrer l'application
CMD ["npm", "run", "start"]
