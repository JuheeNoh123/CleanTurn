const express = require('express');

const memberModel = require('../../models/memberModel'); 
const joinGroupCleanZoneMemberModel = require('../../models/joinCleanZoneGroupMember');
const cleanboardModel = require('../../models/cleanboardModel');
const feedbackModel = require("../../models/feedbackModel");
const Member = require("../../models/memberModel");
const getTodayCleanList = require('../cleanZone/getTodayCleanList');

const dayjs = require('dayjs');
require("dayjs/plugin/utc");
require("dayjs/plugin/timezone");
dayjs.extend(require("dayjs/plugin/utc"));
dayjs.extend(require("dayjs/plugin/timezone"));

const router = express.Router();


//청소 현황 게시판 조회
router.get('/status/:groupId', async(req,res) => {
    const {id,email} = req.user;
    console.log(id);
    const groupId = req.params.groupId;
    const sendlist = await getTodayCleanList(groupId);
    
    console.log(sendlist);
    data = []
    data.push({"memberId": id})
    let uploadButton = false;
    for(const sl of sendlist){
        console.log("sl",sl)
        // 그룹이 일치하는 데이터만 포함
        if (sl.groupId == groupId) {
            data.push({
                memberId: sl.member.id,
                name: sl.member.name,
                cleanzone: sl.cleanzone.zoneName,
                isCleaned: sl.isCleaned
            });

            // 내 담당 청소구역이면서 아직 청소 안한 경우만 true
            if (sl.member.id == id && !sl.isCleaned) {
                uploadButton = true;
            }
        }
    }
        
        
    
    data.push({"uploadButton": uploadButton});
    res.status(200).send(data);
});

//게시판 조회
router.get('/show/:groupId', async(req,res) => { 
    try {const groupId = req.params.groupId; 
    const { id, email } = req.user;  

    const start = dayjs().tz("Asia/Seoul").startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const end = dayjs().tz("Asia/Seoul").endOf('day').format('YYYY-MM-DD HH:mm:ss');     // 23:59:59.999

    console.log(groupId, id, start, end);

    const boards = await cleanboardModel.findByGroupIdAndDate(groupId, start, end);
    console.log(boards);

    const data = [];
    for (const b of boards) {
        console.log(b);
        const member = await memberModel.findById(b.member_id);
        const json = {
            boardId: b.id,
            cleanzones: [],
            memberName: member.name,
            cleantime: b.cleanTime,
            imageURL: [],
            content: b.content
        };

        const cleanzone = await joinGroupCleanZoneMemberModel.findJoinBoardGCZMByBoardId(b.id);
        console.log(cleanzone);
        for (const c of cleanzone) {
            json.cleanzones.push(c.cleanZoneName);
        }

        const image = await cleanboardModel.findImageByBoardId(b.id);
        console.log(image);
        for (const i of image) {
            json.imageURL.push(i.imageName);
        }

        data.push(json);
    }

    res.status(200).send(data);}
    catch (e) {
        console.error(e);
        res.status(500)
           .header("Access-Control-Allow-Origin", "*")
           .send({ error: "서버 오류 발생" });
    }

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