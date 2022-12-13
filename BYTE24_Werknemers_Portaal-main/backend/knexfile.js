// Update with your config settings.
const path = require('path');
require('dotenv').config({
  path: `${__dirname}/./.env`,
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      database: 'postgres',
      user: 'postgres',
      password: process.env.LOCAL_DB_PASSWORD,
      charset: 'utf8',
    },
    migrations: {
      directory: path.join(__dirname, 'database', 'knex', 'migrations'),
    },
    seeds: {
      directory: path.join(__dirname, 'database', 'knex', 'seeds'),
    },
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    rejectUnauthorized: false,
    ssl: true,
    strictSSL: false,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.join(__dirname, 'database', 'knex', 'migrations'),
    },
    seeds: {
      directory: path.join(__dirname, 'database', 'knex', 'seeds'),
    },
  },
};
