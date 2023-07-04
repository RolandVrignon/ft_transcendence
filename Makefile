COMPOSE_PATH = srcs/docker-compose.yml
ENV_PATH = ~/env_ft_transcendence

all:
	if [ ! -f "/src/.env" ]; then \
		cp ${ENV_PATH}/env ./srcs/.env; \
	fi
	if [! -f "/src/requirements/back/.env"]; then \
		cp ${ENV_PATH}/env_back ./srcs/requirements/back/.env; \
	fi
	mkdir -p srcs/requirements/db
	docker compose --file srcs/docker-compose.yml up --build

db:
	docker compose -f $(COMPOSE_PATH) up -d database

front:
	docker compose -f $(COMPOSE_PATH) down
	docker rmi -f srcs-frontend
	docker build -t srcs-frontend srcs/requirements/front/.
	docker compose --file srcs/docker-compose.yml up --build

back:
	docker compose -f $(COMPOSE_PATH) down
	docker rmi -f srcs-backend
	docker build -t srcs-frontend srcs/requirements/back/.
	docker compose --file srcs/docker-compose.yml up --build

down:
	pm2 delete all 
	docker compose -f $(COMPOSE_PATH) down

clean:
	docker compose -f $(COMPOSE_PATH) down
	docker system prune -af

fclean:
	make clean

re:
	make fclean 
	make all

.PHONY: all db front back down clean fclean re
