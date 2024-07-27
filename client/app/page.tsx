"use client";
import useRedirect from "./hooks/useUserRedirect";
import Sidebar from "./components/Sidebar/Sidebar";
import { useGlobalContext } from "@/context/globalContext";
import MainContent from "./components/MainContent/MainContent";
import Header from "./components/Messages/Header/Header";
import Body from "./components/Messages/Body/Body";
import { useChatContext } from "@/context/chatContext";
import TextArea from "./components/Messages/TextArea/TextArea";
import Profile from "./components/Profile/Profile";
import Online from "./components/Online/Online";
import FriendProfile from "./components/FriendProfile/FriendProfile";

export default function Home() {
  useRedirect("/login");

  const { currentView, showFriendProfile, showProfile } = useGlobalContext();
  const { selectedChat } = useChatContext();

  
  return (
    <div className="relative px-[5rem] py-7 h-full">
      <main
        className="h-full flex backdrop-blur-sm rounded-3xl bg-white/65 dark:bg-[#262626]/90 border-2 border-white 
      dark:border-[#3C3C3C]/65 shadow-2xl overflow-hidden"
      >
        <Sidebar />
        <div className="flex-1 flex">
          <div className="relative flex-1 border-r-2 border-white dark:border-[#3C3C3C]/60">
            {/* Default Content */}
            {!showProfile && !selectedChat && <MainContent />}

            {!showProfile && selectedChat && <Header />}
            {!showProfile && showFriendProfile && <Body />}
            <div className="absolute w-full px-4 pb-4 left-0 bottom-0">
              {!showProfile && selectedChat && <TextArea />}
            </div>

            {showProfile && (
              <div className="flex flex-col items-center justify-center h-full">
                <Profile />
              </div>
            )}
          </div>
          <div className="w-[30%]">
            {!showFriendProfile && <Online />}
            {showFriendProfile && <FriendProfile />}
          </div>
        </div>
      </main>
    </div>
  );
}
