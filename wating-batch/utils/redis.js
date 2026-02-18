const redis = require('ioredis');

const redisClient = new redis({
  host: 'localhost',
  port: 6379,
});

module.exports = redisClient;