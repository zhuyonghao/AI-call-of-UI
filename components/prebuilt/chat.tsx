"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { EndpointsContext } from "@/app/agent";
import { useActions } from "@/utils/client";
import { LocalContext } from "@/app/shared";
import { HumanMessageText } from "./message";
import { VoiceRecorder } from "./VoiceRecorder";
import { useFloatingComponent } from "@/app/shared";

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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  // 添加浮动组件的钩子
  const { showFloatingComponent } = useFloatingComponent();

  // 滚动到底部的函数
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // 当消息列表变化时滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [elements]);

  // 添加初始欢迎消息
  useState(() => {
    setTimeout(() => {
      const welcomeMessage = (
        <div className="flex flex-col gap-1 w-full max-w-fit mr-auto" key="welcome">
          <div className="message">
            欢迎使用AI健身助手！请告诉我您的健身需求，我将为您提供个性化的建议和计划。
          </div>
        </div>
      );
      setElements([welcomeMessage]);
    }, 1000);
  });

  async function onSubmit(input: string) {
    // 立即清空输入框，提高用户体验
    setInput("");
    setSelectedFile(undefined);
    
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

    // 保存AI响应组件，以便后续点击时可以再次显示
    const aiResponseComponent = (
      <div className="ai-floating-component">
        {element.ui}
      </div>
    );

    // 获取lastEvent以确定响应类型
    let lastEvent = await element.lastEvent;
    const isToolResponse = typeof lastEvent === "object" && lastEvent["invokeTools"];
    
    if (isToolResponse) {
      // 如果是工具调用响应，使用浮动组件
      showFloatingComponent(aiResponseComponent);
      
      // 同时在聊天界面中也添加一个可点击的简化版本的响应
      setElements(prev => [
        ...prev,
        <div className="flex flex-col gap-1 w-full max-w-fit mr-auto" key={`ai-${history.length}`}>
          <div 
            className="message ai-message clickable-message"
            onClick={() => showFloatingComponent(aiResponseComponent)}
          >
            AI已生成响应，点击查看详细内容
          </div>
        </div>
      ]);
    } else {
      // 如果是普通文本响应，直接添加到聊天容器中
      setElements(prev => [
        ...prev,
        <div className="flex flex-col gap-1 w-full max-w-fit mr-auto" key={`ai-${history.length}`}>
          <div className="ai-floating-component">
            {element.ui}
          </div>
        </div>
      ]);
    }
    
    // 确保在添加AI响应后滚动到底部
    setTimeout(scrollToBottom, 100);

    // 更新聊天历史
    (async () => {
      if (typeof lastEvent === "object") {
        if (lastEvent["invokeModel"] && lastEvent["invokeModel"]["result"]) {
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
      <div 
        className="chat-messages custom-scrollbar" 
        id="chatMessages" 
        ref={chatContainerRef}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05)'
        }}
      >
        {elements}
      </div>
      
      {/* 表单部分 */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await onSubmit(input);
        }}
        className="input-group mt-3"
      >
        {/* 将textarea也添加自定义滚动条样式 */}
        <textarea
          className="form-control chat-input resize-none custom-scrollbar"
          placeholder="告诉我您的健身需求，例如：'我想开始增肌训练'"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          style={{ 
            minHeight: "50px", 
            maxHeight: "150px", 
            overflowY: "auto",
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05)'
          }}
          onInput={(e) => {
            // 自动调整高度
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
          }}
          onKeyDown={(e) => {
            // 按下Shift+Enter时换行，仅按Enter时提交
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (input.trim()) {
                onSubmit(input);
              }
            }
          }}
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