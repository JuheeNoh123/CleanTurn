const axios = require('axios');
require('dotenv').config();

const callCohere = async () => {
  try {
    const message = `청소 구역을 20자 내외로 쉼표로 6개 추천해줘. 설명 없이. (ref: ${Math.random()})`;

    const response = await axios.post(
      'https://api.cohere.ai/v1/chat',
      {
        message: message,
        model: 'command-r',
        temperature: 0.9
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.text; // 텍스트만 반환
  } catch (error) {
    console.error('Error calling Cohere API:', error.response?.data || error.message);
    return null;
  }
};

module.exports = { callCohere };
