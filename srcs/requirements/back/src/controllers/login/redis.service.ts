const redis = require('redis')
const redisClient = redis.createClient()
// redisClient.on('connect', () => {
//     console.log('Connected to Redis');
// });
// redisClient.on('error', (error) => {
//     console.error('Redis connection error:', error);
// });
export default redisClient
