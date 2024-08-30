"use client";
import { IUser } from "@/app/types/type";
import { useUserContext } from "@/context/userContext";
import { addFriend, pending, userCheck } from "@/utils/Icons";
import Image from "next/image";
import React, { useState } from "react";
import toast from "react-hot-toast";


function SearchResults() {
  const { searchResults, sendFriendRequest } = useUserContext();
  const userId = useUserContext().user?._id;

  const [requests, setRequests] = useState({});

  const handleFriendRequest = async (recipientId: string) => {
    await sendFriendRequest({ recipientId });

    // update lokalen state für die Freundschaftsanfrage
    setRequests((prev) => ({ ...prev, [recipientId]: true }));
  };

  return (
    <div>
      <div>
        {searchResults?.data?.map((user: IUser) => {
          const { friends, friendRequests } = user;
          const isFriend = friends?.find((friend) => friend === userId);
          const requestSent =
            friendRequests.find((friend) => friend === userId) ||
            // @ts-ignore
            requests[user._id];

          return (
            <div
              key={user._id}
              className="flex justify-between items-center p-4 border-b-2 border-white
                        dark:border-[#3C3C3C]/60 hover:bg-blue-50 dark:hover:bg-white/5 transition-all duration-300 ease-in-out cursor-default"
            >
              <div className="flex gap-3">
                <Image
                  src={user?.photo}
                  alt="Profil"
                  width={40}
                  height={40}
                  className="rounded-full aspect-square object-cover"
                  style={{
                    maxWidth: "100%",
                    height: "auto"
                  }} />

                <div>
                  <h3 className="font-medium">{user?.name}</h3>
                  <p className="text-[#aaa] text-sm">
                    {friends.length === 1
                      ? `${friends.length} friend`
                      : `${friends.length} friends`}
                  </p>
                </div>
              </div>
              <div>
                {isFriend ? (
                  <button
                    className="flex justify-center items-center bg-[#454545] text-white px-4 py-2 h-[2.5rem] w-[2.5rem] rounded-full"
                    onClick={() => {
                      toast.success("Ihr seid bereits befreundet");
                    }}
                  >
                    {userCheck}
                  </button>
                ) : (
                  <button
                    className="flex justify-center items-center bg-[#7263f3] text-white px-4 py-2 h-[2.5rem] w-[2.5rem] rounded-full"
                    onClick={() => handleFriendRequest(user._id)}
                  >
                    {requestSent ? pending : addFriend}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SearchResults;
