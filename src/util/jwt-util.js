//JWT 관련 유틸
require('dotenv').config(); 
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { redisClient } = require('./redis');
const accessSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshSecret = process.env.REFRESH_TOKEN_SECRET;



module.exports = {
  sign: (user) => { // access token 발급
    const payload = { // access token에 들어갈 payload
      id: user.id,
      email: user.email,
    };

    return jwt.sign(payload, accessSecret, { // secret으로 sign하여 발급하고 return
      algorithm: 'HS256', // 암호화 알고리즘
      expiresIn: '1h', 	  // 유효기간
    });
  },
  verify: (token) => { // access token 검증
    let decoded = null;
    try {
      decoded = jwt.verify(token, accessSecret);
      return {
        ok: true,
        id: decoded.id,
        email: decoded.email,
      };
    } catch (err) {
      return {
        ok: false,
        message: err.message,
      };
    }
  },
  refresh: () => { // refresh token 발급
    return jwt.sign({}, refreshSecret, { // refresh token은 payload 없이 발급
      algorithm: 'HS256',
      expiresIn: '1d',
    });
  },
  refreshVerify: async (token, userId) => { // refresh token 검증
    /* redis 모듈은 기본적으로 promise를 반환하지 않으므로,
       promisify를 이용하여 promise를 반환하게 해줍니다.*/
    
    console.log(userId);
    try {
      const data = await redisClient.get(String(userId));
      console.log("data",data);
      if (token === data) {
        try {
          jwt.verify(token, refreshSecret);
          return true;
        } catch (err) {
          return false;
        }
      } else {
        return false;
      }
    } catch (err) {
      console.error('Redis get error:', err);
      return false;
    }
  },
};