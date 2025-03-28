import Markdown from "react-markdown";

export interface MessageTextProps {
  content: string;
}

export function AIMessageText(props: MessageTextProps) {
  return (
    <div className="message ai-message-container ">
     <div className="text-normal text-gray-800 text-left break-words">
        <Markdown>{props.content}</Markdown>
      </div>
    </div>
  );
}

export function HumanMessageText(props: MessageTextProps) {
  return (
    <div className="flex ml-auto w-fit max-w-[700px] bg-gray-200 rounded-md px-2 py-1">
      <p className="text-normal text-gray-800 text-left break-words">
        {props.content}
      </p>
    </div>
  );
}