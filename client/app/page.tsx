"use client";
import Sidebar from "./components/Sidebar/Sidebar";
import useRedirect from "./hooks/useUserRedirect";

export default function Home() {
  useRedirect("/login");

  return (
    <div className="relative px-[8rem] py-10 h-full">
      <main className="h-full flex backdrop-blur-sm rounded-3xl bg-white/65 dark:bg-[#262626]/90 border-2 border-white dark:border-[#3C3C3C]/65 shadow-2xl overflow-hidden"
      >
        <Sidebar />
        <div className="flex-1 flex"></div>
      </main>
    </div>
  );
}
