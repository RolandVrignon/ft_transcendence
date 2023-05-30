# Étape 1: Préparer l'environnement de build
FROM debian:buster

# RUN apt update
# RUN echo yes | apt upgrade
# RUN echo yes | apt install openssl npm nodejs curl

# COPY . /app

# WORKDIR /app
# RUN npm install -g serve
# RUN npm install -g n
# RUN n 14
# RUN npm install; \
#     npm run build

# EXPOSE 3000
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
RUN apk add --update --no-cache openssl
RUN openssl req -newkey rsa:4096 -nodes -keyout /etc/ssl/private/key.key -x509 -days 365 -out /etc/ssl/certs/certificate.cert -subj "/C=FR/ST=France/L=Paris/O=42 Paris/OU=Student/CN=localhost/emailAddress=oboutarf@student.42.fr"

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de build depuis l'étape précédente
COPY --from=build /app/build /app

# Exposer le port sur lequel le serveur HTTP écoutera
EXPOSE 3000

CMD ["serve", "-s", "/app", "--ssl-cert", "/etc/ssl/certs/certificate.cert", "--ssl-key", "/etc/ssl/private/key.key", "--listen", "3000"]