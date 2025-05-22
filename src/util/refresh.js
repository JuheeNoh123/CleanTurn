const express = require('express');
const jwt = require('jsonwebtoken');
const { sign, verify, refreshVerify } = require('../util/jwt-util');

const router = express.Router();

router.post('/', async (req, res) => {
  if (req.headers.authorization && req.headers.refresh) {
    const authToken = req.headers.authorization.split('Bearer ')[1];
    const refreshToken = req.headers.refresh.split('Bearer ')[1];
    console.log(authToken);
    console.log(refreshToken);
    const authResult = verify(authToken);
    console.log(authResult);
    const decoded = jwt.decode(authToken);
    console.log(decoded);

    if (!decoded) {
      return res.status(401).send({
        ok: false,
        message: 'No authorized!',
      });
    }

    const refreshResult = await refreshVerify(refreshToken, decoded.id); // ← await 추가해야 함

    if (authResult.ok === false && authResult.message === 'jwt expired') {
      console.log(refreshResult);
      if (!refreshResult) {
        return res.status(401).send({
          ok: false,
          message: '다시 로그인 하세요',
        });
      } else {
        const newAccessToken = sign(decoded); // 여기서 user가 아니라 decoded 사용

        return res.status(200).send({
          ok: true,
          data: {
            accessToken: newAccessToken,
            refreshToken,
          },
        });
      }
    } else {
      return res.status(400).send({
        ok: false,
        message: 'Access token is not expired!',
      });
    }
  } else {
    return res.status(400).send({
      ok: false,
      message: 'Access token and refresh token are required!',
    });
  }
});

module.exports = router;
