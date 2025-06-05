const express = require('express');
const scheduleModel = require('../../models/scheduleModel'); 
const specialScheduleModel = require('../../models/specialSchedule');
const joinCleanZoneGroupMemberModel = require('../../models/joinCleanZoneGroupMember');
const joinGroupMemberModel = require('../../models/joinGroupMemberModel');
const memberModel = require('../../models/memberModel');
const cleanZoneModel = require('../../models/cleanZoneModel');
const router = express.Router();
const dayjs = require('dayjs');

router.put('/update/:groupId',async(req,res)=>{
    const groupId = req.params.groupId;
    const joingroupmembers = await joinGroupMemberModel.findByGroupId(groupId);
    //console.log(joingroupmembers);
    const schedules = req.body;
    for (const joingroupmember of joingroupmembers[0]){
        let joinCleanZoneGroupMember = await joinCleanZoneGroupMemberModel.findByJoinGroupMemberId(joingroupmember.id);
        joinCleanZoneGroupMember = joinCleanZoneGroupMember[0]
        console.log(joinCleanZoneGroupMember);
        for (const i of joinCleanZoneGroupMember){
            console.log(i);
            await scheduleModel.deleteByJoinGCZMId(i.id);
            await specialScheduleModel.deleteByJoinGCZMId(i.id);
        }
    }
        
    for (const s of schedules){
        for (const day of s.repeatDay){
            await scheduleModel.save(s.joinCleanZoneMemberId, day);
        }
        for (const cleandate of s.special){
            await specialScheduleModel.save(s.joinCleanZoneMemberId, cleandate);
        }
        
        
    }
    res.status(201).send("ok");
});



function generateDateList(startDateStr, endDateStr) {
  const dateList = [];
  let current = dayjs(startDateStr);
  const end = dayjs(endDateStr);

  while (current.isBefore(end) || current.isSame(end)) {
    dateList.push(current.format("YYYY-MM-DD"));
    current = current.add(1, "day");
  }

  return dateList;
}


function mapScheduleToInfo(scheduleMap, cleaningList) {
  const dayMap = {
    0: "SUNDAY",
    1: "MONDAY",
    2: "TUESDAY",
    3: "WEDNESDAY",
    4: "THURSDAY",
    5: "FRIDAY",
    6: "SATURDAY"
  };

  const result = {};

  for (const [dayNumber, idList] of Object.entries(scheduleMap)) {
    const dayName = dayMap[dayNumber];
    result[dayName] = idList.map(id => {
      return cleaningList.find(c => c.joinGCZMid === id);
    }).filter(Boolean); // null 또는 undefined 제거
  }

  return result;
}


router.get('/show/:groupId',async(req,res)=>{
    const dates = generateDateList(req.body.startDate, req.body.endDate);
    const groupId = req.params.groupId;
    const schedule = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: []
  };
    
    const groupMembers = await joinGroupMemberModel.findByGroupId(groupId)
    console.log(groupMembers[0]);
    
    const cleaning = []
    for (const gm of groupMembers[0]){
        let gczm = await joinCleanZoneGroupMemberModel.findByJoinGroupMemberId(gm.id);        
        gczm  = gczm[0][0];
        console.log(gczm);
        if (gczm){
            const cleaninfo={};
            cleaninfo['joinGCZMid']=gczm.id;
            const cleanZone = await cleanZoneModel.findById(gczm.cleanZone_id);
            cleaninfo["cleanZone"] = cleanZone.zoneName;
            const joinGroupMember = await joinGroupMemberModel.findById(gczm.joinGroupMember_id);
            const member = await memberModel.findById(joinGroupMember[0].member_id);
            cleaninfo["manager"] = member.name;
            cleaning.push(cleaninfo);     
        }
        else{
            return res.status(400).send('청소구역과 담당자 매칭이 필요합니다.');
        }
    }
    console.log(cleaning);
    for (const d of dates){
        const specSched = await specialScheduleModel.findByDate(d);
        for (const ss of specSched){
            schedule[dayjs(ss.cleanDate).day()].push(ss.joinCleanZoneGroupMember_id);
        }
        
    }
    console.log(schedule);
    

    const repeatDayMap = {
    "SUNDAY": 0,
    "MONDAY": 1,
    "TUESDAY": 2,
    "WEDNESDAY": 3,
    "THURSDAY": 4,
    "FRIDAY": 5,
    "SATURDAY": 6
    };


    for (const i of cleaning){
        const scheduleMagagerInfo = await scheduleModel.findByGCZMAndDay(i.joinGCZMid)
        for (const s of scheduleMagagerInfo){
            const dayIndex = repeatDayMap[s.repeatDay];
            if (dayIndex !== undefined && !schedule[dayIndex].includes(s.joinCleanZoneGroupMember_id)) {
                schedule[dayIndex].push(s.joinCleanZoneGroupMember_id);
            }
        }
    
    }   

    console.log(schedule);

    data = mapScheduleToInfo(schedule,cleaning);

    res.send(data); 
    
});


module.exports = router;
