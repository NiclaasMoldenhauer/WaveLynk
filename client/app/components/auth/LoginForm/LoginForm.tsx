"use client";
import { useUserContext } from "@/context/userContext";
import React from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

function LoginForm() {
  const { loginUser, userState, handlerUserInput } = useUserContext();
  const { email, password } = userState;
  const [showPassword, setShowPassword] = React.useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form className="relative m-[2rem] px-10 py-14 rounded-lg bg-[#b0bceb7c] w-full max-w-[520px] box-shadow shadow-2xl shadow-[#0000007c]">
      <div className="relative z-10">
        <h1 className="mb-2 text-center text-[1.35rem] font-medium">
          Anmelden
        </h1>
        <p className="mb-8 px-[2rem] text-center text-[#2d2c2c] text-[14px]">
          Noch nicht registriert?{" "}
          <a
            href="/register"
            className="font-bold text-[#3732ce] hover:text-[#020299] transition-all duration-300"
          >
            Registrieren
          </a>
        </p>

        <div className="flex flex-col">
          <label htmlFor="email" className="mb-1 text-[#000000]">
            Email:
          </label>
          <input
            type="text"
            id="name"
            value={email}
            onChange={(e) => handlerUserInput("email")(e)}
            name="email"
            placeholder="truckerdaddy69@godaddy.de"
            className="px-4 py-3 border-[2px] rounded-md outline-[#94a2e2] text-gray-950"
          />
        </div>
        <div className="relative mt-[1rem] flex flex-col">
          <label htmlFor="password" className="mb-1 text-[#000000]">
            Passwort:
          </label>
          <input
            type={showPassword ? "text" : "password"}
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
        <div className="mt-4 flex justify-end">
          <a
            href="/forgot-password"
            className="font-bold text-[#3732ce] hover:text-[#020299] transition-all duration-300"
          >
            Passwort vergessen?
          </a>
        </div>
        <div className="flex">
          <button
            type="submit"
            disabled={!email || !password}
            onClick={loginUser}
            className="mt-[1.5rem] flex-1 px-4 py-3 font-bold bg-[#3732ce] text-white rounded-md hover:bg-[#022a99] transition-colors"
          >
            Einloggen
          </button>
        </div>
      </div>
      <img src="/123691.png" alt="" />
    </form>
  );
}

export default LoginForm;
