import { IUser } from "@/app/types/type";
import { useChatContext } from "@/context/chatContext";
import { useGlobalContext } from "@/context/globalContext";
import { dots, searchIcon } from "@/utils/Icons";
import { formatDateLastSeen } from "@/utils/dates";
import Image from "next/image";
import React, { useEffect } from "react";
import ProfileImage from "../../ProfileImage/ProfileImage";
import { useUserContext } from "@/context/userContext";

function Header() {
  const { activeChatData, onlineUsers, socket, setOnlineUsers } =
    useChatContext();
  const { handleFriendProfile, showFriendProfile } = useGlobalContext();

  const { user, updateUser, searchResults } = useUserContext();

  const { photo, lastSeen } = activeChatData || {};

  // Check ob User online ist
  const isOnline = onlineUsers?.find(
    (user: IUser) => user?._id === activeChatData?._id
  );

  useEffect(() => {
    socket?.on("user disconnected", (updatedUser: IUser) => {
      // update online users state
      setOnlineUsers((prev: IUser[]) => {
        prev.filter((user: IUser) => user._id !== updatedUser._id);
      });

      // falls der Nutzer nicht online ist, wird er aus der Liste entfernt
      if (activeChatData?._id === updatedUser._id) {
        activeChatData.lastSeen = updatedUser.lastSeen;
      }
    });

    // cleanup function
    return () => {
      socket?.off("User disconnected");
    };
  }, [socket, activeChatData, setOnlineUsers]);

  return (
    <div className="p-4 flex justify-between border-b-2 border-white dark:border-[#3C3C3C]/60">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => handleFriendProfile(!showFriendProfile)}
      >
        <ProfileImage
          photo={activeChatData?.photo}
          alt={activeChatData?.name || "Profilbild"}
          size={50}
        />
        <div className="flex flex-col">
          <h2 className="font-bold text-xl text-[#454e56] dark:text-white">
            {activeChatData?.name}
          </h2>
          <p className="text-xs text-[#aaa]">
            {isOnline ? "Online" : formatDateLastSeen(lastSeen)}
          </p>
        </div>
      </div>
      <div></div>
      <div className="flex items-center gap-6 text-[#454e56] text-xl">
        <button className="p-1">{searchIcon}</button>
        <button className="p-1">{dots}</button>
      </div>
    </div>
  );
}

export default Header;
