const redis = require('redis');
const { promisifyAll } = require('bluebird');
const chalk = require('chalk');

promisifyAll(redis);

const host = process.env.REDIS_HOST || 'localhost';
const port = process.env.REDIS_PORT || 6379;

const redisClient = redis.createClient({ host, port });

redisClient.on('ready', () => console.log(chalk.red.bold('Reddis client connected!')));

redisClient.on('error', () => console.log(chalk.red.inverse('Reddis client error!')), error);

module.exports = redisClient;
