const axios = require('axios');
require('dotenv').config();
// Cohere API를 호출하는 비동기 함수 정의
const callCohere = async () => {
  try {
    // API에 보낼 메시지 문자열 생성
    // Math.random()을 넣어 매번 요청이 달라지도록 함 (ref 역할)
    const message = `청소 구역을 20자 내외로 쉼표로 6개 추천해줘. 설명 없이. (ref: ${Math.random()})`;

    // Cohere의 Chat API에 POST 요청 보내기
    const response = await axios.post(
      'https://api.cohere.ai/v1/chat',// Cohere Chat API 엔드포인트
      {
        message: message,// 보낼 메시지 내용
        model: 'command-r',// 사용할 Cohere 모델명
        temperature: 0.9// 생성 결과 다양성 정도 (0~1, 높을수록 다양)
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`, // API 인증 토큰 (환경변수에서 불러옴)
          'Content-Type': 'application/json' // API 인증 토큰 (환경변수에서 불러옴)
        }
      }
    );

    
    return response.data.text; // 텍스트만 반환
  } catch (error) {
    // API 호출 실패 시 에러 내용 로그 출력
    console.error('Error calling Cohere API:', error.response?.data || error.message);
    return null;// 에러 발생 시 null 반환
  }
};

module.exports = { callCohere };// 외부에서 이 함수를 사용할 수 있도록 모듈로 내보내기
