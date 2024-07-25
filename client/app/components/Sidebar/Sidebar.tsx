"use client";
import { useUserContext } from "@/context/userContext";
import React, { useEffect, useState } from "react";
import { archive, group, inbox, moon, sun, database } from "@/utils/Icons";
import Image from "next/image";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { gradientText } from "@/utils/TailwindStyles";

const navButtons = [
  {
    id: 0,
    name: "All Chats",
    icon: inbox,
    slug: "all-chats",
  },
  {
    id: 1,
    name: "Archived",
    icon: archive,
    slug: "archived",
  },
  {
    id: 2,
    name: "Requests",
    icon: group,
    slug: "requests",
    notification: true,
  },
];

function Sidebar() {
  const { user, updateUser } = useUserContext();
  const { photo, friendRequests } = user;

  // active nav Button
  const [activeNav, setActiveNav] = useState(navButtons[0].id);

  // themes
  const lightTheme = () => {
    updateUser({ theme: "light" });
  };

  const darkTheme = () => {
    updateUser({ theme: "dark" });
  };

  return (
    <div className="w-[22rem] flex border-r-2 border-white dark:border-[#3C3C3C]/60">
      <div className="p-4 flex flex-col justify-between items-center border-r-2 border-white dark:border-[#3C3C3C]/60">
        <div className="profile flex flex-col items-center">
          <Image
            src={photo}
            alt="profile"
            width={50}
            height={50}
            className="aspect-square rounded-full object-cover border-2 border-white dark:border-[#3C3C3C]/65
              cursor-pointer hover:scale-110 transition-transform duration-300 ease-in-out shadow-sm select-text"
          />
        </div>
        <div className="w-full relative py-4 flex flex-col items-center gap-8 text-[#454e56] text-lg border-2 border-white dark:border-[#3C3C3C]/65 rounded-[30px] shadow-sm">
          {navButtons.map((btn) => {
            return (
              <button
                key={btn.id}
                className="relative p-1 flex items-center text-[#454e56] dark:text-white/65"
              >
                {btn.icon}

                {btn.notification && (
                  <span className="absolute -top-2 right-0 w-4 h-4 bg-[#ad0808] rounded-full flex items-center justify-center">
                    {friendRequests?.length > 0 ? friendRequests.length : "0"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="px-2 py-1 text-[#454e56] text-xl flex flex-col gap-2 border-2 border-white dark:border-[#3C3C3C]/65 rounded-[30px] shadow-sm dark:text-white/65">
          <button
            className={`${
              user?.theme === "light"
                ? `inline-block bg-clip-text text-transparent bg-gradient-to-r from-[#020299] to-[#4b36eb]`
                : ""
            }`}
          >
            {sun}
          </button>
          <span className="w-full h-[2px] bg-white dark:bg-[#3C3C3C]/60"></span>
          <button
            className={`${user?.theme === "dark" ? "text-gray-400" : ""}`}
          >
            {moon}
          </button>
        </div>
      </div>
      <div className="p-4 pb-4 flex-1"></div>
    </div>
  );
}

export default Sidebar;
