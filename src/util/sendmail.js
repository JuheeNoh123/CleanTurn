const nodemailer = require('nodemailer'); //이메일 전송을 위한 패키지
require('dotenv').config();

// 이메일을 보내는 비동기 함수 정의
async function sendEmail({ to, subject, html }) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',// 이메일 서비스 종류
            auth: {
                user: process.env.EMAIL, // .env에 저장된 이메일 주소
                pass: process.env.EMAILPASSWORD // .env에 저장된 이메일 비밀번호
            }
        });

        // 이메일 옵션 설정
        const mailOptions = {
            from: process.env.EMAIL, // 보내는 사람 이메일 주소
            to, // 받는 사람 이메일 주소
            subject,// 이메일 제목
            html,// 이메일 본문 (HTML 형식)
        };

        // 이메일 전송
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);// 성공 메시지 출력
    } catch (error) {
        console.error('Error sending email:', error);// 에러 발생 시 콘솔에 에러 메시지 출력
    }
}

module.exports = sendEmail;