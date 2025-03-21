"use client";

import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { EndpointsContext } from "@/app/agent";
import { useActions } from "@/utils/client";
import { LocalContext } from "@/app/shared";
import { HumanMessageText } from "./message";
import { VoiceRecorder } from "./VoiceRecorder";

export interface ChatProps {}

function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(",")[1]);
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
      <p className="text-white">文件已上传: {file.name}</p>
    </div>
  );
}

export default function Chat() {
  const actions = useActions<typeof EndpointsContext>();
  const [elements, setElements] = useState<JSX.Element[]>([]);
  const [history, setHistory] = useState<[role: string, content: string][]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File>();

  // 添加初始欢迎消息
  useState(() => {
    setTimeout(() => {
      const welcomeMessage = (
        <div className="flex flex-col gap-1 w-full max-w-fit mr-auto" key="welcome">
          <div className="message">
            欢迎使用AI健身助手！请告诉我您的健身需求，我将为您提供个性化的建议和计划。您也可以输入"打开仪表盘"查看您的健身数据。
          </div>
        </div>
      );
      setElements([welcomeMessage]);
    }, 1000);
  });

  async function onSubmit(input: string) {
    const newElements = [...elements];
    let base64File: string | undefined = undefined;
    let fileExtension = selectedFile?.type.split("/")[1];
    if (selectedFile) {
      base64File = await convertFileToBase64(selectedFile);
    }

    // 添加用户消息到UI
    newElements.push(
      <div className="flex flex-col w-full gap-1 mt-auto" key={history.length}>
        {selectedFile && <FileUploadMessage file={selectedFile} />}
        <div className="message user-message">{input}</div>
      </div>
    );
    
    // 立即更新UI显示用户消息
    setElements(newElements);
    
    // 调用AI响应
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

    // 添加AI响应到UI
    setElements(prev => [
      ...prev,
      <div className="flex flex-col gap-1 w-full max-w-fit mr-auto" key={`ai-${history.length}`}>
        {/* 直接渲染element.ui，不添加额外的message容器 */}
        {element.ui}
      </div>
    ]);

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

    setInput("");
    setSelectedFile(undefined);
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="chat-messages" id="chatMessages">
        {elements}
      </div>
      
      <form
        onSubmit={async (e) => {
          e.stopPropagation();
          e.preventDefault();
          await onSubmit(input);
        }}
        className="input-group mt-3"
      >
        <Input
          className="form-control chat-input"
          placeholder="告诉我您的健身需求，例如：'我想开始增肌训练'"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        
        <div className="d-flex align-items-center">
          <Input
            className="d-none"
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setSelectedFile(e.target.files[0]);
              }
            }}
          />
          <label htmlFor="image" className="btn ms-2" style={{
            background: "rgba(255, 255, 255, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer"
          }}>
            <i className="fas fa-image text-white"></i>
          </label>
          
          <div className="ms-2">
            <VoiceRecorder onTextChange={setInput} />
          </div>
          
          <Button type="submit" className="btn send-btn ms-2">
            <i className="fas fa-paper-plane text-white"></i>
          </Button>
        </div>
      </form>
    </div>
  );
}