import { useChatContext } from "@/context/chatContext";
import { useUserContext } from "@/context/userContext";
import { IMessage } from "@/app/types/type";
import React, { use, useEffect, useLayoutEffect, useRef, } from "react";
import Sender from "../Sender/Sender";
import Receiver from "../Receiver/Receiver";


function Body() {
  const messageBodyRef = useRef(null) as any;

  const { messages, arrivedMessages } = useChatContext();
  const userId = useUserContext().user?._id;

  const scrollToBottom = (behavior: string = "smooth") => {
    if (messageBodyRef.current) {
      messageBodyRef.current.scrollTo({
        top: messageBodyRef.current.scrollHeight,
        behavior,
      });
    }
  };

  
  // Scroll nach unten nach initial load
  useLayoutEffect(() => {
    scrollToBottom("auto");
  }, []);

  useEffect(() => {
    if (arrivedMessages && arrivedMessages.sender !== userId) {
      scrollToBottom("smooth");
    }
  }, [arrivedMessages]);

  // Scroll nach unten wenn eine neue Nachricht gesendet wurde
  useEffect(() => {
    scrollToBottom("auto");
  }, [messages]);

  return (
    <div
      ref={messageBodyRef}
      className="message-body relative flex-1 p-4 overflow-y-auto"
    >
      <div className="relativ flex flex-col">
        {messages.map((message: IMessage) =>
          message.sender === userId ? (
            <div key={message?._id} className="self-end mb-2">
              <Sender
                status={message.status}
                content={message.content}
                createdAt={message.createdAt}
              />
            </div>
          ) : (
            <div key={message?._id}>
              <Receiver
                messageId={message?._id}
                content={message.content}
                createdAt={message.createdAt}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Body;
