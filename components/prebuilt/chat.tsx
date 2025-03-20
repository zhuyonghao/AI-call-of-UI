"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { EndpointsContext } from "@/app/agent";
import { useActions } from "@/utils/client";
import { LocalContext } from "@/app/shared";
import { HumanMessageText } from "./message";
import { Mic, MicOff } from "lucide-react";
import CryptoJS from 'crypto-js';

export interface ChatProps {}

// 讯飞API配置
const APPID = "d8c966fa";
const API_SECRET = "ZTVhYTJiMmNhYTIxYzMwZjM1OGE1ZWI3";
const API_KEY = "afc492d830f27af65707720e2bb8dd13";

function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(",")[1]); // Remove the data URL prefix
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

function FileUploadMessage({ file }: { file: File }) {
  return (
    <div className="flex w-full max-w-fit ml-auto">
      <p>File uploaded: {file.name}</p>
    </div>
  );
}

// 获取WebSocket URL
function getWebSocketUrl() {
  const url = "wss://iat-api.xfyun.cn/v2/iat";
  const host = "iat-api.xfyun.cn";
  const apiKey = API_KEY;
  const apiSecret = API_SECRET;
  const date = new Date().toGMTString();
  const algorithm = "hmac-sha256";
  const headers = "host date request-line";
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`;
  
  // 移除这一行
  // const CryptoJS = require('crypto-js');
  
  const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
  const signature = CryptoJS.enc.Base64.stringify(signatureSha);
  const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
  const authorization = btoa(authorizationOrigin);
  return `${url}?authorization=${authorization}&date=${date}&host=${host}`;
}

// 将ArrayBuffer转换为Base64
function toBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export default function Chat() {
  const actions = useActions<typeof EndpointsContext>();

  const [elements, setElements] = useState<JSX.Element[]>([]);
  const [history, setHistory] = useState<[role: string, content: string][]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File>();
  
  // 语音识别相关状态
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recognizedText, setRecognizedText] = useState("");
  
  // WebSocket和录音相关引用
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 添加临时结果状态
  const [recognizedTextTemp, setRecognizedTextTemp] = useState("");

  // 添加音频处理相关状态
  const [resultText, setResultText] = useState("");
  const [resultTextTemp, setResultTextTemp] = useState("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamSource | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // 修改状态管理
  const [btnStatus, setBtnStatus] = useState("CLOSED"); // "UNDEFINED" "CONNECTING" "OPEN" "CLOSING" "CLOSED"
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 添加状态变更函数
  function changeBtnStatus(status: string) {
    setBtnStatus(status);
    if (status === "CONNECTING") {
      setResultText("");
      setResultTextTemp("");
      setInput("");
    } else if (status === "OPEN") {
      startCountdown();
    }
  }

  // 添加倒计时函数
  function startCountdown() {
    let seconds = 60;
    setRecordingTime(seconds);
    countdownIntervalRef.current = setInterval(() => {
      seconds = seconds - 1;
      if (seconds <= 0) {
        stopRecording();
      } else {
        setRecordingTime(seconds);
      }
    }, 1000);
  }

  // 添加 useRef 来跟踪状态
  const resultTextRef = useRef("");
  const resultTextTempRef = useRef("");

  // 添加状态同步的 useEffect
  useEffect(() => {
    resultTextRef.current = resultText;
  }, [resultText]);

  useEffect(() => {
    resultTextTempRef.current = resultTextTemp;
  }, [resultTextTemp]);

  // 修改开始录音函数
  async function startRecording() {
    try {
      const websocketUrl = getWebSocketUrl();
      const ws = new WebSocket(websocketUrl);
      wsRef.current = ws;
      
      changeBtnStatus("CONNECTING");
      setIsRecording(true);

      // 获取麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1
        } 
      });
      
      // 创建音频处理上下文
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(2048, 1, 1); // 修改为2048
      
      audioContextRef.current = audioContext;
      sourceRef.current = source;
      processorRef.current = processor;

      // 处理音频数据
      processor.onaudioprocess = (e) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcmData[i] = Math.min(1, Math.max(-1, inputData[i])) * 0x7FFF;
          }
          
          wsRef.current.send(JSON.stringify({
            data: {
              status: 1,
              format: "audio/L16;rate=16000",
              encoding: "raw",
              audio: toBase64(pcmData.buffer),
            },
          }));
        }
      };

      // 连接音频节点
      source.connect(processor);
      processor.connect(audioContext.destination);

      ws.onopen = () => {
        // 发送初始化参数
        const params = {
          common: { app_id: APPID },
          business: {
            language: "zh_cn",
            domain: "iat",
            accent: "mandarin",
            vad_eos: 5000,
            dwa: "wpgs",
          },
          data: {
            status: 0,
            format: "audio/L16;rate=16000",
            encoding: "raw",
          },
        };
        ws.send(JSON.stringify(params));
        changeBtnStatus("OPEN");
      };

      // 处理识别结果
      ws.onmessage = (e) => {
        const jsonData = JSON.parse(e.data);
        if (jsonData.data && jsonData.data.result) {
          const data = jsonData.data.result;
          let str = "";
          const ws = data.ws;
          for (let i = 0; i < ws.length; i++) {
            str = str + ws[i].cw[0].w;
          }
          
          // 使用 ref 获取最新状态值
          const currentResultText = resultTextRef.current;
          const currentResultTextTemp = resultTextTempRef.current;

          if (data.pgs) {
            if (data.pgs === "apd") {
              // 将临时结果合并到最终结果
              setResultText(currentResultTextTemp);
              // 生成新的临时结果
              const newText = currentResultTextTemp + str;
              setResultTextTemp(newText);
              setInput(newText);
            } else if (data.pgs === "rpl") {
              // 处理替换逻辑
              const newText = currentResultText + str;
              setResultTextTemp(newText);
              setInput(newText);
            }
          } else {
            // 最终结果处理
            const finalText = currentResultText + str;
            setResultText(finalText);
            setInput(finalText);
            setResultTextTemp(""); // 清空临时结果
          }
        }

        if (jsonData.code === 0 && jsonData.data.status === 2) {
          stopRecording();
        }
        if (jsonData.code !== 0) {
          console.error(jsonData);
          stopRecording();
        }
      };

      ws.onerror = (e) => {
        console.error("WebSocket错误:", e);
        stopRecording();
      };

      ws.onclose = () => {
        stopRecording();
      };

      // 处理音频数据
      processor.onaudioprocess = (e) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcmData[i] = Math.min(1, Math.max(-1, inputData[i])) * 0x7FFF;
          }
          
          wsRef.current.send(JSON.stringify({
            data: {
              status: 1,
              format: "audio/L16;rate=16000",
              encoding: "raw",
              audio: toBase64(pcmData.buffer),
            },
          }));
        }
      };

    } catch (error) {
      console.error("启动录音失败:", error);
      stopRecording();
    }
  }

  // 修改停止录音函数
  function stopRecording() {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        data: {
          status: 2,
          format: "audio/L16;rate=16000",
          encoding: "raw",
          audio: "",
        },
      }));
      changeBtnStatus("CLOSING");
      wsRef.current.close();
    }
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    setIsRecording(false);
    changeBtnStatus("CLOSED");
  }

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  async function onSubmit(input: string) {
    const newElements = [...elements];
    let base64File: string | undefined = undefined;
    let fileExtension = selectedFile?.type.split("/")[1];
    if (selectedFile) {
      base64File = await convertFileToBase64(selectedFile);
    }

    const element = await actions.agent({
      input,
      chat_history: history,
      file:
        base64File && fileExtension
          ? {
              base64: base64File,
              extension: fileExtension,
            }
          : undefined,
    });

    newElements.push(
      <div className="flex flex-col w-full gap-1 mt-auto" key={history.length}>
        {selectedFile && <FileUploadMessage file={selectedFile} />}
        <HumanMessageText content={input} />
        <div className="flex flex-col gap-1 w-full max-w-fit mr-auto">
          {element.ui}
        </div>
      </div>,
    );

    // consume the value stream to obtain the final value
    // after which we can append to our chat history state
    (async () => {
      let lastEvent = await element.lastEvent;
      if (typeof lastEvent === "object") {
        if (lastEvent["invokeModel"]["result"]) {
          setHistory((prev) => [
            ...prev,
            ["user", input],
            ["assistant", lastEvent["invokeModel"]["result"]],
          ]);
        } else if (lastEvent["invokeTools"]) {
          setHistory((prev) => [
            ...prev,
            ["user", input],
            [
              "assistant",
              `Tool result: ${JSON.stringify(lastEvent["invokeTools"]["toolResult"], null)}`,
            ],
          ]);
        } else {
          console.log("ELSE!", lastEvent);
        }
      }
    })();

    setElements(newElements);
    setInput("");
    setSelectedFile(undefined);
  }

  return (
    <div className="w-[70vw] overflow-y-scroll h-[80vh] flex flex-col gap-4 mx-auto border-[1px] border-gray-200 rounded-lg p-3 shadow-sm bg-gray-50/25">
      <LocalContext.Provider value={onSubmit}>
        <div className="flex flex-col w-full gap-1 mt-auto">{elements}</div>
      </LocalContext.Provider>
      <form
        onSubmit={async (e) => {
          e.stopPropagation();
          e.preventDefault();
          await onSubmit(input);
        }}
        className="w-full flex flex-row gap-2"
      >
        <Input
          placeholder="What's the weather like in San Francisco?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="w-[300px]">
          <Input
            placeholder="Upload"
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setSelectedFile(e.target.files[0]);
              }
            }}
          />
        </div>
        <Button 
          type="button" 
          onClick={isRecording ? stopRecording : startRecording}
          className={isRecording ? "bg-red-500 hover:bg-red-600" : ""}
        >
          {isRecording ? (
            <>
              <MicOff className="mr-2 h-4 w-4" />
              停止录音 ({recordingTime}s)
            </>
          ) : (
            <>
              <Mic className="mr-2 h-4 w-4" />
              开始录音
            </>
          )}
        </Button>
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}