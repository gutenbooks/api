# Gutenbooks API


## Dev Setup

#### Spin Up Containers & DB

```
docker-compose up
```

#### Run Migrations & Seed DB

```
docker-compose exec api npm run typeorm -- migration:run
docker-compose exec api npm run console -- seed all
```
