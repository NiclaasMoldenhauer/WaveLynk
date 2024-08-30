"use client";
import { useChatContext } from "@/context/chatContext";
import { formatDateBasedOnTime } from "@/utils/dates";
import Image from "next/image";
import React from "react";
import ProfileImage from "../../ProfileImage/ProfileImage";

interface IReceiver {
  messageId: string;
  content: string;
  createdAt: string;
}

function Receiver({ messageId, content, createdAt }: IReceiver) {
  const { activeChatData } = useChatContext();
  const { photo, name } = activeChatData || {};

  return (
    <div className="mb-2">
      <div className="flex gap-3">
        <ProfileImage
          photo={photo}
          alt={name || "Profilbild"}
          size={50}
        />
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-6">
            <h4 className="font-bold text-[#454e56] dark:text-gray-200">
              {name}
            </h4>
            <p className="pt-[2px] text-[#aaa] text-xs">
              {formatDateBasedOnTime(createdAt)}
            </p>
          </div>
          <p className="py-[0.25rem] max-w-[360px] w-full self-start px-4 border-2 rounded-tr-[30px] rounded-br-[30px] rounded-bl-[30px] border-gray-200 bg-[#a3a3a358] dark:bg-[#d0557c] dark:border-[#f56693] text-[#12181b] dark:text-white shadow-xl">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Receiver;
