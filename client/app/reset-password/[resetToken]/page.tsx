"use client";

import { useUserContext } from "@/context/userContext";
import React, { useState } from "react";
import toast from "react-hot-toast";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface Props {
  params: {
    resetToken: string;
  };
}

function page({ params: { resetToken } }: Props) {
  const { resetPassword } = useUserContext();

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = (e: any) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: any) => {
    setConfirmPassword(e.target.value);
  };

  const togglePassword = () => {
      setShowPassword(!showPassword);
  }

  // submit handle form
  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Die beiden Passwörter stimmen nicht überein");
      return;
    }

    resetPassword(resetToken, password);
  };

  return (
    <main className="auth-page w-full h-full flex justify-center items-center">
      <form className="m-[2rem] px-10 py-14 rounded-lg bg-[#b0bceb7c] w-full max-w-[520px]">
        <div className="relative z-10">
          <h1 className="mb-2 text-center text-[1.35rem] font-medium">
            Password Zurücksetzen
          </h1>
          <div className="relative mt-[1rem] flex flex-col">
            <label htmlFor="email" className="mb-1 text-[#000]">
              Neues Passwort
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              id="password"
              name="password"
              placeholder="****************"
              className="px-3 py-3 border-[2px] rounded-md outline-[#42a5f5] text-gray-800"
            />
            <button
              className="absolute p-1 right-4 top-[43%] text-[22px] text-[#999] opacity-55 hover:text-[#373ec8]"
              onClick={togglePassword}
              type="button"
            >
              {showPassword ? (
                <i className="fas fa-eye-slash"></i>
              ) : (
                <i className="fas fa-eye"></i>
              )}
            </button>
          </div>
          <div className="relative mt-[1rem] flex flex-col">
            <label htmlFor="email" className="mb-1 text-[#000]">
              Passwort wiederholen
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="****************"
              className="px-3 py-3 border-[2px] rounded-md outline-[#42a5f5] text-gray-800"
            />
            <button
              className="absolute p-1 right-4 top-[43%] text-[22px] text-[#999] opacity-55"
              onClick={togglePassword}
              type="button"
            >
              {showPassword ? (
                <i className="fas fa-eye-slash"></i>
              ) : (
                <i className="fas fa-eye"></i>
              )}
            </button>
          </div>
          <div className="flex">
            <button
              type="submit"
              onClick={handleSubmit}
              className="mt-[1.5rem] flex-1 px-3 py-3 font-bold bg-[#625cff] text-white rounded-md hover:bg-[#373ec8] transition colors"
            >
              Passwort zurücksetzen
            </button>
          </div>
        </div>
        <img src="../123691.png" alt="" />
      </form>
    </main>
  );
}

export default page;
