const express = require('express');

const JoinCZGMModel = require('../../models/JoinCleanZoneGroupMember');
const CleanZoneModel = require('../../models/cleanZoneModel');
const JoinGroupMemberModel = require('../../models/JoinGroupMemberModel');
const MemberModel = require('../../models/memberModel');

const router = express.Router();
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
            data.push({'id':null,'cleanZoneId':cleanZone.id, 'zoneName': cleanZone.zoneName, "member": null});
        }
        
        
    }
    console.log(data)
    return res.status(200).send(data);
});

router.put('/cleanzone/updatemember/:groupId',async(req,res)=>{
    const cleanZoneAndMemberList = req.body;
    const groupId = req.params.groupId;
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

router.put('/cleanzone/updatezone/:groupId',async(req,res)=>{
    const groupId = req.params.groupId;
    const cleanzones = req.body;
    await CleanZoneModel.delete(groupId);
    for (const cleanzone of cleanzones){
        console.log(cleanzone);
        await CleanZoneModel.saveCleanZone(cleanzone,groupId);
    }
    
    return res.send("업데이트 완료");
})
module.exports = router;