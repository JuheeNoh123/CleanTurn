const express = require('express');
const cleanboardModel = require("../../models/cleanboardModel");

const router = express.Router();

//변수처리부분 :~으로 처리
//req = 받기 res = 보내기기

//게시판 생성
router.post('/make', async(req,res)=>{
    const { img, cleantime, content } = req.body;
    const { id, email } = req.user;

    //작업 할 때 동안 기다려야하는 경우 await
    await cleanboardModel.save('',cleantime, content, id);
    
    return res.status(201).send("잘 보내짐");
});

module.exports = router;