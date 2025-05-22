// app.js
require('dotenv').config();
const express = require('express');
const { redisClient, connectRedis } = require('./util/redis');
const login = require('./routes/login');
const signup = require('./routes/signup');
const authJWT = require('./middleware/authJWT');
const refresh = require('./util/refresh');
const logout = require('./routes/logout');


const app = express();

app.use(express.json()); // JSON 데이터 파싱
app.use(express.urlencoded({ extended: true })); // Form 데이터 파싱

// 정적 파일 & 라우팅
// 기본 응답
app.get('/', (req, res) => res.send('Hello World!'));
app.use('/login', login);
app.use('/signup', signup);
app.use('/refresh', refresh);
app.use('/logout', logout);


// 에러를 JSON으로 응답
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ ok: false, message: err.message });
});

connectRedis().then(() => {
  app.listen(8000, () => console.log('App running on port 8000...'));
}).catch((err) => {
  console.error('Redis connection failed:', err);
  process.exit(1);
});
