"use client";
import { useUserContext } from "@/context/userContext";
import { formatDateBasedOnTime } from "@/utils/dates";
import React from "react";
import ProfileImage from "../../ProfileImage/ProfileImage";


interface ISender {
  content: React.ReactNode;
  createdAt: string;
  status: string;
  type: string;
}

function Sender({ content, createdAt, status, type }: ISender) {
  const { user } = useUserContext();
  const { photo } = user || {};

  return (
    <div className="mb-2">
      <div className="flex gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-6">
            <h4 className="font-bold text-[#454e56] dark:text-white/60">Du</h4>
            <p className="pt-[2px] text-[#aaa] text-xs">
              {formatDateBasedOnTime(createdAt)}
            </p>
          </div>
          <div
            className="py-[0.25rem] max-w-[360px] w-full self-start px-4 border-2 rounded-tr-[30px] rounded-br-[30px] rounded-bl-[30px] border-gray-200 bg-[#a3a3a358] dark:bg-[#8f43cd]  
            dark:border-[#8f43cd] text-[#12181b] dark:text-white shadow-xl"
          >
            {type === 'gif' ? (
              <img src={content as string} alt="GIF" className="max-w-full rounded-lg" />
            ) : (
              <p>{content}</p>
            )}
          </div>
        </div>
        <ProfileImage
          photo={photo}
          alt="Profilbild"
          size={50}
        />
      </div>
    </div>
  );
}

export default Sender;