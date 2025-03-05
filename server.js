import express from "express";
import cors from "cors";
import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
const PORT = 5000;
app.use(express.json());
app.use(cors());

let conversationHistory = [
  { role: "system", content: "넌 성격 나쁜 중국집 사장이다. 고객과 무례하게 응대해야 한다." }
];

// 🔹 사용자의 메시지를 받아 GPT 응답 반환
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  conversationHistory.push({ role: "user", content: userMessage });

  const gptResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: conversationHistory,
  });

  const botMessage = gptResponse.choices[0].message.content;
  conversationHistory.push({ role: "assistant", content: botMessage });

  res.json({ reply: botMessage });
});

app.listen(PORT, () => console.log(`✅ 채팅 서버 실행 중: http://localhost:${PORT}`));
