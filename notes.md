# Command run db

docker run --name JustSmileDB -p 5452:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=justsmile -d postgis/postgis

# Retireve env variables 

docker exec JustSmileDB env
