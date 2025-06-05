const express = require('express');
const router = express.Router();
const userGroup = require('../../models/userGroupModel')
const JoinGroupMember = require('../../models/JoinGroupMemberModel')
const Member = require('../../models/memberModel');

router.get('/getall',async(req,res)=>{
    const {id, email} = req.user;
    const joinGroups = await JoinGroupMember.findAllByUserId(id);
    console.log(joinGroups);
    groups = []
    if (joinGroups){
        for (const j of joinGroups){
            group = await userGroup.findById(j.group_id);
            groups.push({'id':j.group_id, "name":group.title})
            
        }
        return res.status(200).send(groups);
    }
    else{
        return res.status(200).send("속한 그룹이 없습니다.");
    }
});


router.get('/getmembers/:groupId',async(req,res)=>{
    const groupId = req.params.groupId;
    const joinMembers = await JoinGroupMember.findByGroupId(groupId);
    console.log(joinMembers[0]);
    const memberList = [];
    if(joinMembers[0]){
        for (const m of joinMembers[0]){
            result = {}
            const member = await Member.findById(m.member_id);
            console.log(member);
            result.id = member.id;
            result.name = member.name;
            result.email = member.email;
            result.cleaningScore = member.cleaningScore;
            memberList.push(result);
        }
        return res.status(200).send(memberList);
    }
    else{
        return res.status(200).send("속한 멤버가 없습니다.");
    }
    
})

// 중복 검사 함수
function hasDuplicates(array) {
    return new Set(array).size !== array.length;
}

router.put('/updatemembers/:groupId',async(req,res)=>{
    const groupId = req.params.groupId;
    const {id, email} = req.user;
    const {title, emailList} = req.body;
    emailList.push(email);
    if (hasDuplicates(emailList)) {
        console.log('중복 있음, 리턴');
        return res.status(400).send({ message: '중복된 멤버 이메일이 있습니다.' });
    }
    console.log('중복 없음, 계속 진행');
    const joingroup = await JoinGroupMember.findByGroupId(groupId);
    console.log(joingroup[0])
    try{
        await userGroup.updateById(title,groupId);
        for (const m of joingroup[0]){
            await JoinGroupMember.deleteById(m.id);
        }
        //await JoinGroupMember.saveJoinGroupMember(groupId,id)
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