import { cn, getFileIcon } from "@/lib/utils";
import Image from "next/image";
import React from "react";

interface Props {
  type: string;
  extension: string;
  url?: string;
  imageClassName?: string;
  className?: string;
}

const Thumbnul = ({
  type,
  extension,
  url = "",
  imageClassName,
  className,
}: Props) => {
  const IsImage = type === "image" && extension !== "svg";
  return (
    <figure className={cn("thumbnail", className)}>
      <Image
        src={IsImage ? url : getFileIcon(extension, type)}
        alt="thumbnil"
        width={100}
        height={100}
        className={cn(
          "size-8 object-contain",
          imageClassName,
          IsImage && "thumbnail-image"
        )}
      />
    </figure>
  );
};

export default Thumbnul;
