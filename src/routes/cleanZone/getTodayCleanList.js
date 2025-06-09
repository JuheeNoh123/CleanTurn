const memberModel = require('../../models/memberModel');
const scheduleModel = require('../../models/scheduleModel');
const speciaScheduleModel = require('../../models/specialSchedule');
const joinGroupMemberModel = require('../../models/joinGroupMemberModel');
const joinGroupCleanZoneMemberModel = require('../../models/joinCleanZoneGroupMember');
const cleanboardModel = require('../../models/cleanboardModel');
const cleanZoneModel = require('../../models/cleanZoneModel');
// 날짜/시간 라이브러리 설정
const dayjs = require('dayjs');
require("dayjs/plugin/utc");
require("dayjs/plugin/timezone");
dayjs.extend(require("dayjs/plugin/utc"));
dayjs.extend(require("dayjs/plugin/timezone"));
//해당 청소구역이 오늘 청소 완료되었는지 확인
const checkIsCleaned = async (cleanZoneName, boards, targetGroupId) => {
    for (const c of boards) {
        if (targetGroupId !== null && c.usergroup_id != targetGroupId) continue; // 그룹 검사 조건은 groupId가 있을 때만 적용

        const joinBoardczgm = await joinGroupCleanZoneMemberModel.findJoinBoardGCZMByBoardId(c.id);

        for (const b of joinBoardczgm) {
            if (b.cleanZoneName.trim() === cleanZoneName.zoneName.trim()) {
                return true;
            }
        }
    }
    return false;
};


//스케줄 아이템 처리 함수 - 청소 담당자, 구역, 완료 여부 정보 반환
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

//오늘의 청소 리스트 조회 함수
const getTodayCleanList = async (groupId = null) => {
    const today = dayjs().tz("Asia/Seoul");
    const todaySTR = today.format("YYYY-MM-DD");
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayName = days[today.day()];// 오늘 요일 이름 (ex. "MONDAY")

    const sendlist = [];// 최종 반환 리스트
    const boards = await cleanboardModel.getAll();// 모든 청소 인증 게시글 조회

    // 일반 스케줄 처리
    const schedules = await scheduleModel.getAllByDay(dayName);
    for (const s of schedules) {
        const task = await processScheduleItem(s, boards, groupId);
        console.log("task",task);
        sendlist.push(task);
    }

    // 특별 스케줄 처리 (오늘 날짜에 해당하는 경우만)
    const specialSchedules = await speciaScheduleModel.getAllByDate(todaySTR);
    for (const s of specialSchedules) {
        const joinGroupCleanZoneMember = await joinGroupCleanZoneMemberModel.findById(s.joinCleanZoneGroupMember_id);
        const cleanZoneName = await cleanZoneModel.findById(joinGroupCleanZoneMember[0].cleanZone_id);
        const alreadyInList = sendlist.find(e => e.cleanzone.id === cleanZoneName.id);
        // 이미 일반 스케줄에 포함되어 있다면 중복 추가 방지
        if (!alreadyInList) {
            const task = await processScheduleItem(s, boards,groupId);
            sendlist.push(task);
        }
    }

    return sendlist;
};

module.exports = getTodayCleanList;
