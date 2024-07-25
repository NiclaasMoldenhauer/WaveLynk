"use client";
import { useUserContext } from "@/context/userContext";
import React from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

function RegisterForm() {
  const { registerUser, userState, handlerUserInput } = useUserContext();
  const { name, email, password } = userState;
  const [showPassword, setShowPassword] = React.useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form className="m-[2rem] px-10 py-14 rounded-lg bg-[#b0bceb7c] w-full max-w-[520px] box-shadow shadow-2xl shadow-[#0000007c]">
      <div className="relative z-10">
        <h1 className="mb-2 text-center text-[1.5rem] font-medium">
          Erstelle einen Account
        </h1>
        <p className="mb-8 px-[2rem] text-center text-[#2d2c2c] text-[14px]">
          Bereits registriert?{" "}
          <a
            href="/login"
            className="font-bold text-[#625cff] hover:text-[#020299] transition-all duration-300"
          >
            Anmelden
          </a>
        </p>
        <div className="flex flex-col">
          <label htmlFor="name" className="mb-1 text-[#000000]">
            Name:
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => handlerUserInput("name")(e)}
            name="name"
            placeholder="Gernhart Reinholzen"
            className="px-4 py-3 border-[2px] rounded-md outline-[#94a2e2] text-gray-950"
          />
        </div>
        <div className="mt-[2rem] flex flex-col">
          <label htmlFor="email" className="mb-1 text-[#000000]">
            E-Mail Adresse:
          </label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => handlerUserInput("email")(e)}
            name="email"
            placeholder="Svenjamin@shemail.com"
            className="px-4 py-3 border-[2px] rounded-md outline-[#94a2e2] text-gray-950"
          />
        </div>
        <div className="relative mt-[1.5rem] flex flex-col">
          <label htmlFor="password" className="mb-1 text-[#000000]">
            Passwort:
          </label>
          <input
            type={ showPassword ? "text" : "password" }
            id="password"
            value={password}
            onChange={(e) => handlerUserInput("password")(e)}
            name="password"
            placeholder="****************"
            className="px-4 py-3 border-[2px] rounded-md outline-[#94a2e2] text-gray-950"
          />
          <button
            type="button"
            className="absolute p-1 right-4 top-[43%] text-[22px] text-[#383838] opacity-55"
          >
            {showPassword ? (
              <i className="fa-solid fa-eye-slash" onClick={togglePassword} />
            ) : (
              <i className="fa-solid fa-eye" onClick={togglePassword} />
            )}
          </button>
        </div>
        
        <div className="flex">
          <button
            type="submit"
            disabled={!name || !email || !password}
            onClick={registerUser}
            className="mt-[3rem] flex-1 px-4 py-3 font-bold bg-[#3732ce] text-white rounded-md hover:bg-[#022a99] transition-colors"
          >
            Registrieren
          </button>
        </div>
      </div>
      <img src="/123691.png" alt="" />
    </form>
  );
}

export default RegisterForm;
