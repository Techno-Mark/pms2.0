"use client";
import React, { useEffect, useState } from "react";
import "next-ts-lib/dist/index.css";
import Wrapper from "@/components/common/Wrapper";
import Navbar from "@/components/common/Navbar";
import { toast } from "react-toastify";
import { InputBase } from "@mui/material";
import FilterIcon from "@/assets/icons/FilterIcon";
import Datatable_Rating from "@/components/report/Datatable_Rating";
import Datatable_Task from "@/components/report/Datatable_Task";
import FilterDialog_Task from "../../components/report/filterDialog_Task";
import FilterDialog_Rating from "../../components/report/filterDialog_Rating";
import axios from "axios";
import SearchIcon from "@/assets/icons/SearchIcon";
import { hasPermissionWorklog } from "@/utils/commonFunction";
import { useRouter } from "next/navigation";
import ExportIcon from "@/assets/icons/ExportIcon";
import Loading from "@/assets/icons/reports/Loading";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";

const task_InitialFilter = {
  pageNo: 1,
  pageSize: 10,
  sortColumn: "",
  isDesc: true,
  globalSearch: "",
  priority: null,
  statusFilter: null,
  workType: null,
  assignedIdsForFilter: [],
  projectIdsForFilter: [],
  overDueBy: 1,
  startDate: null,
  endDate: null,
  isDownload: true,
};

const rating_InitialFilter = {
  pageNo: 1,
  pageSize: 10,
  sortColumn: "",
  isDesc: true,
  globalSearch: "",
  projects: [],
  returnTypeId: null,
  typeofReturnId: null,
  ratings: null,
  dateSubmitted: null,
  users: [],
  isDownload: true,
};

