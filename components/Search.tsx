"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Models } from "node-appwrite";
import { useDebounce } from "use-debounce";
import Thumbnul from "./Thumbnul";
import FormatedDateTime from "./FormatedDateTime";
import { getFiles } from "@/lib/actions/file.actions";

const Search = () => {
  const [query, setQuery] = useState("");
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query");
  const [result, setResult] = useState<Models.Document[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const path = usePathname();
  const [debounceQuery] = useDebounce(query, 300);


  useEffect(() => {

    const fetchFiles =  async () => {
      if(debounceQuery.length === 0){
        setOpen(false)
        setResult([])
        return router.push(path.replace(searchParams.toString(),""))
      }
      const files = await getFiles({types: [],searchText: debounceQuery})
      setResult(files.documents)
      setOpen(true)
    }

    fetchFiles();

  },[debounceQuery])

  useEffect(() => {
    if (!searchQuery) {
      setQuery("");
    }
  }, [searchQuery]);

  const handleClickItem = (file: Models.Document) => {
    setOpen(false);
    router.push(
      `${
        file.type === "video" || file.type === "audio"
          ? "/media"
          : file.type + "s"
      }/?query=${query}`
    );
  };

  return (
    <div className="search">
      <div className="search-input-wrapper">
        <Image
          src="/assets/icons/search.svg"
          width={24}
          height={24}
          alt="search"
        />
        <Input
          type="text"
          placeholder="search"
          className="search-input"
          onChange={(e) => setQuery(e.target.value)}
        />

        {open && <ul className="search-result">
          {result.length > 0 ? (
            result.map((file) => (
              <li
                className="flex items-center justify-between"
                onClick={() => handleClickItem(file)}
                key={file.$id}
              >
                <div className="flex cursor-pointer items-center gap-4">
                  <Thumbnul
                    type={file.type}
                    extension={file.extension}
                    url={file.url}
                    className="size-9 min-w-9"
                  />
                  <p className="subtitle-2 line-clamp-1 text-light-100">
                    {file.name}
                  </p>
                </div>

                <FormatedDateTime
                  date={file.$createdAt}
                  className="caption line-clamp-1 text-light-200"
                />
              </li>
            ))
          ) : (
            <p className="empty-list">No files Found</p>
          )}
        </ul>}
      </div>
    </div>
  );
};

export default Search;
