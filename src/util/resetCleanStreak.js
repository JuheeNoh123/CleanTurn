// utils/resetCleanStreak.js
const { redisClient } = require('../util/redis');

const resetCleanStreak = async () => {
  try {
    const keys = await redisClient.keys('clean:streak:*');
    if (keys.length > 0) {
      await redisClient.del(...keys);
      console.log(`🧹 Redis 초기화: ${keys.length}개의 clean:streak 키 삭제됨`);
    } else {
      console.log(`🧹 Redis 초기화: 삭제할 clean:streak 키 없음`);
    }
  } catch (error) {
    console.error('Redis 초기화 중 오류 발생:', error);
  }
};

module.exports = resetCleanStreak;
