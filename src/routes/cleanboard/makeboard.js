const express = require('express');

const Member = require('../../models/memberModel'); 
const userGroup = require('../../models/userGroupModel');
const cleanZoneModel = require('../../models/cleanZoneModel'); 

const cleanboardModel = require("../../models/cleanboardModel");
const joinGroupMemberModel = require("../../models/joinGroupMemberModel");
const joinCleanZoneGroupMemberModel = require("../../models/joinCleanZoneGroupMember");
const scheduleModel = require("../../models/scheduleModel");
const specialScheduleModel = require("../../models/specialSchedule");

const upload = require('../../util/fileParser');
const router = express.Router();

// dayjs 설정
const dayjs = require('dayjs');
require("dayjs/plugin/utc");
require("dayjs/plugin/timezone");
dayjs.extend(require("dayjs/plugin/utc"));
dayjs.extend(require("dayjs/plugin/timezone"));

//변수처리부분 :~으로 처리
//req = 받기 res = 보내기기

//게시판 생성

router.post('/make/:groupId', upload.array('images', 2), async(req,res)=>{
    const groupId = req.params.groupId;
    console.log('업로드된 파일들:', req.files);
    const { cleantime, content } = req.body;
    const { id, email } = req.user;
    console.log(id);
    const joingroupmember = await joinGroupMemberModel.findByGroupAndMemberId(groupId, id);
    const joinGCZM = await joinCleanZoneGroupMemberModel.findByJoinGroupMemberId(joingroupmember[0].id);
    
    //작업 할 때 동안 기다려야하는 경우 await
    const [result] = await cleanboardModel.save(cleantime, content, id, groupId);
    const boardId = result.insertId;
    for (const i of req.files) {
        const img = i.path;
        await cleanboardModel.saveImage(boardId, img);
    }

    const today = dayjs().tz("Asia/Seoul");
    const dayIndex = today.day(); // 0(일) ~ 6(토)
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const cleanzoneIdList =[]
    for (const jgczm of joinGCZM[0]){
        console.log(jgczm);
        
        const schedules = await scheduleModel.findByGCZMAndDay(jgczm.id,days[dayIndex])
        console.log("schedules ",schedules);
        if (schedules.length>0){
            cleanzoneIdList.push(jgczm.cleanZone_id);
        }

        const specialschedules = await specialScheduleModel.findByDateAndJGCZM(today.toISOString().split('T')[0],jgczm.id );
        console.log("specialschedules ",specialschedules);
        if (specialschedules.length>0 && !cleanzoneIdList.includes(jgczm.cleanZone_id)){
            cleanzoneIdList.push(jgczm.cleanZone_id);
        }

        console.log("cleanzoneIdList",cleanzoneIdList);
        
    }
    for(const cleanzoneId of cleanzoneIdList){
            const cleanzone = await cleanZoneModel.findById(cleanzoneId);
            console.log(cleanzone);
            await joinCleanZoneGroupMemberModel.saveJoinBoardGCZM(boardId, cleanzone.zoneName);
        }
    return res.status(201).send("게시글 생성 완료");
});

module.exports = router;