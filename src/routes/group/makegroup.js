const express = require('express');
const Member = require('../../models/memberModel'); 
const userGroup = require('../../models/userGroupModel');
const JoinGroupMember = require('../../models/joinGroupMemberModel')
const cleanZone = require('../../models/cleanZoneModel');

const router = express.Router();

// 중복 검사 함수
function hasDuplicates(array) {
    return new Set(array).size !== array.length;
}

//새로운 그룹 생성 및 멤버, 청소 구역 등록
router.post('/makegroup',async(req,res)=>{
    const {groupTitle, memberList, cleanList} = req.body;
    const {id, email} = req.user;
    const resList = {groupTitle:groupTitle, memberNameList:[]}
    try{
        // 현재 로그인한 사용자의 이메일을 멤버 리스트에 추가
        memberList.push(email);
        // 멤버 이메일 중복 검사
        if (hasDuplicates(memberList)) {
            return res.status(400).send({ message: '중복된 멤버 이메일이 있습니다.' });
        }
        // 새로운 그룹 객체 생성 후 DB 저장
        let group = new userGroup(groupTitle);
        const result = await group.saveUserGroup();
        console.log(result);
        const groupId = result[0].insertId;// 새로 생성된 그룹 ID
        
        // 멤버 리스트 순회하며 그룹 멤버로 저장
        for (const email of memberList){
            const user = await Member.findByEmail(email);
            console.log(user);
            await JoinGroupMember.saveJoinGroupMember(groupId, user.id);
            resList.memberNameList.push(user.name);// 응답용 멤버 이름 리스트에 추가
        }

        
        // 청소 구역 리스트 순회하며 그룹에 청소 구역 저장
        for (const clean of cleanList){
            console.log('zoneName:', clean, 'groupId:', groupId);
            await cleanZone.saveCleanZone(clean,groupId);
        }


        // 성공 시 201과 결과 데이터 반환
        return res.status(201).send(resList);
        
    }catch(err){
        console.log(err);
        return res.status(500).send({message:"False"});
    }
});

//이메일로 회원 존재 여부 확인
router.get('/checkmember/:email',async(req,res)=>{
    const email = req.params.email;
    const user = await Member.findByEmail(email);
    if (user){
        return res.status(200).send("회원 추가가능");
    }
    return res.status(200).send("등록되지 않은 회원입니다.");
})

module.exports = router;