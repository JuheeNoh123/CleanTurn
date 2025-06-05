const nodemailer = require('nodemailer');
async function sendEmail({ to, subject, text }) {

    const transporter = nodemailer.createTransport({
        service: 'smtp.gmail.com', // gmail을 사용함
        port: 587,
        auth: {
            user: process.env.EMAIL , // 나의 (작성자) 이메일 주소
            pass: process.env.EMAILPASSWORD // 이메일의 비밀번호
        }
    });

    // 메일 옵션 설정
    const mailOptions = {
        from: process.env.EMAIL,
        to,
        subject,
        text,
    };

    // 이메일 전송
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;