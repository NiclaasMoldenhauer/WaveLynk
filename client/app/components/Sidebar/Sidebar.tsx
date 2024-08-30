"use client";
import { useUserContext } from "@/context/userContext";
import {
  archive,
  group,
  inbox,
  moon,
  sun,
  database,
  chat,
} from "@/utils/Icons";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { gradientText } from "@/utils/TailwindStyles";
import { useGlobalContext } from "@/context/globalContext";
import "@fortawesome/fontawesome-free/css/all.min.css";
import SearchInput from "../SearchInput/SearchInput";
import SearchResults from "../SearchResults/SearchResults";
import { IChat, IUser } from "@/app/types/type";
import { useChatContext } from "@/context/chatContext";
import ChatItem from "../ChatItem/ChatItem";
import FriendRequests from "../FriendRequests/FriendRequests";
import ProfileImage from "../ProfileImage/ProfileImage";

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
  const { user, updateUser, searchResults } = useUserContext();
  const { allChatsData, handleSelectedChat, selectedChat, isLoading } =
    useChatContext();
  const {
    currentView,
    handleViewChange,
    showProfile,
    handleProfileToggle,
    showFriendProfile,
    handleFriendProfile,
  } = useGlobalContext();

  const { photo, friendRequests } = user || {};

  // active nav Button
  const [activeNav, setActiveNav] = useState(navButtons[0].id);

  // themes
  const lightTheme = () => {
    updateUser({ theme: "light" });
  };

  const darkTheme = () => {
    updateUser({ theme: "dark" });
  };

  useEffect(() => {
    document.documentElement.className = user?.theme;
  }, [user?.theme]);

  return (
    <div className="w-[22rem] flex border-r-2 border-white dark:border-[#3C3C3C]/60">
      <div className="p-4 flex flex-col justify-between items-center border-r-2 border-white dark:border-[#3C3C3C]/60">
        <div
          className="profile flex flex-col items-center"
          onClick={() => {
            handleProfileToggle(true);
          }}
        >
          <ProfileImage
            photo={user?.photo}
            alt={user?.name || "Profilbild"}
            size={50}
          />
        </div>
        <div className="w-full relative py-4 flex flex-col items-center gap-8 text-[#454e56] text-lg border-2 border-white dark:border-[#3C3C3C]/65 rounded-[30px] shadow-sm">
          {navButtons.map((btn, i: number) => {
            return (
              <button
                key={btn.id}
                className={`${
                  activeNav === i ? `active-nav dark:${gradientText}` : ""
                } relative p-1 flex items-center text-[#454e56] dark:text-white/65`}
                onClick={() => {
                  setActiveNav(btn.id);
                  handleViewChange(btn.slug);
                  handleProfileToggle(false);
                }}
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

        {/* Theme toggle */}
        <div className="px-2 py-1 text-[#454e56] text-xl flex flex-col gap-2 border-2 border-white dark:border-[#3C3C3C]/65 rounded-[30px] shadow-sm dark:text-white/65">
          <button
            className={`${
              user?.theme === "light"
                ? `inline-block bg-clip-text text-transparent bg-gradient-to-r from-[#0e18cd] via-[#1e6bb8] to-[#368eeb]`
                : ""
            }`}
            onClick={() => lightTheme()}
          >
            {sun}
          </button>
          <span className="w-full h-[2px] bg-white dark:bg-[#3C3C3C]/60"></span>
          <button
            className={`${user?.theme === "dark" ? "text-gray-400" : ""}`}
            onClick={() => darkTheme()}
          >
            {moon}
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="pb-4 flex-1">
        <h2
          className={`px-4 mt-6 font-bold text-2xl ${gradientText} dark:text-white`}
        >
          Nachrichten
        </h2>
        <div className="px-4 mt-2">
          <SearchInput />
        </div>

        {searchResults?.data?.length > 0 && (
          <div className="mt-4">
            <h4
              className={`px-4 grid grid-cols-[22px_1fr] items-center font-bold ${gradientText} dark:text-slate-200`}
            >
              {database} Suchergebnisse
            </h4>
            <SearchResults />
          </div>
        )}

        {currentView === "all-chats" && (
          <div className="mt-8">
            <h4
              className={`px-4 grid grid-cols-[22px_1fr] items-center font-bold ${gradientText} dark:text-slate-200`}
            >
              {chat}
              <span>Alle Chats</span>
            </h4>
            <div className="mt-2">
              {isLoading ? (
                <p className="px-4 py-2 text-[#454e56] dark:text-white/65">
                  Lädt Chats...
                </p>
              ) : allChatsData && allChatsData.length > 0 ? (
                allChatsData.map((chat: IChat) => (
                  <React.Fragment key={chat._id}>
                    {chat.participantsData &&
                      chat.participantsData.map((participant: IUser) =>
                        participant && participant._id ? (
                          <ChatItem
                            key={participant._id}
                            user={participant}
                            active={
                              !showProfile && selectedChat?._id === chat._id
                            }
                            chatId={chat._id}
                            onClick={() => {
                              handleProfileToggle(false);
                              handleSelectedChat(chat);
                            }}
                          />
                        ) : null
                      )}
                  </React.Fragment>
                ))
              ) : (
                <p className="px-4 py-2 text-[#454e56] dark:text-white/65">
                  Keine Chats gefunden
                </p>
              )}
            </div>
          </div>
        )}

        {currentView === "archived" && (
          <div className="mt-8">
            <h4
              className={`px-4 grid grid-cols-[22px_1fr] items-center font-bold ${gradientText} dark:text-slate-200`}
            >
              <span>{archive}</span> <span>Archiviert</span>
            </h4>
            <div className="mt-2">
              <p className="px-4 py-2 text-[#454e56] dark:text-white/65">
                Keine archivierten Chats
              </p>
            </div>
          </div>
        )}

        {currentView === "requests" && (
          <div className="mt-8">
            <h4
              className={`px-4 grid grid-cols-[22px_1fr] items-center font-bold ${gradientText} dark:text-slate-200`}
            >
              <span className="w-[20px]">{group}</span>
              <span>Freundschaftsanfragen</span>
            </h4>
            <div className="mt-2">
              {friendRequests?.length > 0 ? (
                <FriendRequests />
              ) : (
                <p className="px-4 py-2 text-[#454e56] dark:text-white/65">
                  Keine Anfragen offen
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
