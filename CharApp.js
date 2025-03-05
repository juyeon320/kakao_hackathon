import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ChatApp() {
  const [responses, setResponses] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  // 전화 시작 (GPT 첫 대사 생성)
  const startCall = async () => {
    const response = await fetch("http://localhost:5000/start");
    const data = await response.json();

    setResponses([{ role: "bot", content: data.text }]);
    playAudio(data.audioUrl);
  };

  // 음성 녹음 시작
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const response = await fetch("http://localhost:5000/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResponses((prev) => [...prev, { role: "user", content: "🎙️ [음성 입력]" }, { role: "bot", content: data.text }]);
      playAudio(data.audioUrl);
    };

    audioChunks.current = [];
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  // 음성 녹음 중지
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  // 음성 재생
  const playAudio = (url) => {
    const audio = new Audio(url);
    audio.play();
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <Card>
        <CardContent>
          <div className="h-64 overflow-y-auto border p-2 rounded-lg">
            {responses.map((msg, index) => (
              <div key={index} className={`p-2 ${msg.role === "user" ? "text-blue-600" : "text-red-600"}`}>
                <strong>{msg.role === "user" ? "현:" : "중국집 사장:"}</strong> {msg.content}
              </div>
            ))}
          </div>
          <Button onClick={startCall} className="mt-2">📞 전화 시작</Button>
          <Button onClick={isRecording ? stopRecording : startRecording} className="mt-2">
            {isRecording ? "⏹️ 녹음 중지" : "🎙️ 녹음 시작"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
