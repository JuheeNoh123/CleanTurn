const express = require('express');
const sendEmail = require('../../util/sendmail');
const getTodayCleanList = require('./getTodayCleanList');
const router = express.Router();
const cron = require('node-cron');
cron.schedule('36 4 * * *', async () => {
    const sendlist = await getTodayCleanList(); 
    
    console.log(sendlist);

    for (const e of sendlist){
        if(!e.isCleaned){
            await sendEmail({
                to: e.member.email,
                //to:'juhee10131013@gmail.com',
                subject: `[CLEANTURN]  ${e.member.name}님 청소 구역 안내`,
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
                    `
            });
        }
    }
},{
    timezone: "Asia/Seoul"
});

module.exports = router;