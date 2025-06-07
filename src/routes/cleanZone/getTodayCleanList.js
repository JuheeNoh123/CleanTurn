const memberModel = require('../../models/memberModel');
const scheduleModel = require('../../models/scheduleModel');
const speciaScheduleModel = require('../../models/specialSchedule');
const joinGroupMemberModel = require('../../models/joinGroupMemberModel');
const joinGroupCleanZoneMemberModel = require('../../models/joinCleanZoneGroupMember');
const cleanboardModel = require('../../models/cleanboardModel');
const cleanZoneModel = require('../../models/cleanZoneModel');
const dayjs = require('dayjs');
require("dayjs/plugin/utc");
require("dayjs/plugin/timezone");
dayjs.extend(require("dayjs/plugin/utc"));
dayjs.extend(require("dayjs/plugin/timezone"));

const getTodayCleanList = async (groupId = null) => {
    const today = dayjs().tz("Asia/Seoul"); // dayjs 객체
    const todaySTR = today.format("YYYY-MM-DD"); // MySQL 날짜 조회용
    console.log("오늘 날짜:", todaySTR);

    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayName = days[today.day()]; // KST 기준 요일 이름
    console.log("요일 이름:", dayName);

    const sendlist = [];

    const schedules = await scheduleModel.getAllByDay(dayName);
    for (const s of schedules){
        const joinGroupCleanZoneMember = await joinGroupCleanZoneMemberModel.findById(s.joinCleanZoneGroupMember_id);
        const cleanZoneName = await cleanZoneModel.findById(joinGroupCleanZoneMember[0].cleanZone_id);
        const joinGroupMember = await joinGroupMemberModel.findById(joinGroupCleanZoneMember[0].joinGroupMember_id);
        const member = await memberModel.findById(joinGroupMember[0].member_id);
        const IsWrite = await cleanboardModel.findByMemberIdAndGroupId(member.id, joinGroupMember[0].group_id)
        
        sendlist.push({
            groupId: joinGroupMember[0].group_id,
            cleanzone: cleanZoneName,
            member: member,
            isCleaned: IsWrite.length > 0
        });
    }

    const specialSchedules = await speciaScheduleModel.getAllByDate(todaySTR);
    for (const s of specialSchedules){
        const joinGroupCleanZoneMember = await joinGroupCleanZoneMemberModel.findById(s.joinCleanZoneGroupMember_id);
        const cleanZoneName = await cleanZoneModel.findById(joinGroupCleanZoneMember[0].cleanZone_id);
        const joinGroupMember = await joinGroupMemberModel.findById(joinGroupCleanZoneMember[0].joinGroupMember_id);
        const member = await memberModel.findById(joinGroupMember[0].member_id);
        const alreadyInList = sendlist.find(e => e.member.id === member.id);
        if (!alreadyInList) {
            const IsWrite = await cleanboardModel.findByMemberIdAndGroupId(member.id, joinGroupMember[0].group_id);
            sendlist.push({
                groupId: joinGroupMember[0].group_id,
                cleanzone: cleanZoneName,
                member: member,
                isCleaned: IsWrite.length > 0
            });
        }
    }

    return sendlist;
};

module.exports = getTodayCleanList;
