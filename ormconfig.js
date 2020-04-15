const strategies = require('typeorm-naming-strategies');

module.exports = {
  type: 'mariadb',
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  charset: 'utf8mb4',

  entities: [
    `dist/**/*.entity.js`,
  ],
  migrations: [
    `dist/db/migrations/*.js`,
  ],

  synchronize: false,
  namingStrategy: new strategies.SnakeNamingStrategy(),
  cli: {
    entitiesDir: 'src',
    migrationsDir: 'src/db/migrations',
  },
};
