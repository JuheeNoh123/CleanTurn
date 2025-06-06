const express = require('express');
const Member = require('../../models/memberModel'); 
const userGroup = require('../../models/userGroupModel');
const cleanZone = require('../../models/cleanZoneModel'); 

const router = express.Router();

//게시판 조회
router.get('/', async(req,res) => {
    
});

//피드백 조회
router.get('/', async(req,res) => {
    
});

//피드백 작성
router.post('/cleanboard',async(req,res)=>{
    const { feedback } = req.body;
    const content = new cleanZone(feedback);

    return res.status(200).send({message: '피드백이 작성되었습니다.'});
});

module.exports = router;