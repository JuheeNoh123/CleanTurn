const express = require('express');
const router = express.Router();
const userGroup = require('../../models/userGroupModel'); // 그룹 데이터 모델
const JoinGroupMember = require('../../models/joinGroupMemberModel');// 그룹 가입 멤버 모델
const Member = require('../../models/memberModel');// 멤버 데이터 모델

// GET /getall : 로그인한 사용자가 속한 모든 그룹 목록 조회
router.get('/getall',async(req,res)=>{
    const {id, email} = req.user; // 로그인한 사용자 정보에서 id, email 추출
    const joinGroups = await JoinGroupMember.findAllByUserId(id); // 사용자가 가입한 그룹 조회
    console.log(joinGroups);
    groups = []
    if (joinGroups){
        for (const j of joinGroups){
            // 각 그룹의 상세 정보 조회
            group = await userGroup.findById(j.group_id);
            groups.push({'id':j.group_id, "name":group.title})
            
        }
        return res.status(200).send(groups);// 그룹 배열 응답
    }
    else{
        return res.status(200).send("속한 그룹이 없습니다.");// 가입된 그룹이 없으면 메시지 전송
    }
});

// 특정 그룹에 속한 멤버들 조회
router.get('/getmembers/:groupId',async(req,res)=>{
    const groupId = req.params.groupId;// URL 파라미터에서 groupId 추출
    const joinMembers = await JoinGroupMember.findByGroupId(groupId); // 해당 그룹의 가입 멤버 조회
    console.log(joinMembers[0]);
    const memberList = [];
    if(joinMembers[0]){
        for (const m of joinMembers[0]){
            result = {}
            const member = await Member.findById(m.member_id);// 멤버 상세 정보 조회
            console.log(member);
            // 필요한 정보만 추출해서 객체 생성
            result.id = member.id;
            result.name = member.name;
            result.email = member.email;
            result.cleaningScore = member.cleaningScore;
            memberList.push(result);
        }
        return res.status(200).send(memberList);// 멤버 리스트 응답
    }
    else{
        return res.status(200).send("속한 멤버가 없습니다."); // 멤버가 없으면 메시지 전송
    }
    
})

// 중복 검사 함수
function hasDuplicates(array) {
    return new Set(array).size !== array.length;
}

// 특정 그룹 멤버 및 그룹명 업데이트
router.put('/updatemembers/:groupId',async(req,res)=>{
    const groupId = req.params.groupId;
    const {id, email} = req.user;// 현재 로그인한 사용자 정보
    const {title, emailList} = req.body; // 요청 본문에서 그룹명과 멤버 이메일 리스트 추출
    emailList.push(email); // 현재 로그인한 사용자 이메일도 멤버 목록에 추가
    // 중복 이메일이 있으면 에러 응답
    if (hasDuplicates(emailList)) {
        console.log('중복 있음, 리턴');
        return res.status(400).send({ message: '중복된 멤버 이메일이 있습니다.' });
    }
    console.log('중복 없음, 계속 진행');
    // 기존에 가입된 그룹 멤버 정보 조회
    const joingroup = await JoinGroupMember.findByGroupId(groupId);
    console.log(joingroup[0])
    try{
        // 그룹명 업데이트
        await userGroup.updateById(title,groupId);
        // 기존 그룹 멤버 모두 삭제 (초기화)
        for (const m of joingroup[0]){
            await JoinGroupMember.deleteById(m.id);
        }
        
        // emailList에 있는 이메일 멤버들 다시 그룹에 저장
        for (const e of emailList){
            console.log(e);
            const member = await Member.findByEmail(e);
            await JoinGroupMember.saveJoinGroupMember(groupId,member.id);
        }
        return res.status(200).send("업데이트 완료");
    }catch(err){
        console.log(err);
        return res.status(500).send("업데이트 실패");
    }
    
    
    
    
})
module.exports = router;