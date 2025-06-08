const axios = require('axios');

const callAI = async () => {
  try {
    const response = await axios.post(
      'https://api.cohere.ai/v1/chat',
      {
        message: '다른 말은 하지 말고, 청소 구역을 20자 내외로 쉼표를 기준으로 6가지만 출력해줘',
        chat_history: [
          {
            role: 'USER',
            message: '너는 청소를 하기위해 어떤 구역을 청소할지 알려주는 청소 구역 추천 도우미야.',
          },
          {
            role: 'CHATBOT',
            message: '설거지하기, 테이블 정리/닦기, 쓰레기통 비우기, 먼지 제거(창틀/가구 위), 싱크대/수정 청소, 세탁기 필터 청소',
          },
          {
            role: 'USER',
            message: '다른 말은 하지 말고, 청소 구역을 20자 내외로 쉼표를 기준으로 6가지만 출력해줘',
          },
          {
            role: 'CHATBOT',
            message: '물품보관함, 복도 바닥, 화장실 내부, 샤워실 청소, 세면대 주변, 분리수거장',
          }
        ],
        model: 'command-r',
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { content: response.data.text };

  } catch (error) {
    console.error('Error calling Cohere API:', error?.response?.data || error.message);
    return null;
  }
};

module.exports = { callAI };
