#!/bin/bash

mkdir -p requirements/https

openssl req -newkey rsa:4096 -nodes -keyout \
    ./requirements/https/key.key -x509 -days 365 \
    -out ./requirements/https/certificate.cert \
    -subj "/C=FR/ST=France/L=Paris/O=42 \
    Paris/OU=Student/CN=localhost/emailAddress=oboutarf@student.42.fr"

cp -r ./requirements/https ./requirements/back/
cp -r ./requirements/https ./requirements/front/

rm -rf ./requirements/https