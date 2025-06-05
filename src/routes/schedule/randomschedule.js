const express = require('express');
const scheduleModel = require('../../models/scheduleModel'); 
const specialScheduleModel = require('../../models/specialSchedule');
const joinCleanZoneGroupMemberModel = require('../../models/joinCleanZoneGroupMember');
const joinGroupMemberModel = require('../../models/joinGroupMemberModel');
const memberModel = require('../../models/memberModel');
const cleanZoneModel = require('../../models/cleanZoneModel');
const router = express.Router();
const dayjs = require('dayjs');


function generateRandomSchedule(assignments) {
    const minDays = 1;
    const maxDays = 2;
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const schedule = {};
    for (const day of days) {
        schedule[day] = [];
    }

    const shuffle = (array) => {
    const copied = [...array];
    for (let i = copied.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copied[i], copied[j]] = [copied[j], copied[i]];
    }
        return copied;
    };

    Object.values(assignments).forEach(entry => {
        const repeatCount = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays; // min ~ max 사이 정수
        const chosenDays = shuffle(days).slice(0, repeatCount); // 랜덤하게 요일 n개 선택

        chosenDays.forEach(day => {
            schedule[day].push({
                joinGCZMid: entry.joinGCZMId,
                cleanZone: entry.cleanzoneName,
                manager: entry.memberName
            });
        });
    });

    return schedule;

}


router.get('/random/:groupId',async(req,res)=>{
    const groupId = req.params.groupId;
    const joinCleanZoneMember={}
    let joingroupmembers = await joinGroupMemberModel.findByGroupId(groupId);
    joingroupmembers = joingroupmembers[0];
    console.log(joingroupmembers)
    let id=0;
    for (const joingroupmember of joingroupmembers){
        const member = await memberModel.findById(joingroupmember.member_id);
        let joinczgms = await joinCleanZoneGroupMemberModel.findByJoinGroupMemberId(joingroupmember.id); 
        joinczgms=joinczgms[0];
        for (const joinczgm of joinczgms){
            data={}
            const cleanzone = await cleanZoneModel.findById(joinczgm.cleanZone_id);
            data["joinGCZMId"]=joinczgm.id;
            data["memberName"]=member.name;
            data["cleanzoneName"]=cleanzone.zoneName;
            joinCleanZoneMember[id]=data;
            id+=1;
        }
    }
    console.log(joinCleanZoneMember);


    const schedule = generateRandomSchedule(joinCleanZoneMember);

    res.status(200).send(schedule);
});

module.exports = router;