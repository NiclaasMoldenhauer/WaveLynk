"use client";
import { searchIcon } from "@/utils/Icons";
import React, { useCallback, useEffect, useState } from "react";
import lodash from "lodash";
import { useUserContext } from "@/context/userContext";


function SearchInput() {
  const { searchUsers, searchResults, setSearchResults } = useUserContext();
  const [search, setSearch] = useState("");

  // Suchfunktion debouncen mit 500ms delay
  const debouncedSearchUsers = useCallback(
    lodash.debounce((search) => {
      searchUsers(search);
    }, 500),
    []
  );


  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.trim();
    setSearch(query);

    if (query) {
      debouncedSearchUsers(query);
    } else {
      debouncedSearchUsers.cancel();
      setSearchResults([]);
    }
  };

  // Debounce abbrechen wenn komponente unmountet wird
  useEffect(() => {
    return () => {
      debouncedSearchUsers.cancel();
    };
  }, [debouncedSearchUsers]);

  return (
    <form>
      <div className="relative">
        <span className="absolute top-1/2 pl-4 text-[#aaa] translate-y-[-50%] text-xl">
          {searchIcon}
        </span>
        <input 
          type="text"
          name="search"
          placeholder="Suche hier..."
          className="w-full pl-12 pr-2 py-[0.65rem] bg-white dark:bg-transparent border-2 border-white
            dark:border-[#3C3C3C]/60 dark:text-slate-300 rounded-xl text-gray-800  focus:outline-none focus:ring-2 focus:ring-[#ccc] focus:ring-opacity-50 transition duration-300 ease-in-out"
            value={search}
            onChange={handleSearch}
        />
      </div>
    </form>
  );
}

export default SearchInput;
