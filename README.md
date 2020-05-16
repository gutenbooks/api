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

## Console Commands

There are a number of data seed process available able as stand-alone console commands. These commands can all be run via `npm run console ...`.

You can see a full list of the commands by running `npm run console`:

```
seed:goodreads  Seed the project DB with Goodreads data
seed:gutenberg  Seed the project DB with Project Gutenberg data
seed            Seed the project DB
```

If you'd like to see the specific options a command has you can execute `npm run console [command name]` and the options will be listed for you. E.g.:

```
/app # npm run console seed

> api@0.0.1 console /app
> node dist/console.js "seed"

Usage: console seed [options] [command]

Seed the project DB

Options:
  -h, --help      display help for command

Commands:
  all             Seed everything in the database
  language        Seed languages in the database
  help [command]  display help for command
```

Note that `npm run console seed all` will execute all the data seed tasks **with the exception** of the Goodreads seed. Goodreads data must be seeded individually. Additionally, before seeding Goodreads data be sure that you've configured the `GOODREADS_API_KEY` env variable.
