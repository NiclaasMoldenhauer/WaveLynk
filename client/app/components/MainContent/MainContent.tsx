import { lock } from "@/utils/Icons";
import { gradientText } from "@/utils/TailwindStyles";
import Image from "next/image";
import React from "react";

function MainContent() {
  return (
    <div className="h-full flex flex-col justify-center items-center">
      <div className="mt-auto flex flex-col gap-4">
        <div className="flex justify-center items-center">
          <Image
            className="drop-shadow-lg"
            src="/logo.png"
            alt="WaveLynk"
            width={120}
            height={120}
          />
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl text-center text-gray-700 dark:text-white">
            Willkommen auf{" "}
            <span className={`font-bold ${gradientText}`}>WaveLynk</span>
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300">
            Starte jetzt einen Chat mit deinen Freunden!
            <span role="img" aria-label="smile">
              😊
            </span>
            <br />
            <span>Knüpfe Kontakte und genieße den schnellen Chat.</span>
          </p>
        </div>
      </div>
      <p className="mt-auto pb-4 text-center text-gray-600 dark:text-gray-300">
        {lock} Sicherer und privater Instantmessenger.
      </p>
    </div>
  );
}

export default MainContent;
