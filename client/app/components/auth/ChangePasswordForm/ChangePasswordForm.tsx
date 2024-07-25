"use client";
import { useUserContext } from "@/context/userContext";
import React, { useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

function ChangePasswordForm() {
  const { changePassword } = useUserContext();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const currentPasswordChange = (e: any) => {
    setCurrentPassword(e.target.value);
  };

  const newPasswordChange = (e: any) => {
    setNewPassword(e.target.value);
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    changePassword(currentPassword, newPassword);

    // Clear Input form
    setCurrentPassword("");
    setNewPassword("");
  };

return (
  <form className="ml-0 mt-0 m-[2rem] px-10 py-14 rounded-lg bg-white max-w-[520px] w-full box-shadow shadow-2xl shadow-[#0000007c]">
    <div className="relative z-10">
      <h1 className="mb-2 text-center text-[1.35rem] font-medium">
        Ändere dein Passwort!
      </h1>
      <div className="relative mt-[1rem] flex flex-col">
        <label htmlFor="email" className="mb-1 text=[#999]">
          Aktuelles Passwort
        </label>
        <input
        type={showPassword ? "text" : "password"}
        value={currentPassword}
        onChange={currentPasswordChange}
        id="password"
        name="password"
        placeholder="****************"
        className="px-4 py-3 border-[2px] rounded-md text-gray-800"
      />
      <button 
      className="absolute p-1 right-4 top-[43%] text-[22px] text-[#999] opacity-45"
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
        <label htmlFor="email" className="mb-1 text=[#999]">
          Neues Passwort
        </label>
        <input
        type={showPassword ? "text" : "password"}
        value={newPassword}
        onChange={newPasswordChange}
        id="password"
        name="password"
        placeholder="****************"
        className="px-4 py-3 border-[2px] rounded-md text-gray-800" 
        />
        <button
        className="absolute p-1 right-4 top-[43%] text-[22px] text-[#999] opacity-45"
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
        className="w-full px-4 py-3 mt-[1.5rem] text-white bg-[#625cff] rounded-md hover:bg-[#020299] transition-colors"
        >
            Password Ändern
        </button>
      </div>
    </div>
    <img src="/123691.png" alt="" />
  </form>
);
}

export default ChangePasswordForm;
