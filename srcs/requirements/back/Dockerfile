FROM debian:buster

RUN apt update
RUN echo yes | apt upgrade

RUN echo yes | apt install nodejs npm openssl curl netcat

RUN openssl req -newkey rsa:4096 -nodes -keyout /etc/ssl/private/backend.key -x509 -days 365 -out /etc/ssl/certs/backend.cert -subj "/C=FR/ST=France/L=Paris/O=42 Paris/OU=Student/CN=localhost/emailAddress=oboutarf@student.42.fr"

WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm install -g n
RUN n 14
RUN npm install
RUN npm ci
RUN npm install webpack --save-dev; \
		npm run build
EXPOSE 8080

CMD ["npm", "run", "start"]

