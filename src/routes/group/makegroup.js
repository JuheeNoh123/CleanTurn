const express = require('express');
const Member = require('../../models/memberModel'); 
const userGroup = require('../../models/userGroupModel');
const JoinGroupMember = require('../../models/JoinGroupMemberModel')
const cleanZone = require('../../models/cleanZoneModel');

const router = express.Router();

// 중복 검사 함수
function hasDuplicates(array) {
    return new Set(array).size !== array.length;
}

router.post('/makegroup',async(req,res)=>{
    const {groupTitle, memberList, cleanList} = req.body;
    const {id, email} = req.user;
    const resList = {groupTitle:groupTitle, memberNameList:[]}
    try{
        memberList.push(email);
        if (hasDuplicates(memberList)) {
            return res.status(400).send({ message: '중복된 멤버 이메일이 있습니다.' });
        }
        let group = new userGroup(groupTitle);
        const result = await group.saveUserGroup();
        console.log(result);
        const groupId = result[0].insertId;
        
        for (const email of memberList){
            const user = await Member.findByEmail(email);
            console.log(user);
            await JoinGroupMember.saveJoinGroupMember(groupId, user.id);
            resList.memberNameList.push(user.name);
        }

        

        for (const clean of cleanList){
            console.log('zoneName:', clean, 'groupId:', groupId);
            await cleanZone.saveCleanZone(clean,groupId);
        }



        return res.status(201).send(resList);
        
    }catch(err){
        console.log(err);
        return res.status(500).send({message:"False"});
    }
});

router.get('/checkmember/:email',async(req,res)=>{
    const email = req.params.email;
    const user = await Member.findByEmail(email);
    if (user){
        return res.status(200).send("회원 추가가능");
    }
    return res.status(200).send("등록되지 않은 회원입니다.");
})

module.exports = router;