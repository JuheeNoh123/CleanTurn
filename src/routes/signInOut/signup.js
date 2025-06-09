const express = require('express');
const bcrypt = require('bcrypt');

const memberModel = require('../../models/memberModel'); 
const router = express.Router();
//회원가입 처리
router.post('/',async(req,res)=>{
    // 클라이언트 요청에서 사용자 정보 추출
    const {name, email,password} = req.body;
    try {
        // 이메일 중복 체크
        if(await memberModel.findByEmail(email)){
            return res.status(400).send({message: '이미 존재하는 회원입니다.'})
        }
        // 사용자 객체 생성
        const user = new memberModel(name, email, password);
        // DB에 저장
        await user.save();
        // 회원가입 성공 응답
        return res.status(201).send({ message: '사용자를 등록했습니다.' });
    } catch (err) {
         // 예외 발생 시 처리
        console.error('회원가입 에러:', err);
        return res.status(500).send({ message: '회원가입 중 오류가 발생했습니다.' });
    }
    
});

module.exports = router;
