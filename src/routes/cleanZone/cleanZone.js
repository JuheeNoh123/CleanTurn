const express = require('express');

const JoinCZGMModel = require('../../models/joinCleanZoneGroupMember');
const CleanZoneModel = require('../../models/cleanZoneModel');
const JoinGroupMemberModel = require('../../models/joinGroupMemberModel');
const MemberModel = require('../../models/memberModel');

const router = express.Router();

// [GET] 특정 그룹의 청소 구역과 담당자 정보 조회
router.get('/cleanzone/show/:groupId',async(req,res)=>{
    const groupId = req.params.groupId;
    const cleanZones = await CleanZoneModel.findByGroupId(groupId);
    console.log("cleanZones : ",cleanZones);
    data = []
    for (const cleanZone of cleanZones){
        const joinCZGM = await JoinCZGMModel.findByCleanZoneId(cleanZone.id);
        console.log("joinCZGM : ",joinCZGM);
        if (joinCZGM.length>0){
            const joinGroupMember = await JoinGroupMemberModel.findById(joinCZGM[0].joinGroupMember_id);
            console.log("joinGroupMember : ",joinGroupMember);
            const member = await MemberModel.findById(joinGroupMember[0].member_id);
            data.push({'id':joinCZGM[0].id,'cleanZoneId':cleanZone.id, 'zoneName': cleanZone.zoneName, "member": member.name});
        }
        else{
            // 담당자가 없을 경우 null
            data.push({'id':null,'cleanZoneId':cleanZone.id, 'zoneName': cleanZone.zoneName, "member": null});
        }
        
        
    }
    console.log(data)
    return res.status(200).send(data);
});

// [PUT] 특정 그룹의 청소 구역별 담당자 정보 업데이트
router.put('/cleanzone/updatemember/:groupId',async(req,res)=>{
    const cleanZoneAndMemberList = req.body;
    const groupId = req.params.groupId;
    // 기존 청소구역-멤버 관계 삭제
    const cleanZones = await CleanZoneModel.findByGroupId(groupId);
    console.log(cleanZones);
    //data = []
    for (const cleanZone of cleanZones){
        const joinCZGM = await JoinCZGMModel.findByCleanZoneId(cleanZone.id);
        if (joinCZGM.length>0){
            console.log(joinCZGM.id);
            await JoinCZGMModel.deleteById(joinCZGM[0].id);
        }
        else{
            break;
        }
    }

    // 새로운 관계 저장
    for (const cm of cleanZoneAndMemberList){
        console.log(cm);
        const joinGroupMember = await JoinGroupMemberModel.findByGroupAndMemberId(groupId,cm.memberId);
        console.log(joinGroupMember);
        const czgm = new JoinCZGMModel(cm.cleanZoneId, joinGroupMember[0].id);
        console.log(czgm);
        await czgm.save();
    }

    return res.status(200).send('업데이트 완료');
});

// [PUT] 특정 그룹의 청소 구역 이름 목록 업데이트
router.put('/cleanzone/updatezone/:groupId',async(req,res)=>{
    const groupId = req.params.groupId;
    const cleanzones = req.body;
    // 기존 청소구역 모두 삭제 후 새로 저장
    await CleanZoneModel.delete(groupId);
    for (const cleanzone of cleanzones){
        console.log(cleanzone);
        await CleanZoneModel.saveCleanZone(cleanzone,groupId);
    }
    
    return res.send("업데이트 완료");
})


// 청소 구역들을 멤버에게 랜덤으로 배정하는 함수
function assignCleanZonesToMembers(cleanZones, members) {
  // 배열 복사해서 셔플
  function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  // cleanZones와 members를 배열로 변환
  const cleanZoneArray = Object.values(cleanZones);
  const memberArray = Object.values(members);
  // 셔플
  const shuffledMembers = shuffle(memberArray);
  const result = [];
  // 1차: 각 멤버에게 최소 하나씩 배정
  const minAssignCount = Math.min(cleanZoneArray.length, shuffledMembers.length);
  for (let i = 0; i < minAssignCount; i++) {
    result.push({
      cleanZoneId: cleanZoneArray[i].cleanZoneId,
      zoneName: cleanZoneArray[i].zoneName,
      memberId: shuffledMembers[i].memberId,
      memberName: shuffledMembers[i].name
    });
  }
  // 2차: 남은 청소 구역 있으면 랜덤 멤버에게 추가 배정
  for (let i = minAssignCount; i < cleanZoneArray.length; i++) {
    const randomMember = memberArray[Math.floor(Math.random() * memberArray.length)];
    result.push({
      cleanZoneId: cleanZoneArray[i].cleanZoneId,
      zoneName: cleanZoneArray[i].zoneName,
      memberId: randomMember.memberId,
      memberName: randomMember.name
    });
  }

  return result;
}


// [GET] 특정 그룹의 청소 구역을 랜덤으로 멤버에게 배정
router.get('/cleanzone/random/:groupId',async(req,res)=>{
    const groupId = req.params.groupId;
    // 청소 구역 목록 조회 및 JSON 형태로 변환
    const cleanZones = await CleanZoneModel.findByGroupId(groupId);
    console.log(cleanZones)
    const cleanZonesJson = {}
    let id=0;
    for (const cleanZone of cleanZones){
        cleanZonesJson[id]={
            "cleanZoneId":cleanZone.id,
            "zoneName": cleanZone.zoneName
        }
        id+=1;
    }

    // 그룹의 멤버 조회 및 JSON 형태로 변환
    const member = await JoinGroupMemberModel.findByGroupId(groupId);
    const members={}
    id=0;
    for (const m of member[0]){
        const mem = await MemberModel.findById(m.member_id);
        members[id]={
            "memberId":m.member_id,
            "name": mem.name
        }
        id+=1;
    }
    console.log(members);

    // 랜덤 배정 로직 실행
    const result = assignCleanZonesToMembers(cleanZonesJson, members);
    return res.status(200).send(result);
})
module.exports = router;