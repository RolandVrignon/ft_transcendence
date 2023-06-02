FROM debian:buster

RUN apt update
RUN apt upgrade -y
RUN apt install nodejs npm openssl curl netcat postgresql-client -y

RUN openssl req -newkey rsa:4096 -nodes -keyout /etc/ssl/private/backend.key -x509 -days 365 -out /etc/ssl/certs/backend.cert -subj "/C=FR/ST=France/L=Paris/O=42 Paris/OU=Student/CN=localhost/emailAddress=oboutarf@student.42.fr"

WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm install -g n
RUN n 14
RUN npm install
RUN npm ci; \
	npm install -g nodemon; \
	npm install prisma --save-dev
RUN npm install webpack --save-dev; \
	npx prisma migrate dev --name initial; \
	npm run build
EXPOSE 8080
RUN chmod 777 ./init_psql.sh

CMD ["sh", "./init_psql.sh"]
