const express = require('express');
const sendEmail = require('../../util/sendmail');
const memberModel = require('../../models/memberModel');
const scheduleModel = require('../../models/scheduleModel');
const speciaScheduleModel = require('../../models/specialSchedule');
const joinGroupMemberModel = require('../../models/JoinGroupMemberModel');
const joinGroupCleanZoneMemberModel = require('../../models/JoinCleanZoneGroupMember');
const router = express.Router();

//cron.schedule('0 9 * * *', 
(async () => {
    const today = new Date();
    const todaySTR = today.toISOString().slice(0, 10);
    
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayName = days[today.getDay()];
    const schedules = await scheduleModel.getAllByDay(dayName);
    console.log(schedules)
    for (const s of schedules){
        console.log(s);
        const joinGroupCleanZoneMember = await joinGroupCleanZoneMemberModel.findById(s.joinCleanZoneGroupMember_id);
        console.log(joinGroupCleanZoneMember);
        const joinGroupMember = await joinGroupMemberModel.findById(joinGroupCleanZoneMember[0].joinGroupMember_id);
        console.log(joinGroupMember);
        const member = await memberModel.findById(joinGroupMember[0].member_id);
        console.log(member);
        const email = member.email;
    }
    const specialSchedules = await speciaScheduleModel.getAllByDate(todaySTR);

})();
//});
module.exports = router;