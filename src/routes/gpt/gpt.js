const { OpenAI } = require("openai");

const callGPT = async() => {
    try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "너는 청소를 하기위해 어떤 구역을 청소할지 알려주는 청소 구역 추천 도우미야."},
        {role: "user", content:"다른 말은 하지 말고, 청소 구역을 20자 내외로 쉼표를 기준으로 6가지만 출력해줘"},
        {role: "assistant", content:'설거지하기, 테이블 정리/닦기, 쓰레기통 비우기, 먼지 제거(창틀/가구 위), 싱크대/수정 청소, 세탁기 필터 청소'},
        {role: "user", content: "다른 말은 하지 말고, 청소 구역을 20자 내외로 쉼표를 기준으로 6가지만 출력해줘"},
        {role: "assistant", content:'물품보관함, 복도 바닥, 화장실 내부, 샤워실 청소, 세면대 주변, 분리수거장'},
      ]

    });

    //console.log("response", response.choices[0].message);
    return response.choices[0].message;

  } 
  catch (error) {
    console.error('Error calling ChatGPT API:', error);
    return null;
  }
}

module.exports = { callGPT };