COMPOSE_PATH = srcs/docker-compose.yml

all:
	docker-compose --file srcs/docker-compose.yml up --build
	
down:
	pm2 delete all 
	docker-compose -f $(COMPOSE_PATH) down

clean:
	docker-compose -f $(COMPOSE_PATH) down
	docker system prune -af

fclean:
	make clean

re:
	make fclean 
	make all