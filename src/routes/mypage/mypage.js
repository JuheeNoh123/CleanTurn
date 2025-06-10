const express = require('express');
const router = express.Router();
const Member = require('../../models/memberModel'); 

// 마이페이지 정보 조회 라우트
router.get('/',async(req,res)=>{
    const{id, email} = req.user; // 인증된 사용자 정보에서 id와 email 추출
    const user = await Member.findByEmail(email);// 이메일로 사용자 정보 조회
    
    // 사용자 정보 클라이언트에 반환
    return res.status(200).send({
        id: id,
        name: user.name,
        email: email,
        cleanScore: user.cleaningScore
    });
});
module.exports = router;