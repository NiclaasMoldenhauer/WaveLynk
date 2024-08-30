"use client";
import { useChatContext } from "@/context/chatContext";
import { useUserContext } from "@/context/userContext";
import { formatDateBasedOnTime } from "@/utils/dates";
import { IUser, IMessage } from "@/app/types/type";
import { readReceipts } from "@/utils/Icons";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { on } from "events";

interface ChatItemProps {
  user: IUser;
  active: boolean;
  onClick: () => void;
  chatId: string;
}

function ChatItem({ user, active, onClick, chatId }: ChatItemProps) {
  const { fetchAllMessages, onlineUsers } = useChatContext();
  const { photo } = user;

  const userId = useUserContext().user._id;

  // lokaler State
  const [messages, setMessages] = useState<IMessage[]>([]);

  /* verhindern vom fetchen aller nachrichten mit jedem Render
    ---> fetch wird nur einmal aufgerufen */

  const allMessages = useCallback(async () => {
    const res = await fetchAllMessages(chatId);

    if (res) {
      setMessages(res);
    }
  }, [chatId, fetchAllMessages, setMessages]);

  useEffect(() => {
    allMessages();
  }, [chatId, allMessages]);

  const lastMessage = messages[messages.length - 1];

  const isUserOnline = onlineUsers?.find(
    (onlineUser: IUser) => onlineUser._id === user._id
  );

  return (
    <div
      className={`px-5 py-4 flex gap-2 items-center border-b-2 border-white dark:border-[#3C3C3C]/65 cursor-pointer ${
        active ? "bg-blue-100 dark:bg-white/5" : ""
      }`}
      onClick={onClick}
    >
      <div className="relative inline-block">
        <Image
          src={photo}
          alt="Profilbild"
          width={50}
          height={50}
          className="rounded-full aspect-square object-cover border-2 border-[white] dark:border-[#3C3C3C]/65 cursor-pointer
            hover:scale-110 transition-transform duration-300 ease-in-out-full"
          style={{
            maxWidth: "100%",
            height: "auto",
          }}
        />

        <div
          className={`absolute bottom-0 right-0 w-[13px] h-[13px] rounded-full border-white border-2
                    ${isUserOnline ? "bg-green-500" : "bg-red-500"}
                    `}
        ></div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">{user.name}</h4>
          <p className="text-[#aaa] text-sm">
            {formatDateBasedOnTime(lastMessage?.createdAt)}
          </p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-[#aaa]">
            {lastMessage?.sender === userId
              ? "Du: " +
                (lastMessage?.content.length > 20
                  ? lastMessage?.content.substring(0, 20) + "..."
                  : lastMessage?.content)
              : lastMessage?.content.length > 25
              ? lastMessage?.content.substring(0, 25) + "..."
              : lastMessage?.content || "Keine Nachricht"}
          </p>

          {lastMessage?.sender === userId ? (
            <div className="text-[#7263f3]">{readReceipts}</div>
          ) : (
            <div className="flex items-center justify-center w-[4px] h-[4px] bg-red-500 rounded-full"></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatItem;