const Report = () => {
  const router = useRouter();
  const [canExport, setCanExport] = useState<boolean>(false);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isTaskClicked, setIsTaskClicked] = useState(true);
  const [isRatingClicked, setIsRatingClicked] = useState(false);
  const [currentFilterData, setCurrentFilterData] = useState<any>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (localStorage.getItem("isClient") === "true") {
      if (
        !(
          hasPermissionWorklog("", "View", "Report") &&
          (hasPermissionWorklog("Task", "View", "Report") ||
            hasPermissionWorklog("Rating", "View", "Report"))
        )
      ) {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [router]);

  const closeFilterModal = () => {
    setIsFilterOpen(false);
  };

  const getIdFromFilterDialog = (data: any) => {
    setCurrentFilterData(data);
  };

  const exportClientReport = async () => {
    try {
      setIsExporting(true);

      const token = await localStorage.getItem("token");
      const Org_Token = await localStorage.getItem("Org_Token");

      const filteredData = getFilteredData();

      const endpoint = isTaskClicked ? "task" : "rating";

      const response = await axios.post(
        `${process.env.report_api_url}/report/client/${endpoint}/export`,
        {
          ...filteredData,
          globalSearch: searchValue.trim().length > 0 ? searchValue : "",
        },
        {
          headers: { Authorization: `bearer ${token}`, org_token: Org_Token },
          responseType: "arraybuffer",
        }
      );

      handleExportResponse(response);
    } catch (error) {
      handleExportError(error);
    }
  };

  const isCurrentFilterAvailable = () => {
    return (
      typeof currentFilterData === "object" &&
      currentFilterData !== null &&
      !Array.isArray(currentFilterData)
    );
  };

  const getFilteredData = () => {
    if (isTaskClicked) {
      return isCurrentFilterAvailable()
        ? {
            ...task_InitialFilter,
            projectIdsForFilter: currentFilterData.ProjectIdsForFilter,
            workType: currentFilterData.WorkType,
            priority: currentFilterData.Priority,
            startDate: currentFilterData.StartDate,
            endDate: currentFilterData.EndDate,
          }
        : { ...task_InitialFilter };
    }
    if (isRatingClicked) {
      return isCurrentFilterAvailable()
        ? {
            ...rating_InitialFilter,
            projects: currentFilterData.Projects,
            returnTypeId: currentFilterData.ReturnTypeId,
            typeofReturnId: currentFilterData.TypeofReturnId,
            ratings: currentFilterData.Ratings,
            dateSubmitted: currentFilterData.DateSubmitted,
          }
        : { ...rating_InitialFilter };
    }
  };

  const handleExportResponse = (response: any) => {
    if (response.status === 200) {
      if (response.data.ResponseStatus === "Failure") {
        setIsExporting(false);
        toast.error("Please try again later.");
      } else {
        const blob = new Blob([response.data], {
          type: response.headers["content-type"],
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${isTaskClicked ? "Task" : "Rating"}_report.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setIsExporting(false);
      }
    } else {
      setIsExporting(false);
      toast.error("Login failed. Please try again.");
    }
  };

  const handleExportError = (error: any) => {
    setIsExporting(false);
    toast.error(error);
  };

  const handleCanExport = (arg1: boolean) => {
    setCanExport(arg1);
  };

  const handleSearchChange = (e: string) => {
    setSearch(e);
    const timer = setTimeout(() => {
      setSearchValue(e.trim());
    }, 500);
    return () => clearTimeout(timer);
  };

  return (
    <Wrapper>
      <Navbar />
      <div className="bg-white flex justify-between items-center px-[20px]">
        <div className="flex gap-[20px] items-center py-[6.5px]">
          {hasPermissionWorklog("Task", "View", "Report") && (
            <label
              onClick={() => {
                setIsTaskClicked(true);
                setIsRatingClicked(false);
                setCurrentFilterData([]);
                setSearch("");
                setSearchValue("");
              }}
              className={`py-[10px] cursor-pointer select-none ${
                isTaskClicked
                  ? "text-secondary text-[16px] font-semibold"
                  : "text-slatyGrey text-[14px]"
              }`}
            >
              Task Report
            </label>
          )}
          {hasPermissionWorklog("Task", "View", "Report") &&
            hasPermissionWorklog("Rating", "View", "Report") && (
              <span className="text-lightSilver">|</span>
            )}
          {hasPermissionWorklog("Rating", "View", "Report") && (
            <label
              onClick={() => {
                setIsRatingClicked(true);
                setIsTaskClicked(false);
                setCurrentFilterData([]);
                setSearch("");
                setSearchValue("");
              }}
              className={`py-[10px] cursor-pointer select-none ${
                isRatingClicked
                  ? "text-secondary text-[16px] font-semibold"
                  : "text-slatyGrey text-[14px]"
              }`}
            >
              Rating Report
            </label>
          )}
        </div>

        <div className="flex gap-[20px] items-center">
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
              className="cursor-pointer"
              onClick={() => setIsFilterOpen(true)}
            >
              <FilterIcon />
            </span>
          </ColorToolTip>
          <ColorToolTip title="Export" placement="top" arrow>
            <span
              className={`${canExport ? "" : "pointer-events-none opacity-50"}${
                isExporting ? "cursor-default" : "cursor-pointer"
              }`}
              onClick={canExport ? exportClientReport : undefined}
            >
              {isExporting ? <Loading /> : <ExportIcon />}
            </span>
          </ColorToolTip>
        </div>
      </div>

      {isTaskClicked && (
        <Datatable_Task
          currentFilterData={currentFilterData}
          searchValue={searchValue}
          onHandleExport={handleCanExport}
        />
      )}

      {isTaskClicked && (
        <FilterDialog_Task
          onOpen={isFilterOpen}
          onClose={closeFilterModal}
          currentFilterData={getIdFromFilterDialog}
        />
      )}

      {isRatingClicked && (
        <Datatable_Rating
          currentFilterData={currentFilterData}
          searchValue={searchValue}
          onHandleExport={handleCanExport}
        />
      )}

      {isRatingClicked && (
        <FilterDialog_Rating
          onOpen={isFilterOpen}
          onClose={closeFilterModal}
          currentFilterData={getIdFromFilterDialog}
        />
      )}
    </Wrapper>
  );
};
export default Report;
