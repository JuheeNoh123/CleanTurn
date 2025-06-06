const express = require('express');
const Member = require('../../models/memberModel'); 
const userGroup = require('../../models/userGroupModel');
const cleanZone = require('../../models/cleanZoneModel'); 
const cleanboardModel = require("../../models/cleanboardModel");
const upload = require('../../util/fileParser');
const router = express.Router();

//변수처리부분 :~으로 처리
//req = 받기 res = 보내기기
router.post('/make/:groupId', upload.array('images', 2), async(req,res)=>{
    const groupId = req.params.groupId;
    console.log('업로드된 파일들:', req.files);
    const { cleantime, content } = req.body;
    const { id, email } = req.user;
    //작업 할 때 동안 기다려야하는 경우 await
    const board = await cleanboardModel.save(cleantime, content, id, groupId);
    console.log(board);
    for (const i of req.files){
        const img = i.path;
        await cleanboardModel.saveImage(board[0].insertId,img);
    }
    return res.status(201).send("잘 보내짐");
});

module.exports = router;