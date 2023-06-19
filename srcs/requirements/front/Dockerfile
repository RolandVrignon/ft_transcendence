FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install -g npm
RUN npm install

COPY . .

RUN npm run build

FROM node:14-alpine

# COPY ./https/key.key /etc/ssl/private/
# COPY ./https/certificate.cert /etc/ssl/certs/
# Installer le serveur HTTP simple (serve)
RUN npm install -g serve speakeasy qrcode axios python3
RUN apk add --update --no-cache openssl
# RUN openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout /etc/ssl/private/key.pem -out /etc/ssl/certs/cert.pem -days 365

WORKDIR /app
COPY --from=build /app/build /app

EXPOSE 3000

# CMD ["serve", "-s", "/app", "--ssl-cert", "/etc/ssl/certs/certificate.cert", "--ssl-key", "/etc/ssl/private/key.key", "--listen", "3000"]
CMD ["serve", "-s", "/app", "--listen", "3000"]
