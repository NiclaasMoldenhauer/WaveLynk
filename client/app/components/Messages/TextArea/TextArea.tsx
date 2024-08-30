"use client"
import { send } from "@/utils/Icons";
import React, { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { useChatContext } from "@/context/chatContext";
import useDetectOutsideClick from "@/app/hooks/useDetectOutsideClick";
import { useUserContext } from "@/context/userContext";

function TextArea() {
  const { selectedChat, sendMessage, activeChatData, socket } = useChatContext();
  const user = useUserContext().user;

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const emojiElemRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState("");
  const [toggleEmoji, setToggleEmoji] = useState(false);

  useDetectOutsideClick(emojiElemRef, setToggleEmoji);

  const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleToggleEmoji = () => {
    setToggleEmoji(true);
  };

  // auto resize textarea
  const autoResize = () => {
    const textArea = textAreaRef.current;

    if (textArea) {
      textArea.style.height = "auto"; // Reset height
      textArea.style.height = `${textArea.scrollHeight}px`; // Set new height

      if (textArea.scrollHeight > 350) {
        textArea.style.overflow = "auto";
        textArea.style.height = "350px";
      } else {
        textArea.style.overflow = "hidden";
      }
    }
  };

  useEffect(() => {
    setToggleEmoji(false);
    setMessage("");
  }, [selectedChat]);

  useEffect(() => {
    autoResize();
  }, [message]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && socket) {
      const newMessage = {
        sender: user?._id,
        receiver: activeChatData?._id,
        content: message,
        chatId: selectedChat?._id,
      };
      sendMessage(newMessage);
      socket.emit("new message", newMessage);
      setMessage("");
    }
  };

  return (
    <form className="relative flex items-center" onSubmit={handleSendMessage}>
      <div className="relative flex-1">
        <textarea
          className="textarea w-full px-4 py-3 border-2 rounded-[30px] border-white bg-[#F6F5F9] dark:bg-[#262626] dark:text-gray-100 text-[#12181b] dark:border-[#3C3C3C]/65 
          shadow-sm resize-none focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#ccc] focus:ring-opacity-50 transition duration-300 ease-in-out"
          rows={1}
          value={message}
          ref={textAreaRef}
          onChange={handleOnChange}
        ></textarea>
        <button
          type="button"
          className="absolute top-[22px] right-3 text-[#aaa] translate-y-[-50%] text-2xl"
          onClick={handleToggleEmoji}
        >
          🥹
        </button>
        {!message && (
          <span className="absolute text-sm top-[46%] left-4 text-[#aaa] translate-y-[-50%] pointer-events-none">
            Schreibe eine Nachricht...
          </span>
        )}
      </div>
      <button
        type="submit"
        disabled={!message || !message.trim()}
        className="px-4 self-start py-2 w-12 h-12 bg-[#7263f3] text-white rounded-full ml-2 shadow-sm"
      >
        {send}
      </button>
      {toggleEmoji && (
        <div ref={emojiElemRef} className="absolute right-0 bottom-[72px] z-10">
          <EmojiPicker
            onEmojiClick={(emojiObject) => {
              setMessage((prev: string) => prev + emojiObject.emoji);
            }}
          />
        </div>
      )}
    </form>
  );
}

export default TextArea;
