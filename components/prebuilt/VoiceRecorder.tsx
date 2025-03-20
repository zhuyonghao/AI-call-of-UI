"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function VoiceRecorder({ onTextChange }: { onTextChange: (text: string) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef<string>("");

  // Create a function to initialize a new recognition instance
  const createRecognitionInstance = useCallback(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      // @ts-ignore
      const instance = new webkitSpeechRecognition();
      instance.continuous = true;
      instance.interimResults = true;
      instance.lang = "zh-CN"; // 设置为中文

      instance.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        onTextChange(transcript);
        
        // 重置静音计时器，因为检测到了声音
        if (transcript !== lastTranscriptRef.current) {
          lastTranscriptRef.current = transcript;
          resetSilenceTimer();
        }
      };

      instance.onerror = (event: any) => {
        console.error("语音识别错误:", event.error);
        setIsRecording(false);
        clearSilenceTimer();
      };

      instance.onend = () => {
        setIsRecording(false);
        clearSilenceTimer();
      };

      return instance;
    }
    return null;
  }, [onTextChange]);

  // 清除静音计时器
  const clearSilenceTimer = () => {
    if (silenceTimer.current) {
      clearTimeout(silenceTimer.current);
      silenceTimer.current = null;
    }
  };

  // 重置静音计时器
  const resetSilenceTimer = () => {
    clearSilenceTimer();
    
    // 如果5秒内没有新的语音输入，自动停止录音
    silenceTimer.current = setTimeout(() => {
      if (isRecording && recognitionInstance) {
        console.log("检测到5秒无声音输入，自动停止录音");
        try {
          recognitionInstance.stop();
        } catch (error) {
          console.error("停止录音时出错:", error);
        }
        setIsRecording(false);
      }
    }, 5000);
  };

  // Initialize recognition on component mount
  useEffect(() => {
    setRecognitionInstance(createRecognitionInstance());
    
    // 组件卸载时清除计时器
    return () => {
      clearSilenceTimer();
    };
  }, [createRecognitionInstance]);

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      if (recognitionInstance) {
        try {
          recognitionInstance.stop();
        } catch (error) {
          console.error("Error stopping recognition:", error);
        }
      }
      setIsRecording(false);
      clearSilenceTimer();
    } else {
      // Start recording with a fresh instance
      const newInstance = createRecognitionInstance();
      if (newInstance) {
        try {
          newInstance.start();
          setRecognitionInstance(newInstance);
          onTextChange(""); // 清空之前的文本
          lastTranscriptRef.current = ""; // 重置上次的文本
          setIsRecording(true);
          resetSilenceTimer(); // 开始录音时启动静音检测
        } catch (error) {
          console.error("Error starting recognition:", error);
        }
      } else {
        alert("您的浏览器不支持语音识别功能");
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleRecording}
      className={`voice-recorder-btn ${isRecording ? "recording" : ""}`}
      title={isRecording ? "点击停止录音" : "点击开始录音"}
    >
      {isRecording ? (
        <div className="recording-wave">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      ) : (
        <i className="fas fa-microphone text-white"></i>
      )}
    </button>
  );
}