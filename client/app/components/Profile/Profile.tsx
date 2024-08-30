import { useUserContext } from "@/context/userContext";
import { useEdgeStore } from "@/lib/edgestore";
import { logout } from "@/utils/Icons";
import { gradientText } from "@/utils/TailwindStyles";
import Image from "next/image";
import React, { useEffect, useState } from "react";

function Profile() {
  const { edgestore } = useEdgeStore();

  const { updateUser, changePassword, logoutUser, emailVerification  } = useUserContext();

  const photo = useUserContext().user?.photo;
  const bio = useUserContext().user?.bio;
  const name = useUserContext().user?.name;

  const [localBio, setLocalBio] = useState(bio);
  const [localName, setLocalName] = useState(name);
  const [localOldPassword, setLocalOldPassword] = useState("");
  const [localNewPassword, setLocalNewPassword] = useState("");
  const [file, setFile] = useState<File>();

  const handleInput = (name: string) => (e: any) => {
    switch (name) {
      case "name":
        setLocalName(e.target.value);
        break;
      case "bio":
        setLocalBio(e.target.value);
        break;
      case "oldPassword":
        setLocalOldPassword(e.target.value);
        break;
      case "newPassword":
        setLocalNewPassword(e.target.value);
        break;
      default:
        break;
    }
  };

  const handleUploadImage = async () => {
    if (file) {
      const res = await edgestore.publicFiles.upload({
        file,
        options: {
          temporary: false, // delete the file after 24 hours
        },
      });

      const { url } = res;

      updateUser({ photo: url });
    }
  };

  useEffect(() => {
    handleUploadImage();
  }, [file]);


  return (
    <div className="px-5 pb-5 w-[80%]">
      <h3
        className={`pt-3 pb-3 flex justify-center text-3xl font-black ${gradientText} dark:text-white`}
      >
        Mein Profil
      </h3>

      <div className="flex flex-col">
        <div className="group relative self-center">
          <Image
            src={photo}
            alt="profile"
            width={300}
            height={300}
            className="aspect-square rounded-full object-cover border-2 border-[white] cursor-pointer hover:scale-105 transition-transform
                duration-300 ease-in-out shadow-sm select-text  dark:border-[#3C3C3C]/65"
            style={{
              maxWidth: "100%",
              height: "auto"
            }} />

          <input
            type="file"
            name="file"
            id="file"
            onChange={(e) => {
              // @ts-ignore
              setFile(e.target?.files[0]);
            }}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />

          <span className="absolute top-0 w-full h-full rounded-full cursor-pointer flex items-center justify-center bg-black bg-opacity-50 text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out pointer-events-none">
            Bild ändern
          </span>
        </div>
        <form
          action=""
          onSubmit={(e) => {
            e.preventDefault();
            updateUser({ name: localName, bio: localBio });
          }}
        >
          <div className="mb-2">
            <label
              htmlFor="name"
              className={`text-xl font-semibold ${gradientText} dark:text-slate-200`}
            >
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              defaultValue={localName}
              onChange={handleInput("name")}
              className="w-full pl-4 p-2 rounded-md bg-transparent shadow-sm border-2 border-[white] focus:outline-none focus:ring-2 focus:ring-[#2575d6] focus:border-transparent
                 dark:bg-[#3C3C3C]/65 dark:border-[#3C3C3C]/65"
            />
          </div>
          <div>
            <label
              htmlFor="bio"
              className={`text-xl font-semibold ${gradientText} dark:text-slate-200`}
            >
              Bio
            </label>
            <textarea
              name="bio"
              id="bio"
              rows={3}
              defaultValue={localBio}
              onChange={handleInput("bio")}
              className="w-full pl-4 p-2 rounded-md bg-transparent dark:bg-[#3C3C3C]/65 resize-none
                  dark:border-[#3C3C3C]/65 shadow-sm border-2 border-[white] focus:outline-none focus:ring-2 focus:ring-[#2575d6] focus:border-transparent"
            ></textarea>
          </div>

          <div className="py-4 flex-auto justify-end">
            <button
              type="submit"
              className="bg-[#2575d6] text-white w-full p-2 rounded-md hover:bg-[#2225c8] transition-colors duration-300 ease-in-out"
            >
              Profil aktualisieren
            </button>
          </div>
        </form>

        <form
          action=""
          onSubmit={(e) => {
            e.preventDefault();
            changePassword(localOldPassword, localNewPassword);
            setLocalOldPassword("");
            setLocalNewPassword("");
          }}
        >
          <div className="flex gap-2">
            <div>
              <label
                htmlFor="oldPassword"
                className={`text-lg font-semibold ${gradientText} dark:text-slate-200`}
              >
                Altes Passwort
              </label>
              <input
                type="password"
                name="oldPassword"
                id="oldPassword"
                value={localOldPassword}
                onChange={handleInput("oldPassword")}
                className="w-full pl-4 p-2 rounded-md bg-transparent shadow-sm border-2 border-[white] focus:outline-none focus:ring-2 focus:ring-[#2575d6] focus:border-transparent
                  dark:bg-[#3C3C3C]/65 dark:border-[#3C3C3C]/65"
              />
            </div>
            <div>
              <label
                htmlFor="newPassword"
                className={`text-lg font-semibold ${gradientText} dark:text-slate-200`}
              >
                Neues Passwort
              </label>
              <input
                type="password"
                name="newPassword"
                id="newPassword"
                value={localNewPassword}
                onChange={handleInput("newPassword")}
                className="w-full pl-4 p-2 rounded-md bg-transparent shadow-sm border-2 border-[white] focus:outline-none focus:ring-2 focus:ring-[#2575d6] focus:border-transparent
                  dark:bg-[#3C3C3C]/65 dark:border-[#3C3C3C]/65"
              />
            </div>
          </div>
          <div className="py-4 flex-auto justify-end">
            <button className="bg-[#2575d6] text-white w-full p-2 rounded-md hover:bg-[#2225c8] transition-colors duration-300 ease-in-out">
              Password ändern
            </button>
          </div>
        </form>

        <div className="pt-4 flex justify-between">
        <button
          onClick={() => logoutUser()}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-900 transition-colors duration-300 ease-in-out"
        >
          {logout} Logout
        </button>
        <button
          onClick={() => emailVerification()}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-[#2225c8] transition-colors duration-300 ease-in-out"
        >
          E-Mail verifizieren
        </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
