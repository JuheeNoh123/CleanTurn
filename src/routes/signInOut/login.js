const express = require('express');
const bcrypt = require('bcrypt');
const jwtUtil = require('../../util/jwt-util.js');
const { redisClient } = require('../../util/redis.js');

const Member = require('../../models/memberModel.js');

const router = express.Router();

router.post('/', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Member.findByEmail(email);
    if (!user) {
      return res.status(401).send({ ok: false, message: 'email or password is incorrect' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send({ ok: false, message: 'email or password is incorrect' });
    }
    console.log('login success');

    const accessToken = jwtUtil.sign(user);
    const refreshToken = jwtUtil.refresh();

    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log('Redis re-connected inside login route');
    }

    await redisClient.set(user.id.toString(), refreshToken);
    console.log('Redis set 성공');

    res.status(200).send({
      ok: true,
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send({ ok: false, message: 'Internal server error' });
  }
});

module.exports = router;
