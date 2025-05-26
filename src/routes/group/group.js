const express = require('express');
const router = express.Router();
const userGroup = require('../../models/groupModel')
const JoinGroupMember = require('../../models/JoinGroupMemberModel')
const Member = require('../../models/memberModel');

router.get('/getall',async(req,res)=>{
    const {id, email} = req.user;
    const joinGroups = await JoinGroupMember.findAllByUserId(id);
    console.log(joinGroups);
    groups = {}
    if (joinGroups){
        for (const j of joinGroups){
            group = await userGroup.findById(j.group_id);
            
            groups[j.group_id]= group.title;
            
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

router.put('/updatemembers/:groupId',async(req,res)=>{
    const groupId = req.params.groupId;
    const joingroup = await JoinGroupMember.findByGroupId(groupId);
    if(joingroup[0]){
        for (const m of joingroup[0]){
            
        }
        return res.status(200).send(memberList);
    }
    else{
        return res.status(200).send("속한 멤버가 없습니다.");
    }
    
})
module.exports = router;