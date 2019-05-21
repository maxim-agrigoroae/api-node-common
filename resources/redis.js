/**
 * Redis resource
 */
const config = require('config');
const Redis = require('ioredis');

const redis = new Redis(config.redis);

module.exports = {
  create(key, value, expireAt) {
    if (expireAt) {
      const TODAY = new Date();
      const ms = Math.round(Math.abs(expireAt.getTime() - TODAY.getTime()) / 1000);
      return redis.set(key, JSON.stringify(value), 'ex', ms);
    }

    return redis.set(key, JSON.stringify(value));
  },

  get(key) {
    return redis.get(key)
      .then(value => JSON.parse(value));
  },

  delete(key) {
    return redis.del(key);
  },
};
