"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "next/navigation";
import { sortTypes } from "@/constants";

const Sort = () => {
  const path = usePathname();
  const router = useRouter();

  const handleChange = (value: string) => {
    router.push(`${path}?sort=${value}`)
  }
  return (
    <Select onValueChange={handleChange} defaultValue={sortTypes[0].value}>
      <SelectTrigger className="sort-select">
        <SelectValue placeholder={sortTypes[0].value} />
      </SelectTrigger>
      <SelectContent className="sort-select-content">
        {sortTypes.map((type) => (
          <SelectItem className="shad-select-item" key={type.label} value={type.value}>{type.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default Sort;
