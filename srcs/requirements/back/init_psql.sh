#!/bin/bash
while ! nc -z database 5432;
    do
        echo 'Waiting for the PostgreSQL Server'
        sleep 1
    done;

echo 'PostgreSQL Server is up - executing command';

npm run start:dev --preserveWatchOutput && npx prisma migrate dev
