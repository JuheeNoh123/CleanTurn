const express = require('express');
const router = express.Router();
const { callCohere } = require('../gpt/cohere');// Cohere API 호출 함수 임포트

// GET /AIcleanlist : AI가 추천하는 청소 구역 리스트를 받아옴
router.get('/AIcleanlist', async (req, res) => {
  // Cohere API 호출
  const response = await callCohere();

  if (response) {
    // 응답 문자열을 쉼표로 분리하고 앞뒤 공백 제거하여 배열 생성
    const areas = response.split(',').map(area => area.trim());
    // 성공 시 청소 구역 배열을 JSON 형태로 응답
    res.status(200).send(areas);
  } else {
    // API 호출 실패 시 에러 메시지 전송
    res.status(500).json({ error: 'Failed to get response from Cohere API' });
  }
});

module.exports = router;
