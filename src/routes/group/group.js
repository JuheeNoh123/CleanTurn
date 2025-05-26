const express = require('express');
const router = express.Router();
const {userGroup,JoinGroupMember} = require('../../models/groupModel')
router.get('/getall',async(req,res)=>{
    const {id, email} = req.user;
    const joinGroups = await JoinGroupMember.findAllByUserId(id);
    groups = []
    if (joinGroups){
        for (const j of joinGroups){
            group = await userGroup.findById(j.group_id);
            
            groups.push({[j.group_id]: group.title });
            
        }
        return res.status(200).send(groups);
    }
    else{
        return res.status(200).send("속한 그룹이 없습니다.");
    }
});

module.exports = router;