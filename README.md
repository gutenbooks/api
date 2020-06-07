# Gutenbooks API

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Index

- [Dev Setup](#dev-setup)
- [Console Commands](#console-commands)
- [Release](#release)
- [Build Process](#build-process)
- [Running in Production](#running-in-production)

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

## Release

The standard release command for this project is:

```
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease | from-git]
```

This command will:

1. Generate/update the Changelog
1. Bump the package version
1. Tag & pushing the commit

e.g.

```
npm version 1.2.17
npm version patch // 1.2.17 -> 1.2.18
```

## Build Process

This project has a build production build pipeline which will build a docker image and push it to the [official Gutenbooks registry](https://hub.docker.com/r/gutenbooks/api).

The build will be triggered whenever a tagged commit is pushed to the `master` branch. The `gutenbooks/api` image will then be built and pushed with the `latest` tag in addition to whatever tag is associated with the commit.

## Running In Production

If you'd like to run the Gutenbooks API, it's recommended that you use [our official docker image](https://hub.docker.com/r/gutenbooks/api). You can also checkout the `docker-compose.prod.yml` file in [the mono repo](https://gitlab.com/gutenbooks/gutenbooks) for an example of how to stick the API behind an Nginx proxy for SSL & Caching.
