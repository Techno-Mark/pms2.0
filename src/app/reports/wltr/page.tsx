"use client";
import FilterIcon from "@/assets/icons/FilterIcon";
import SearchIcon from "@/assets/icons/SearchIcon";
import Navbar from "@/components/common/Navbar";
import Wrapper from "@/components/common/Wrapper";
import WltrProjectReportFilter from "@/components/reports/Filter/WltrProjectReportFilter";
import WltrProjectReport from "@/components/reports/tables/WltrProjectReport";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import { InputBase } from "@mui/material";
import React, { useState } from "react";

const Page = () => {
  const [search, setSearch] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [filteredData, setFilteredData] = useState<any>(null);
  const [totalQuantity, setTotalQuantity] = useState("00:00:00");
  const [totalTime, setTotalTime] = useState("00:00:00");
  const [totalSTDTime, setTotalSTDTime] = useState("00:00:00");

  const handleFilter = (arg1: boolean) => {
    setIsFiltering(arg1);
  };

  const handleFilterData = (arg1: any) => {
    setFilteredData(arg1);
  };

  const handleSearchChange = (e: any) => {
    setSearch(e.target.value);
    const timer = setTimeout(() => {
      setSearchValue(e.target.value);
    }, 500);
    return () => clearTimeout(timer);
  };

  return (
    <Wrapper>
      <div>
        <Navbar />
        <div className="w-full pr-5 flex items-center justify-between my-3">
          <div className="flex items-center justify-center gap-5 ml-4 text-darkCharcoal text-[14px]">
            <p>
              <span className="text-secondary font-semibold">Total QTY.: </span>
              {totalQuantity}
            </p>
            <p>
              <span className="text-secondary font-semibold">
                Total STD Time:
              </span>
              {totalSTDTime}
            </p>
            <p>
              <span className="text-secondary font-semibold">Total Time: </span>
              {totalTime}
            </p>
          </div>
          <div className="h-full flex items-center gap-5">
            <div className="relative">
              <InputBase
                className="pl-1 pr-7 border-b border-b-lightSilver w-52"
                placeholder="Search"
                value={search}
                onChange={(e: any) => handleSearchChange(e)}
              />
              <span className="absolute top-2 right-2 text-slatyGrey">
                <SearchIcon />
              </span>
            </div>

            <ColorToolTip title="Filter" placement="top" arrow>
              <span
                className="cursor-pointer relative"
                onClick={() => {
                  setIsFiltering(true);
                }}
              >
                <FilterIcon />
              </span>
            </ColorToolTip>
          </div>
        </div>
        <WltrProjectReport
          searchValue={searchValue}
          filteredData={filteredData}
          getTotalQuanitiy={(e: any) => setTotalQuantity(e)}
          getTotalTime={(e: any) => setTotalTime(e)}
          getTotalSTDTime={(e: any) => setTotalSTDTime(e)}
        />
        <WltrProjectReportFilter
          isFiltering={isFiltering}
          sendFilterToPage={handleFilterData}
          onDialogClose={handleFilter}
        />
      </div>
    </Wrapper>
  );
};

export default Page;
