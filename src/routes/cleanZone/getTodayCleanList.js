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

const checkIsCleaned = async (cleanZoneName, boards, targetGroupId) => {
    console.log(cleanZoneName);
    for (const c of boards) {
        if (c.usergroup_id != targetGroupId) continue; // 🔥 그룹 검사 추가
        console.log(c);
        const joinBoardczgm = await joinGroupCleanZoneMemberModel.findJoinBoardGCZMByBoardId(c.id);
        for (const b of joinBoardczgm) {
            if (b.cleanZoneName === cleanZoneName.zoneName) {
                return true;
            }
        }
    }
    return false;
};

const processScheduleItem = async (scheduleItem, boards, targetGroupId) => {
    const joinGroupCleanZoneMember = await joinGroupCleanZoneMemberModel.findById(scheduleItem.joinCleanZoneGroupMember_id);
    const cleanZoneName = await cleanZoneModel.findById(joinGroupCleanZoneMember[0].cleanZone_id);
    const joinGroupMember = await joinGroupMemberModel.findById(joinGroupCleanZoneMember[0].joinGroupMember_id);
    const member = await memberModel.findById(joinGroupMember[0].member_id);
    
    const isCleaned = await checkIsCleaned(cleanZoneName, boards, targetGroupId);
    console.log(isCleaned);
    return {
        groupId: joinGroupMember[0].group_id,
        cleanzone: cleanZoneName,
        member: member,
        isCleaned: isCleaned
    };
};

const getTodayCleanList = async (groupId = null) => {
    const today = dayjs().tz("Asia/Seoul");
    const todaySTR = today.format("YYYY-MM-DD");
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayName = days[today.day()];

    const sendlist = [];
    const boards = await cleanboardModel.getAll();

    const schedules = await scheduleModel.getAllByDay(dayName);
    for (const s of schedules) {
        const task = await processScheduleItem(s, boards, groupId);
        console.log("task",task);
        sendlist.push(task);
    }

    const specialSchedules = await speciaScheduleModel.getAllByDate(todaySTR);
    for (const s of specialSchedules) {
        const joinGroupCleanZoneMember = await joinGroupCleanZoneMemberModel.findById(s.joinCleanZoneGroupMember_id);
        const cleanZoneName = await cleanZoneModel.findById(joinGroupCleanZoneMember[0].cleanZone_id);
        const alreadyInList = sendlist.find(e => e.cleanzone.id === cleanZoneName.id);
        
        if (!alreadyInList) {
            const task = await processScheduleItem(s, boards,groupId);
            sendlist.push(task);
        }
    }

    return sendlist;
};

module.exports = getTodayCleanList;
