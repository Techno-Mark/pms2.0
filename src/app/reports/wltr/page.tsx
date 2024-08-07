"use client";
import FilterIcon from "@/assets/icons/FilterIcon";
import SearchIcon from "@/assets/icons/SearchIcon";
import Navbar from "@/components/common/Navbar";
import Wrapper from "@/components/common/Wrapper";
import WrapperNavbar from "@/components/common/WrapperNavbar";
import WltrProjectReportFilter from "@/components/reports/Filter/WltrProjectReportFilter";
import WltrProjectReport from "@/components/reports/tables/WltrProjectReport";
import { WLTRProjectInitialParmas } from "@/utils/Types/reportTypes";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import { InputBase } from "@mui/material";
import React, { useState } from "react";

const Page = () => {
  const [search, setSearch] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [filteredData, setFilteredData] =
    useState<WLTRProjectInitialParmas | null>(null);
  const [totalQuantity, setTotalQuantity] = useState<string | number | null>(0);
  const [totalTime, setTotalTime] = useState<string | null>("00:00:00");
  const [totalSTDTime, setTotalSTDTime] = useState<string | null>("00:00:00");

  const handleFilter = (arg1: boolean) => {
    setIsFiltering(arg1);
  };

  const handleFilterData = (arg1: WLTRProjectInitialParmas) => {
    setFilteredData(arg1);
  };

  const handleSearchChange = (e: string) => {
    setSearch(e);
    const timer = setTimeout(() => {
      setSearchValue(e.trim());
    }, 500);
    return () => clearTimeout(timer);
  };

  return (
    <WrapperNavbar>
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
              onChange={(e) => handleSearchChange(e.target.value)}
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
        getTotalQuanitiy={(e: string | null | number) => setTotalQuantity(e)}
        getTotalTime={(e: string | null) => setTotalTime(e)}
        getTotalSTDTime={(e: string | null) => setTotalSTDTime(e)}
      />
      <WltrProjectReportFilter
        isFiltering={isFiltering}
        sendFilterToPage={handleFilterData}
        onDialogClose={handleFilter}
      />
    </WrapperNavbar>
  );
};

export default Page;
