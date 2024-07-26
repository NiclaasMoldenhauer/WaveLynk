"use client";
import React from "react";
import { UserContextProvider } from "../context/userContext";
import { GlobalProvider } from "../context/globalContext";

interface Props {
  children: React.ReactNode;
}

function UserProvider({ children }: Props) {
  return (
    <UserContextProvider>
      <GlobalProvider>{children}</GlobalProvider>
    </UserContextProvider>
  );
}

export default UserProvider;
