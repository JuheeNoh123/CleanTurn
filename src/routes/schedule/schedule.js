const express = require('express');
const scheduleModel = require('../../models/scheduleModel'); 
const specialScheduleModel = require('../../models/specialSchedule');
const joinCleanZoneGroupMemberModel = require('../../models/joinCleanZoneGroupMember');
const joinGroupMemberModel = require('../../models/joinGroupMemberModel');
const memberModel = require('../../models/memberModel');
const cleanZoneModel = require('../../models/cleanZoneModel');
const router = express.Router();
const dayjs = require('dayjs');

//스케줄 수정
router.put('/update/:groupId',async(req,res)=>{
    const groupId = req.params.groupId;
    const joingroupmembers = await joinGroupMemberModel.findByGroupId(groupId);
    //console.log(joingroupmembers);
    const schedules = req.body;
    //기존에 저장되어있던 스케줄 정보 삭제
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
        
    //입력받은 스케줄 다시 저장
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


// 특정 시작일과 종료일 사이의 날짜 리스트를 생성하는 함수
function generateDateList(startDateStr, endDateStr) {
  const dateList = [];
  let current = dayjs(startDateStr);
  const end = dayjs(endDateStr);
 // 시작일부터 종료일까지 하루씩 증가시키며 날짜 문자열을 리스트에 추가
  while (current.isBefore(end) || current.isSame(end)) {
    dateList.push(current.format("YYYY-MM-DD"));
    current = current.add(1, "day");
  }

  return dateList;
}

// 요일 숫자(0~6)를 문자열로 매핑하고, 해당 요일의 일정 ID를 cleaningList의 정보로 변환하는 함수
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
// 요일별로 일정 ID 리스트를 담당자 및 청소 구역 정보로 매핑
  for (const [dayNumber, idList] of Object.entries(scheduleMap)) {
    const dayName = dayMap[dayNumber];
    result[dayName] = idList.map(id => {
      return cleaningList.find(c => c.joinGCZMid === id);
    }).filter(Boolean); // null 또는 undefined 제거
  }

  return result;
}

// 일정표 조회 API: 그룹 ID와 날짜 범위를 기준으로 청소 일정을 조회
router.get('/show/:groupId',async(req,res)=>{
    const { startDate, endDate } = req.query;
    const dates = generateDateList(startDate, endDate);
    const groupId = req.params.groupId;
    // 요일별로 반복 및 특정 일정 ID를 저장할 객체 초기화
    const schedule = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: []
  };
    // 해당 그룹에 속한 모든 멤버 조회
    const groupMembers = await joinGroupMemberModel.findByGroupId(groupId)
    console.log(groupMembers[0]);
    
    const cleaning = []// 청소 구역 및 담당자 정보를 저장할 리스트

    // 그룹 멤버별로 청소 구역 매칭 정보 조회
    for (const gm of groupMembers[0]){
        let gczm = await joinCleanZoneGroupMemberModel.findByJoinGroupMemberId(gm.id);        
        console.log(gczm);
        console.log('=====================');
        gczm  = gczm[0];
        console.log("dd",gczm);
        if (gczm){
            // 해당 멤버의 청소 구역 매칭 정보를 기반으로 상세 정보 구성
            for (const g of gczm){
                const cleaninfo={};
                cleaninfo['joinGCZMid']=g.id;
                console.log(g);
                // 청소 구역 이름 조회
                const cleanZone = await cleanZoneModel.findById(g.cleanZone_id);
                cleaninfo["cleanZone"] = cleanZone.zoneName;

                // 담당자 이름 조회
                const joinGroupMember = await joinGroupMemberModel.findById(g.joinGroupMember_id);
                const member = await memberModel.findById(joinGroupMember[0].member_id);
                cleaninfo["manager"] = member.name;
                cleaning.push(cleaninfo);    // 결과 리스트에 추가 
            }
            
        }
        else{
            return res.status(400).send('청소구역과 담당자 매칭이 필요합니다.');
        }
    }
    console.log(cleaning);

    // 날짜별 특정일정(special schedule) 조회
    for (const d of dates){
        const specSched = await specialScheduleModel.findByDate(d);
        for (const ss of specSched){
            // 특정일정에 해당하는 요일에 청소 매칭 ID 추가
            schedule[dayjs(ss.cleanDate).day()].push(ss.joinCleanZoneGroupMember_id);
        }
        
    }
    console.log(schedule);
    
    // 반복 일정의 요일명을 숫자 요일 인덱스로 매핑
    const repeatDayMap = {
    "SUNDAY": 0,
    "MONDAY": 1,
    "TUESDAY": 2,
    "WEDNESDAY": 3,
    "THURSDAY": 4,
    "FRIDAY": 5,
    "SATURDAY": 6
    };

    // 청소 담당자별로 반복 일정 조회 및 schedule에 추가
    for (const i of cleaning){
        const scheduleMagagerInfo = await scheduleModel.findByGCZM(i.joinGCZMid)
        for (const s of scheduleMagagerInfo){
            const dayIndex = repeatDayMap[s.repeatDay];
            // 중복 추가 방지를 위해 존재 여부 확인 후 추가
            if (dayIndex !== undefined && !schedule[dayIndex].includes(s.joinCleanZoneGroupMember_id)) {
                schedule[dayIndex].push(s.joinCleanZoneGroupMember_id);
            }
        }
    
    }   

    console.log(schedule);
    // 최종적으로 요일별로 담당자 및 청소 구역 정보를 매핑
    data = mapScheduleToInfo(schedule,cleaning);
    // 클라이언트에 결과 전송
    res.send(data); 
    
});


module.exports = router;
