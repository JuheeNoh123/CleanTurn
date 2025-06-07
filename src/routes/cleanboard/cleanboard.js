const express = require('express');
const feedbackModel = require("../../models/feedbackModel");
const cleanboardModel = require("../../models/cleanboardModel");
const Member = require("../../models/memberModel");
const feedback = require('../../models/feedbackModel');

const router = express.Router();

//게시판 조회
router.get('/', async(req,res) => {
    
});

//피드백 조회
router.get('/getallfeedback/:cleanBoard_id', async(req,res) => {
    try{
        const { id, email } = req.user;
        const cleanBoard_id = req.params.cleanBoard_id;

        const feedbacks = await feedbackModel.findByAllFeedback(cleanBoard_id);
        
        result = [];
        for(const feedback of feedbacks) {
            const user = await Member.findById(feedback.member_id);    
            result.push({
                memberName: user.name,
                content: feedback.content
            })
        }
        return res.status(200).send(result);
    } catch {
        console.log(error);
        return res.status(500).send({message: '서버오류'});
    }
});

//피드백 작성
router.post('/feedbackmake',async(req,res)=>{
    const { id , email } = req.user;
    const { cleanBoard_id, content } = req.body;

    await feedbackModel.saveUserFeedback(id, cleanBoard_id, content);

    return res.status(201).send("피드백 작성 완료");
});

module.exports = router;