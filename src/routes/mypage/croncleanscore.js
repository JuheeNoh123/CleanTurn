const express = require('express');
const cron = require('node-cron');
const { redisClient } = require('../../util/redis');
const memberModel = require('../../models/memberModel');
const router = express.Router();
const getTodayCleanList = require('../cleanZone/getTodayCleanList');
const sendEmail = require('../../util/sendmail');
// 매일 밤 23:59 (서울 시간 기준) 청소 인증 상태 점검 작업 예약
cron.schedule('59 23 * * *', async () => {
    //오늘 청소 해야하는 담당자&구역 정보
    const userId = c.member.id;// 담당자 ID
    const result = await getTodayCleanList();
    for (const c of result){
        if (c.isCleaned === false) {
            //게시글 안 올림: streak 삭제 & 점수 감소
            await redisClient.del(`clean:streak:${userId}`);
            console.log(`게시글 없음 → streak 삭제`);
            // 점수는 최소 0점으로 유지하며 10점 감소
            const updatedScore = Math.max(c.member.cleaningScore - 10, 0);//최소 0점
            await memberModel.updateCleaningScore(userId, updatedScore);
            // 청소 점수 하락 알림 이메일 발송
            await sendEmail({
                to: e.member.email,
                //to:'juhee10131013@gmail.com',
                subject: `[CLEANTURN] 🚨 ${c.member.name}님 청소도 하락 알림`,
                html: `<table style="width: 100%; max-width: 600px; margin: auto; font-family: 'Arial', sans-serif; background: #fff; border: 1px solid #ddd; border-radius: 10px; padding: 24px;">
                        <tr>
                            <td style="text-align: center;">
                            <h2 style="color: #ff4d4f;">🚨 청소도 하락 알림</h2>
                            <p style="font-size: 16px; color: #333;">안녕하세요, <strong>${c.member.name}</strong>님.</p>
                            <p style="font-size: 15px; color: #555;">
                                오늘 청소 게시글이 등록되지 않아<br>
                                <strong style="color: #ff4d4f;">청소도가 10% 하락</strong>했어요.
                            </p>
                            <p style="font-size: 15px; color: #777;">꾸준한 인증으로 다시 회복할 수 있어요! 💪</p>
                            <hr style="margin: 20px 0;">
                            <p style="font-size: 14px; color: #999;">※ 청소도는 연속 3회 인증 시 10%씩 회복됩니다.</p>
                            <p style="font-size: 13px; color: #ccc;">- CleanTurn 팀</p>
                            </td>
                        </tr>
                        </table>`});
        }else{
            // 게시글 올림: streak 증가
            const newStreak = await redisClient.incr(`clean:streak:${userId}`);
            console.log(`연속 등록 횟수: ${newStreak}`);

            if (parseInt(newStreak) >= 3) {
                // streak 3: 점수 상승 + streak 초기화
                const updatedScore = Math.min(c.member.cleaningScore + 10, 100);
                await memberModel.updateCleaningScore(userId, updatedScore);
                await redisClient.del(`clean:streak:${userId}`);
                console.log(`🎉 streak 3회 달성 → 점수 증가 + streak 초기화`);
                // 청소 점수 상승 알림 이메일 발송
                await sendEmail({
                to: e.member.email,
                //to:'juhee10131013@gmail.com',
                subject: `[CLEANTURN] 🎉 ${c.member.name}님 청소도 상승 안내`,
                html: `<table style="width: 100%; max-width: 600px; margin: auto; font-family: 'Arial', sans-serif; background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 10px; padding: 24px;">
                    <tr>
                        <td style="text-align: center;">
                        <h2 style="color: #52c41a;">🎉 청소도 상승!</h2>
                        <p style="font-size: 16px; color: #333;">안녕하세요, <strong>${c.member.name}</strong>님.</p>
                        <p style="font-size: 15px; color: #555;">
                            최근 <strong>3회 연속으로 청소 게시글</strong>을 등록해주셨어요!<br>
                            <strong style="color: #52c41a;">청소도가 10% 상승</strong>했습니다. 👏
                        </p>
                        <p style="font-size: 15px; color: #777;">앞으로도 깨끗한 공간을 위해 힘써주세요!</p>
                        <hr style="margin: 20px 0;">
                        <p style="font-size: 14px; color: #999;">※ 매일 인증이 중요해요. 잊지 말고 꼭 남겨주세요 😊</p>
                        <p style="font-size: 13px; color: #ccc;">- CleanTurn 팀</p>
                        </td>
                    </tr>
                    </table>`});
            }
        }
    }
    console.log(result);
},{
    timezone: "Asia/Seoul" // 서울 시간대 기준 실행
});

module.exports = router;