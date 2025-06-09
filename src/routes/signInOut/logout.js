const express = require('express');
const { redisClient } = require('../../util/redis');
const auth = require('../../middleware/authJWT');  // accessToken 검증 미들웨어

const router = express.Router();
//로그아웃 처리
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;// JWT 인증된 사용자 정보에서 userId 추출
    console.log(userId);
    // Redis에서 해당 사용자의 Refresh Token 삭제 → 로그아웃 처리
    await redisClient.del(userId.toString());
    // 성공 응답 반환
    res.status(200).send({ ok: true, message: '로그아웃 완료' });

  } catch (err) {
    // 에러 처리
    res.status(500).send({ ok: false, message: '로그아웃 중 오류 발생' });
  }
});

module.exports = router;