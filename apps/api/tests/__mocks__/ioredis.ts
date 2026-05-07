// ioredis mock for tests — maps all 'ioredis' imports to ioredis-mock
// Must use require() since ioredis-mock uses CommonJS default export
const RedisMock = require('ioredis-mock');
module.exports = RedisMock;
module.exports.default = RedisMock;
module.exports.Redis = RedisMock;
