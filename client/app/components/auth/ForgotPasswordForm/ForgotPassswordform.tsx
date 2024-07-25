"use client";
import { useUserContext } from "@/context/userContext";
import React, { useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

function ForgotPasswordForm() {
  const { forgotPasswordEmail } = useUserContext();

  // state
  const [email, setEmail] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    forgotPasswordEmail(email);

    // Clear Input form
    setEmail("");
  };

  return (
    <form className="relative m-[2rem] px-10 py-14 rounded-lg bg-[#b0bceb7c] w-full max-w-[520px] box-shadow shadow-2xl shadow-[#0000007c]">
      <div className="relative z-10">
        <h1 className="mb-2 text-center text-[1.35rem] font-medium">
          Füge E-Mail zum Zurücksetzen des Passworts hinzu
        </h1>
        <div className="mt-[1.5rem] flex flex-col">
          <label htmlFor="email" className="mb-1 text-[#000]">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            name="email"
            placeholder="Mux@Mastermann.de"
            className="px-4 py-3 border-[2px] rounded-md outline-[#625cff] text-gray-800"
          />
        </div>
        <div className="flex">
          <button
            type="submit"
            onClick={handleSubmit}
            className="mt-[1.5rem] flex-1 px-4 py-3 font-bold bg-[#625cff] text-white rounded-md hover:bg-[#020299] transition-colors"
          >
            Passwort Zurücksetzen
          </button>
        </div>
      </div>
      <img src="/123691.png" alt="" />
    </form>
  );
}

export default ForgotPasswordForm;
