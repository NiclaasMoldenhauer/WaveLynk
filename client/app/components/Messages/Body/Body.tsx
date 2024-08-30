import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useChatContext } from "@/context/chatContext";
import { useUserContext } from "@/context/userContext";
import Sender from "../Sender/Sender";
import Receiver from "../Receiver/Receiver";

interface IMessage {
  _id: string;
  sender: string;
  content: string;
  status: string;
  createdAt: string;
  type?: 'text' | 'gif';
}

function Body() {
  const { messages, setMessages, selectedChat, socket } = useChatContext();
  const { user } = useUserContext();
  const userId = user?._id;
  const messageBodyRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
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

  // Scroll nach unten wenn eine neue Nachricht gesendet wurde
  useEffect(() => {
    scrollToBottom("auto");
  }, [messages]);

  useEffect(() => {
    if (socket) {
      socket.on("message", (newMessage: IMessage) => {
        if (newMessage.sender !== userId) {
          setMessages((prevMessages: any) => [...prevMessages, newMessage]);
        }
      });

      return () => {
        socket.off("message");
      };
    }
  }, [socket, userId, setMessages]);

  useEffect(() => {
    if (socket && selectedChat) {
      socket.emit("join chat", selectedChat._id);
    }
  }, [socket, selectedChat]);

  const renderMessage = (message: IMessage) => {
    console.log('Rendering message:', message); // Keep this log
    const MessageComponent = message.sender === userId ? Sender : Receiver;

    return (
      <div key={message._id} className={message.sender === userId ? "self-end mb-2" : "mb-2"}>
        <MessageComponent
          messageId={message._id}
          status={message.status}
          content={message.content}
          createdAt={message.createdAt}
          type={message.type || 'text'}
        />
      </div>
    );
  };

  return (
    <div
      ref={messageBodyRef}
      className="message-body relative flex-1 p-4 overflow-y-auto"
    >
      <div className="relative flex flex-col">
      {messages.map(renderMessage)}
      </div>
      <div className="relative flex flex-col">
        {messages.map((message: IMessage) =>
          message.sender === userId ? (
            <div key={message._id} className="self-end mb-2">
              <Sender
                status={message.status}
                content={message.content}
                createdAt={message.createdAt} type={"text"}              />
            </div>
          ) : (
            <div key={message._id}>
              <Receiver
                  messageId={message._id}
                  content={message.content}
                  createdAt={message.createdAt} type={"text"}              />
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Body;
