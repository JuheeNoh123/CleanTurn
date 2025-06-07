const express = require('express');

const feedbackModel = require("../../models/feedbackModel");
const cleanboardModel = require("../../models/cleanboardModel");
const Member = require("../../models/memberModel");
const memberModel = require('../../models/memberModel'); 
const cleanZoneModel = require('../../models/cleanZoneModel'); 
const scheduleModel = require('../../models/scheduleModel');
const specialScheduleModel = require('../../models/specialSchedule');
const joinGroupCleanZoneMemberModel = require('../../models/joinCleanZoneGroupMember');
const joinGroupMemberModel = require('../../models/joinGroupMemberModel');

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
    const sendlist = await getTodayCleanList();
    const groupId = req.params.groupId;
    console.log(sendlist);
    data = []
    let uploadButton = false;
    for(const sl of sendlist){
        let json = {}
        if(sl.groupId==groupId){
            json ={
                    "name":sl.member.name,
                    "cleanzone":sl.cleanzone.zoneName,
                    "isCleaned":sl.isCleaned
                    }
            
        }
        if(sl.member.id==id && !sl.isCleaned){
            uploadButton = true;
        }
        
        data.push(json);
    }
    data.push({"uploadButton": uploadButton});
    res.status(200).send(data);
});

//게시판 조회
router.get('/show/:groupId', async(req,res) => { 
    const groupId = req.params.groupId; 
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
            cleantime: b.cleantime,
            imageURL: [],
            content: b.content
        };

        const cleanzone = await joinGroupCleanZoneMemberModel.findJoinBoardGCZMByBoardId(b.id);
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

    res.status(200).send(data);

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