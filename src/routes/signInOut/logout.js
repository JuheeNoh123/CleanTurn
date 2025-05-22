const express = require('express');
const { redisClient } = require('../../util/redis');
const auth = require('../../middleware/authJWT'); // accessToken 검증

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    await redisClient.del(userId.toString());
    res.status(200).send({ ok: true, message: '로그아웃 완료' });
  } catch (err) {
    res.status(500).send({ ok: false, message: '로그아웃 중 오류 발생' });
  }
});

module.exports = router;