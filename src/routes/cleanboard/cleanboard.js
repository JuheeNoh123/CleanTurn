const express = require('express');

// 모델 및 유틸 불러오기
const memberModel = require('../../models/memberModel'); 
const joinGroupCleanZoneMemberModel = require('../../models/joinCleanZoneGroupMember');
const cleanboardModel = require('../../models/cleanboardModel');
const feedbackModel = require("../../models/feedbackModel");
const Member = require("../../models/memberModel");
const getTodayCleanList = require('../cleanZone/getTodayCleanList');

const dayjs = require('dayjs');
require("dayjs/plugin/utc");
require("dayjs/plugin/timezone");
dayjs.extend(require("dayjs/plugin/utc"));
dayjs.extend(require("dayjs/plugin/timezone"));

const router = express.Router();


//청소 현황 게시판 조회
router.get('/status/:groupId', async(req,res) => {
    const {id,email} = req.user;
    console.log(id);
    const groupId = req.params.groupId;
    const sendlist = await getTodayCleanList(groupId);
    // 해당 그룹의 오늘 청소 리스트 가져오기
    console.log(sendlist);
    data = []
    data.push({"memberId": id})// 사용자 ID 포함
    let uploadButton = false;// 청소 인증 버튼 활성화 여부
    for(const sl of sendlist){
        console.log("sl",sl)
        // 그룹이 일치하는 데이터만 포함
        if (sl.groupId == groupId) {
            data.push({
                memberId: sl.member.id, 
                name: sl.member.name,
                cleanzone: sl.cleanzone.zoneName,
                isCleaned: sl.isCleaned
            });

            // 내 담당 청소구역이면서 아직 청소 안한 경우만 true
            if (sl.member.id == id && !sl.isCleaned) {
                uploadButton = true;
            }
        }
    }
        
        
    
    data.push({"uploadButton": uploadButton});// 버튼 여부 추가
    res.status(200).send(data); // 결과 전송
});

//오늘 게시판 조회
router.get('/show/:groupId', async(req,res) => { 
    try {const groupId = req.params.groupId; 
    const { id, email } = req.user;  
    // 오늘 날짜 기준 시작/끝 시간 설정 (한국 시간 기준)
    const start = dayjs().tz("Asia/Seoul").startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const end = dayjs().tz("Asia/Seoul").endOf('day').format('YYYY-MM-DD HH:mm:ss');     // 23:59:59.999

    console.log(groupId, id, start, end);

    // 게시글 조회
    const boards = await cleanboardModel.findByGroupIdAndDate(groupId, start, end);
    console.log(boards);

    const data = [];
    for (const b of boards) {
        console.log(b);
        const member = await memberModel.findById(b.member_id);
        const json = {
            boardId: b.id,
            cleanzones: [], // 게시글에 연결된 청소 구역
            memberName: member.name, // 작성자 이름
            cleantime: b.cleanTime, // 청소 시간
            imageURL: [], // 이미지 목록
            content: b.content // 게시글 내용
        };

        // 게시글에 연결된 청소 구역 이름 가져오기
        const cleanzone = await joinGroupCleanZoneMemberModel.findJoinBoardGCZMByBoardId(b.id);
        console.log(cleanzone);
        for (const c of cleanzone) {
            json.cleanzones.push(c.cleanZoneName);
        }

        // 게시글에 업로드된 이미지 가져오기
        const image = await cleanboardModel.findImageByBoardId(b.id);
        console.log(image);
        for (const i of image) {
            json.imageURL.push(i.imageName);
        }

        data.push(json);
    }

    res.status(200).send(data);}
    catch (e) {
        console.error(e);
        res.status(500)
           .header("Access-Control-Allow-Origin", "*")
           .send({ error: "서버 오류 발생" });
    }

});

// 특정 청소 게시글에 달린 피드백 모두 조회
router.get('/getallfeedback/:cleanBoard_id', async(req,res) => {
    try{
        const { id, email } = req.user;
        const cleanBoard_id = req.params.cleanBoard_id;

        // 해당 게시글의 모든 피드백 조회
        const feedbacks = await feedbackModel.findByAllFeedback(cleanBoard_id);
        
        result = [];
        for(const feedback of feedbacks) {
            const user = await Member.findById(feedback.member_id);    // 피드백 작성자 정보
            result.push({
                memberName: user.name,
                content: feedback.content
            })
        }
        return res.status(200).send(result);
    } catch {
        console.log(error);
        return res.status(500).send({message: '서버오류'});
    }

});

//피드백 작성
router.post('/feedbackmake',async(req,res)=>{
    const { id , email } = req.user;// 로그인 사용자
    const { cleanBoard_id, content } = req.body;// 작성 내용


    // 피드백 저장
    await feedbackModel.saveUserFeedback(id, cleanBoard_id, content);

    return res.status(201).send("피드백 작성 완료");
});

module.exports = router;