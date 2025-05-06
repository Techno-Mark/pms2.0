import FilterIcon from "@/assets/icons/FilterIcon";
import SearchIcon from "@/assets/icons/SearchIcon";
import { Delete, Edit } from "@mui/icons-material";
import { Button, InputBase, Popover, Tooltip } from "@mui/material";
import React from "react";

const FilterModel = ({
  idFilter,
  handleClickFilter,
  openFilter,
  anchorElFilter,
  handleCloseFilter,
  setIsFilterOpen,
  setCurrentFilterId,
  searchValue,
  handleSearchChangeWorklog,
  filteredFilters,
  currentFilter,
  setCurrentFilterData,
  setIsDeleteOpen,
}: {
  idFilter: string | undefined;
  handleClickFilter: (event: React.MouseEvent<HTMLButtonElement>) => void;
  openFilter: boolean;
  anchorElFilter: HTMLButtonElement | null;
  handleCloseFilter: () => void;
  setIsFilterOpen: (value: boolean) => void;
  setCurrentFilterId: (value: number) => void;
  searchValue: string;
  handleSearchChangeWorklog: (value: string) => void;
  filteredFilters: any;
  currentFilter: any;
  setCurrentFilterData: (value: any) => void;
  setIsDeleteOpen: (value: boolean) => void;
}) => {
  return (
    <div>
      <span
        aria-describedby={idFilter}
        onClick={handleClickFilter}
        className="cursor-pointer"
      >
        <FilterIcon />
      </span>

      <Popover
        id={idFilter}
        open={openFilter}
        anchorEl={anchorElFilter}
        onClose={handleCloseFilter}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <div className="flex flex-col py-2 w-[250px]">
          <span
            className="p-2 cursor-pointer hover:bg-lightGray"
            onClick={() => {
              setIsFilterOpen(true);
              setCurrentFilterId(0);
              handleCloseFilter();
            }}
          >
            Default Filter
          </span>
          <hr className="text-lightSilver mt-2" />

          <span className="py-3 px-2 relative">
            <InputBase
              className="pr-7 border-b border-b-slatyGrey w-full"
              placeholder="Search saved filters"
              inputProps={{ "aria-label": "search" }}
              value={searchValue}
              onChange={(e) => handleSearchChangeWorklog(e.target.value)}
              sx={{ fontSize: 14 }}
            />
            <span className="absolute top-4 right-3 text-slatyGrey">
              <SearchIcon />
            </span>
          </span>

          {filteredFilters.map((i: any) => {
            return (
              <div
                key={i.FilterId}
                className="group px-2 cursor-pointer bg-whiteSmoke hover:bg-lightSilver flex justify-between items-center h-9"
              >
                <span
                  className="pl-1"
                  onClick={() => {
                    setCurrentFilterData(i.AppliedFilter);
                    handleCloseFilter();
                  }}
                >
                  {i.Name}
                </span>
                <span className="flex gap-[10px] pr-[10px]">
                  <span
                    onClick={() => {
                      setCurrentFilterId(i.FilterId);
                      setIsFilterOpen(true);
                      handleCloseFilter();
                    }}
                  >
                    <Tooltip title="Edit" placement="top" arrow>
                      <Edit className="hidden group-hover:inline-block w-5 h-5 ml-2 text-slatyGrey fill-current" />
                    </Tooltip>
                  </span>
                  <span
                    onClick={() => {
                      setIsDeleteOpen(true);
                      setCurrentFilterId(i.FilterId);
                      handleCloseFilter();
                    }}
                  >
                    <Tooltip title="Delete" placement="top" arrow>
                      <Delete className="hidden group-hover:inline-block w-5 h-5 ml-2 text-slatyGrey fill-current" />
                    </Tooltip>
                  </span>
                </span>
              </div>
            );
          })}
          <hr className="text-lightSilver mt-2" />
          <Button
            onClick={() => {
              handleCloseFilter();
              setCurrentFilterData(currentFilter);
            }}
            className="mt-2"
            color="error"
          >
            clear all
          </Button>
        </div>
      </Popover>
    </div>
  );
};

export default FilterModel;
