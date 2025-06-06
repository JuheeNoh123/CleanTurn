const express = require('express');
const memberModel = require('../../models/memberModel'); 
const userGroupModel = require('../../models/userGroupModel');
const cleanZoneModel = require('../../models/cleanZoneModel'); 
const scheduleModel = require('../../models/scheduleModel');
const specialScheduleModel = require('../../models/specialSchedule');
const joinGroupCleanZoneMemberModel = require('../../models/joinCleanZoneGroupMember');
const joinGroupMemberModel = require('../../models/joinGroupMemberModel');
const cleanboardModel = require('../../models/cleanboardModel');

const router = express.Router();


//청소 현황 게시판 조회
router.get('/status/:groupId', async(req,res) => {
    const groupId = req.params.groupId;
    const today = new Date();
    console.log(today);
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayName = days[today.getDay()];
    const schedules = await scheduleModel.getAllByDay(dayName);
    console.log(schedules);
    data = []
    for (const s of schedules){
        const joinGroupCleanZoneMember = await joinGroupCleanZoneMemberModel.findById(s.joinCleanZoneGroupMember_id);
        const cleanZoneName = await cleanZoneModel.findById(joinGroupCleanZoneMember[0].cleanZone_id);
        const joinGroupMember = await joinGroupMemberModel.findById(joinGroupCleanZoneMember[0].joinGroupMember_id);
        console.log(joinGroupMember);
        const member = await memberModel.findById(joinGroupMember[0].member_id);
        console.log(member);
        data.push({"cleanzone": cleanZoneName,
                "memberName":member.name
            });
    }
    
    const specialSchedules = await specialScheduleModel.getAllByDate(todaySTR);
    for (const s of specialSchedules){
        console.log(s);
        const joinGroupCleanZoneMember = await joinGroupCleanZoneMemberModel.findById(s.joinCleanZoneGroupMember_id);
        console.log(joinGroupCleanZoneMember);
        const cleanZoneName = await cleanZoneModel.findById(joinGroupCleanZoneMember[0].cleanZone_id); 
        const joinGroupMember = await joinGroupMemberModel.findById(joinGroupCleanZoneMember[0].joinGroupMember_id);
        console.log(joinGroupMember);
        const member = await memberModel.findById(joinGroupMember[0].member_id);
        console.log(member);
        if (!data.includes(member.name)){
            data.push({"cleanzone": cleanZoneName,
                "memberName":member.name
            });
            
        }
        
    }
});

//게시판 조회
router.get('/show/:groupId', async(req,res) => { 
    const groupId  = req.params.groupId; 
    const {id,email}=req.user;  
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    // 오늘 23:59:59
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    console.log(groupId, id, start, end);

    const boards = await cleanboardModel.findByMemberIdAndGroupId(id,groupId,start,end);
    console.log(boards);
    data = []
    for (const b of boards){
        console.log(b);
        const member = await memberModel.findById(b.member_id);
        const json = {"boardId":b.id, "cleanzones":[], "memberName":member.name, "cleantime":b.cleantime, "imageURL":[],"content":b.content };
        const cleanzone = await joinGroupCleanZoneMemberModel.findJoinBoardGCZMByBoardId(b.id);
        for (const c of cleanzone){
            json.cleanzones.push(c.cleanZoneName);
        }
        const image = await cleanboardModel.findImageByBoardId(b.id);
        console.log(image);
        for (const i of image){
            json.imageURL.push(i.imageName);
        }
        data.push(json);
    }
    res.status(200).send(data);

});

//피드백 조회
router.get('/', async(req,res) => {
    
});

//피드백 작성
router.post('/cleanboard',async(req,res)=>{
    const { feedback } = req.body;
    const content = new cleanZoneModel(feedback);

    return res.status(200).send({message: '피드백이 작성되었습니다.'});
});

module.exports = router;