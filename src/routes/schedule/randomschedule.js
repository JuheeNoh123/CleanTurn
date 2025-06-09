const express = require('express');
const scheduleModel = require('../../models/scheduleModel'); 
const specialScheduleModel = require('../../models/specialSchedule');
const joinCleanZoneGroupMemberModel = require('../../models/joinCleanZoneGroupMember');
const joinGroupMemberModel = require('../../models/joinGroupMemberModel');
const memberModel = require('../../models/memberModel');
const cleanZoneModel = require('../../models/cleanZoneModel');
const router = express.Router();
const dayjs = require('dayjs');

//랜덤 스케줄 생성 함수
function generateRandomSchedule(assignments) {
    const minDays = 1;// 한 사람에게 최소 배정 요일 수
    const maxDays = 2;// 최대 배정 요일 수
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    // 요일별 스케줄 객체 초기화
    const schedule = {};
    for (const day of days) {
        schedule[day] = [];
    }

    // 배열을 무작위로 섞는 함수 (Fisher-Yates Shuffle)
    const shuffle = (array) => {
    const copied = [...array];
    for (let i = copied.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copied[i], copied[j]] = [copied[j], copied[i]];
    }
        return copied;
    };

    // 각 담당자에 대해 랜덤하게 1~2일 요일을 뽑아 스케줄에 할당
    Object.values(assignments).forEach(entry => {
        const repeatCount = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays; // min ~ max 사이 정수
        const chosenDays = shuffle(days).slice(0, repeatCount); // 랜덤하게 요일 n개 선택

        // 선택된 요일에 해당 담당자의 정보 추가
        chosenDays.forEach(day => {
            schedule[day].push({
                joinGCZMid: entry.joinGCZMId,
                cleanZone: entry.cleanzoneName,
                manager: entry.memberName
            });
        });
    });

    return schedule;// 요일별 랜덤 스케줄 반환

}

//일정표 랜덤 배정
router.get('/random/:groupId',async(req,res)=>{
    const groupId = req.params.groupId;// URL 파라미터에서 그룹 ID 추출
    const joinCleanZoneMember={}; // 담당자 및 청소구역 정보를 저장할 객체

    // 그룹에 속한 모든 멤버 정보 조회
    let joingroupmembers = await joinGroupMemberModel.findByGroupId(groupId);
    joingroupmembers = joingroupmembers[0]; 
    console.log(joingroupmembers)
    
    let id=0;// 임시 인덱스 키

    // 각 그룹 멤버에 대해 청소 구역 매칭 정보 수집
    for (const joingroupmember of joingroupmembers){
        const member = await memberModel.findById(joingroupmember.member_id);
        
        // 해당 멤버가 담당하는 청소 구역 매칭 정보 조회
        let joinczgms = await joinCleanZoneGroupMemberModel.findByJoinGroupMemberId(joingroupmember.id); 
        joinczgms=joinczgms[0];
        for (const joinczgm of joinczgms){
            data={}
            const cleanzone = await cleanZoneModel.findById(joinczgm.cleanZone_id);
            // 담당자 + 청소 구역 정보 구성
            data["joinGCZMId"]=joinczgm.id;
            data["memberName"]=member.name;
            data["cleanzoneName"]=cleanzone.zoneName;
            // 인덱스를 키로 하여 객체에 저장
            joinCleanZoneMember[id]=data;
            id+=1;
        }
    }
    console.log(joinCleanZoneMember);

    // 랜덤 스케줄 생성 함수 호출
    const schedule = generateRandomSchedule(joinCleanZoneMember);
    // 클라이언트에 결과 반환
    res.status(200).send(schedule);
});

module.exports = router;