"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

interface ProfileImageProps {
  photo: string | undefined;
  alt: string;
  size?: number;
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  photo,
  alt,
  size = 50,
}) => {
  const [imageSrc, setImageSrc] = useState<string>("/default-avatar.png");

  useEffect(() => {
    if (photo) {
      setImageSrc(photo);
    } else {
      setImageSrc("/default-avatar.png");
    }
  }, [photo]);

  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <Image
        src={imageSrc}
        alt={alt}
        width={size}
        height={size}
        className="rounded-full aspect-square object-cover border-2 border-[white] dark:border-[#3C3C3C]/65 cursor-pointer
                hover:scale-110 transition-transform duration-300 ease-in-out"
        onError={() => setImageSrc("/default-avatar.png")}
      />
    </div>
  );
};

export default ProfileImage;
