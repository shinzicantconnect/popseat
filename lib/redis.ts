import { Redis } from '@upstash/redis' // Redis is a fast, in-memory key-value database that is often used for caching

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!, // UPSTASH_REDIS_REST_URL is the URL of the Redis database
  token: process.env.UPSTASH_REDIS_REST_TOKEN!, // UPSTASH_REDIS_REST_TOKEN is the token of the Redis database
})