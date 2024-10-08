import * as dotenv from "dotenv";
import OpenAI from "openai";
dotenv.config({ path: "./app.env" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzePlantData(plant) {
  try {
    const prompt = `식물데이터 분석:\nName: ${plant.name}\nSpecies: ${plant.species}\nTemperature: ${plant.temperature}\nHumidity: ${plant.humidity}\nLight: ${plant.light}, 한국어로 대답하고 간단하게 80자 내로 문장이 완벽하게 끝나도록 작성해줘`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: prompt }, // 사용자 메시지를 messages 배열에 추가
      ],
      max_tokens: 200,
    });

    const answer = response.choices[0].message.content;
    console.log("ChatGPT 답변:", answer);

    return answer;
  } catch (error) {
    console.error("Error analyzing plant data:", error.message);
    throw new Error("Failed to analyze plant data. Please try again later.");
  }
}
