const express = require('express');
const bcrypt = require('bcrypt');

const Member = require('../models/member'); 
const router = express.Router();
router.post('/',async(req,res)=>{
    const {name, email,password} = req.body;
    try {
        const user = new Member(name, email, password); // ✅ 올바른 순서
        await user.save();
        return res.status(201).send({ message: '사용자를 등록했습니다.' });
    } catch (err) {
        console.error('회원가입 에러:', err);
        return res.status(500).send({ message: '회원가입 중 오류가 발생했습니다.' });
    }
    
});

module.exports = router;
