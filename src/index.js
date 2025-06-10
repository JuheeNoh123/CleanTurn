// app.js: 전체 앱 설정 및 서버 실행
require('dotenv').config();
require('./routes/cleanZone/cronmail');// 청소 알림용 크론
require('./routes/mypage/croncleanscore');// 청소 점수 크론
const express = require('express');
const cors = require('cors')
const login = require('./routes/signInOut/login');
const signup = require('./routes/signInOut/signup');
const authJWT = require('./middleware/authJWT');
const refresh = require('./util/refresh');
const logout = require('./routes/signInOut/logout');
const mypage = require('./routes/mypage/mypage');
const group = require('./routes/group/makegroup');
const AIcleaning = require('./routes/group/AIcleaning');
const getgroup = require('./routes/group/group');
const cleanZone = require('./routes/cleanZone/cleanZone');
const testcleanscore = require('./routes/mypage/test-cleanscore');
const schedule = require('./routes/schedule/schedule');
const randomschedule = require('./routes/schedule/randomschedule');
const resetCleanStreak = require('./util/resetCleanStreak');

const cleanboard = require('./routes/cleanboard/cleanboard');
const makecleanboard = require('./routes/cleanboard/makeboard');

const app = express();
// CORS 설정
app.use(cors({
  origin: true, // 허용할 도메인
  credentials: true
}));
app.use(express.json()); // JSON 데이터 파싱
app.use(express.urlencoded({ extended: true })); // Form 데이터 파싱


// 라우팅 설정
app.get('/', (req, res) => res.send('Hello World!'));
app.use('/login', login);
app.use('/signup', signup);
app.use('/refresh', refresh);
app.use('/logout', logout);
app.use('/mypage',authJWT,mypage);
app.use('/group',authJWT,group);
app.use('/group',authJWT,AIcleaning);
app.use('/group',authJWT,getgroup);
app.use('/group',authJWT,cleanZone);
app.use('/schedule',authJWT,schedule);
app.use('/schedule',authJWT,randomschedule);
app.use('/cleanboard',authJWT, cleanboard);
app.use('/cleanboard',authJWT, makecleanboard);
app.use('/uploads', express.static('uploads')); 

app.use('/',testcleanscore);

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ ok: false, message: err.message });
});

// Redis 연결 후 서버 실행
const { redisClient, connectRedis } = require('./util/redis');
connectRedis().then(async() => {
  if (process.env.NODE_ENV === 'development') {
      await resetCleanStreak(); // 개발 환경에서 streak 초기화
    }
  app.listen(8000, () => console.log('App running on port 8000...'));
}).catch((err) => {
  console.error('Redis connection failed:', err);
  process.exit(1);
});
