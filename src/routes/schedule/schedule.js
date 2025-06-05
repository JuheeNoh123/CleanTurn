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
router.post('/make',async(req,res)=>{
    const schedules = req.body;
    for (const s of schedules){
        for (const day of s.repeatDay){
            await scheduleModel.save(s.joinCleanZoneMemberId, day);
        }
        for (const cleandate of s.special){
            await specialScheduleModel.save(s.joinCleanZoneMemberId, cleandate);
        }
        
        
    }
    res.send("ok");
});

module.exports = router;
