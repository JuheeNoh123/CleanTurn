const express = require('express');
const bcrypt = require('bcrypt');// 비밀번호 비교를 위한 bcrypt
const jwtUtil = require('../../util/jwt-util.js'); // JWT 토큰 생성 유틸
const { redisClient } = require('../../util/redis.js'); // Redis 클라이언트

const Member = require('../../models/memberModel.js');

const router = express.Router();

// 로그인 API 엔드포인트
router.post('/', async (req, res) => {
  // 요청 바디에서 이메일과 비밀번호 추출
  const { email, password } = req.body;
  try {
    // DB에서 이메일로 사용자 조회
    const user = await Member.findByEmail(email);
    if (!user) {
      // 사용자 존재하지 않으면 401 Unauthorized 응답
      return res.status(401).send({ ok: false, message: 'email or password is incorrect' });
    }
    // 입력한 비밀번호와 해시된 비밀번호 비교
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // 비밀번호 불일치 시에도 401 응답
      return res.status(401).send({ ok: false, message: 'email or password is incorrect' });
    }
    console.log('login success');

    // JWT Access Token과 Refresh Token 생성
    const accessToken = jwtUtil.sign(user); // 사용자 정보를 바탕으로 Access Token 생성
    const refreshToken = jwtUtil.refresh(); // Refresh Token 생성

    // Redis 연결 확인 및 연결
    if (!redisClient.isOpen) {
      await redisClient.connect();// Redis 클라이언트 연결
      console.log('Redis re-connected inside login route');
    }

    // 사용자 ID를 key로 하여 Redis에 Refresh Token 저장
    await redisClient.set(user.id.toString(), refreshToken);
    console.log('Redis set 성공');

    // 클라이언트에 토큰 반환
    res.status(200).send({
      ok: true,
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    // 예외 발생 시 서버 오류 처리
    console.error('Login error:', err);
    res.status(500).send({ ok: false, message: 'Internal server error' });
  }
});

module.exports = router;
