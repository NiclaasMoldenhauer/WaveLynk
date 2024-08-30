import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useChatContext } from "@/context/chatContext";
import { useUserContext } from "@/context/userContext";
import Sender from "../Sender/Sender";
import Receiver from "../Receiver/Receiver";

// Define an interface for your message type
interface IMessage {
  _id: string;
  sender: string;
  content: string;
  status: string;
  createdAt: string;
}

function Body() {
  const { messages, setMessages, selectedChat, socket } = useChatContext();
  const { user } = useUserContext();
  const userId = user?._id;
  // Explicitly type the ref
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

  return (
    <div
      ref={messageBodyRef}
      className="message-body relative flex-1 p-4 overflow-y-auto"
    >
      <div className="relative flex flex-col">
        {messages.map((message: IMessage) =>
          message.sender === userId ? (
            <div key={message._id} className="self-end mb-2">
              <Sender
                status={message.status}
                content={message.content}
                createdAt={message.createdAt}
              />
            </div>
          ) : (
            <div key={message._id}>
              <Receiver
                messageId={message._id}
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
