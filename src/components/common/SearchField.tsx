"use client";

import React, { useState } from "react";
import { Text } from "next-ts-lib";
import "next-ts-lib/dist/index.css";

import SearchIcon from "@/assets/icons/SearchIcon";

interface MyComponentProps {
  data: any[];
}

const SearchField: React.FC<MyComponentProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredData, setFilteredData] = useState<any[]>(data);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm);
    filterData(searchTerm);
  };

  const filterData = (searchTerm: string) => {
    const filteredData = data.filter((item) => {
      return Object.values(item).some((value) => {
        if (typeof value === "string") {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      });
    });
    setFilteredData(filteredData);
  };

  return (
    <div className="relative">
      <Text
        type="text"
        className="pl-[30px] py-[11px] placeholder:text-[12px]"
        value={searchTerm}
        placeholder="Please enter value"
        onChange={handleSearch}
        getValue={() => {}}
        getError={() => {}}
      />
      <span className="absolute text-[14px] top-4 right-2">
        <SearchIcon />
      </span>
    </div>
  );
};

export default SearchField;
