const express = require('express');
const scheduleModel = require('../../models/scheduleModel'); 
const specialScheduleModel = require('../../models/specialSchedule');
const router = express.Router();
//각 청소 id에 대해 반복일정과 특정일정을 받아온다. 
/*
[
    {
        "joinCleanZoneMemberId":65,
        "repeatDay":["Monday","Friday"],
        "special":["2025-07-01","2025-07-08"]
    },
    ...

]

*/
// router.post('/make/:groupId',async(req,res)=>{
//     const groupId = req.params.groupId;
//     const schedules = req.body;
//     for (const s of schedules){
//         for (const day of s.repeatDay){
//             scheduleModel.save(s.joinCleanZoneMemberId, day);
//         }
//         for (const cleandate of s.repeatDay){
//             scheduleModel.save(s.joinCleanZoneMemberId, cleandate);
//         }
        
        
//     }
// });

module.exports = router;
