const express = require('express');
const sendEmail = require('../../util/sendmail');
const getTodayCleanList = require('./getTodayCleanList');
const router = express.Router();
// node-cron 모듈을 불러와 스케줄링 기능 사용
const cron = require('node-cron');

// 매일 오전 9시에 실행되도록 스케줄링 (cron 표현식: '0 9 * * *')
cron.schedule('0 9 * * *', async () => {
    const sendlist = await getTodayCleanList(); // 오늘의 청소 담당자 목록을 가져옴
    
    console.log(sendlist);

    // 리스트를 순회하면서 청소를 아직 안 한 사람에게만 이메일 전송
    for (const e of sendlist){
        if(!e.isCleaned){ // 청소를 하지 않은 경우
            await sendEmail({
                // 실제 사용 시 아래 주소 대신 e.member.email 사용
                //to: e.member.email,
                to:'juhee10131013@gmail.com',// 테스트용 이메일 주소
                subject: `[CLEANTURN]  ${e.member.name}님 청소 구역 안내`, // 이메일 제목
                html: `
                    <div style="
                    max-width: 480px;
                    margin: 20px auto;
                    padding: 20px;
                    border: 2px solid #2a7ae2;
                    border-radius: 12px;
                    background: #f9faff;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: #333;
                    box-shadow: 0 4px 8px rgba(42, 122, 226, 0.2);
                    text-align: center;
                ">
                <h2 style="color: #2a7ae2; margin-bottom: 16px;">청소 안내 메시지</h2>
                <p style="font-size: 18px; font-weight: 600;">
                    <strong>${e.member.name}님</strong>, 안녕하세요!
                </p>
                <p style="font-size: 16px;">
                    오늘 담당 구역은 <span style="color: #2a7ae2; font-weight: bold;">${e.cleanzone.zoneName}</span>입니다.
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="font-size: 15px; line-height: 1.5; color: #555;">
                    청소 후 인증 사진과 함께 게시글을 작성해주세요.<br>
                    게시글을 작성해주셔야 
                    <span style="color: #28a745; font-weight: 600;">청소 완료</span>로 인정됩니다.
                </p>
                <p style="margin-top: 30px; font-size: 14px; color: #888;">
                    즐거운 하루 보내세요! 😊
                </p>
                </div>
                    ` // 이메일 HTML 본문
            });
        }
    }
},{
    timezone: "Asia/Seoul"  // 실행 시간대를 서울(Asia/Seoul)로 지정
});

module.exports = router;