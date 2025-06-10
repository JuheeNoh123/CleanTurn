const express = require('express');

const Member = require('../../models/memberModel'); 
const userGroup = require('../../models/userGroupModel');
const cleanZoneModel = require('../../models/cleanZoneModel'); 

const cleanboardModel = require("../../models/cleanboardModel");
const joinGroupMemberModel = require("../../models/joinGroupMemberModel");
const joinCleanZoneGroupMemberModel = require("../../models/joinCleanZoneGroupMember");
const scheduleModel = require("../../models/scheduleModel");
const specialScheduleModel = require("../../models/specialSchedule");

const upload = require('../../util/fileParser');
const router = express.Router();

// dayjs 설정
const dayjs = require('dayjs');
require("dayjs/plugin/utc");
require("dayjs/plugin/timezone");
dayjs.extend(require("dayjs/plugin/utc"));
dayjs.extend(require("dayjs/plugin/timezone"));

//변수처리부분 :~으로 처리
//req = 받기 res = 보내기기
//청소 인증 게시글 생성 API
router.post('/make/:groupId', upload.array('images', 2), async(req,res)=>{
    const groupId = req.params.groupId; // URL에서 groupId 추출
    console.log('업로드된 파일들:', req.files); // 요청 body에서 청소 시간 및 내용 추출
    const { cleantime, content } = req.body; // 로그인된 사용자 정보
    const { id, email } = req.user;
    console.log(id);
    // 그룹 내 해당 사용자와 매핑된 joinGroupMember 찾기
    const joingroupmember = await joinGroupMemberModel.findByGroupAndMemberId(groupId, id);
    // 해당 그룹 멤버가 담당한 청소구역 joinCleanZoneGroupMember 조회
    const joinGCZM = await joinCleanZoneGroupMemberModel.findByJoinGroupMemberId(joingroupmember[0].id);
    
    //작업 할 때 동안 기다려야하는 경우 await
    // 게시글 저장
    const [result] = await cleanboardModel.save(cleantime, content, id, groupId);
    const boardId = result.insertId;// 새로 생성된 게시글 ID

    // 업로드된 이미지들 저장
    for (const i of req.files) {
        const img = i.path;
        await cleanboardModel.saveImage(boardId, img);
    }

    // 오늘 날짜와 요일 계산
    const today = dayjs().tz("Asia/Seoul");
    const dayIndex = today.day(); // 0(일) ~ 6(토)
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const cleanzoneIdList =[]
    // 담당 청소 구역 중 오늘 정규/특별 스케줄이 있는 청소 구역만 필터링
    for (const jgczm of joinGCZM[0]){
        console.log(jgczm);
        // 정규 청소 스케줄 확인
        const schedules = await scheduleModel.findByGCZMAndDay(jgczm.id,days[dayIndex])
        console.log("schedules ",schedules);
        if (schedules.length>0){
            cleanzoneIdList.push(jgczm.cleanZone_id);
        }

        // 특별 청소 스케줄 확인
        const todayDate = today.format('YYYY-MM-DD');
        const specialschedules = await specialScheduleModel.findByDateAndJGCZM(todayDate, jgczm.id);

        //const specialschedules = await specialScheduleModel.findByDateAndJGCZM(today.toISOString().split('T')[0],jgczm.id );
        console.log("specialschedules ",specialschedules);
        if (specialschedules.length>0 && !cleanzoneIdList.includes(jgczm.cleanZone_id)){
            cleanzoneIdList.push(jgczm.cleanZone_id);
        }

        console.log("cleanzoneIdList",cleanzoneIdList);
        
    }

    // 해당 게시글에 청소 구역 이름 연결 저장
    for(const cleanzoneId of cleanzoneIdList){
            const cleanzone = await cleanZoneModel.findById(cleanzoneId);
            console.log(cleanzone);
            await joinCleanZoneGroupMemberModel.saveJoinBoardGCZM(boardId, cleanzone.zoneName);
        }
    return res.status(201).send("게시글 생성 완료");
});

module.exports = router;