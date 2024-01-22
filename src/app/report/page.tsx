/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React, { useEffect, useState } from "react";
import "next-ts-lib/dist/index.css";
import Wrapper from "@/components/common/Wrapper";
import Navbar from "@/components/common/Navbar";
import { toast } from "react-toastify";
import { TextField } from "@mui/material";
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
import { callAPI } from "@/utils/API/callAPI";

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
  const [isTaskSearch, setIsTaskSearch] = useState("");
  const [taskData, setTaskData] = useState([]);
  const [isRatingSearch, setIsRatingSearch] = useState("");
  const [ratingData, setRatingData] = useState([]);

  useEffect(() => {
    if (localStorage.getItem("isClient") === "true") {
      if (
        (hasPermissionWorklog("", "View", "Report") &&
          (hasPermissionWorklog("Task", "View", "Report") ||
            hasPermissionWorklog("Rating", "View", "Report"))) === false
      ) {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [router]);

  const handleIsTaskSearch = async (searchValue: any) => {
    const params = {
      ...task_InitialFilter,
      GlobalSearch: searchValue,
      projectIdsForFilter: currentFilterData.ProjectIdsForFilter,
      workType: currentFilterData.WorkType,
      priority: currentFilterData.Priority,
      startDate: currentFilterData.StartDate,
      endDate: currentFilterData.EndDate,
    };
    const url = `${process.env.report_api_url}/report/client/task`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setTaskData(ResponseData.List);
      } else {
        setTaskData([]);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const fetchOrgToken = async () => {
      const orgToken = await localStorage.getItem("Org_Token");
      if (orgToken && isTaskClicked) {
        if (isTaskSearch.length >= 3) {
          handleIsTaskSearch(isTaskSearch);
        } else {
          handleIsTaskSearch("");
        }
      }
    };

    fetchOrgToken();
  }, [isTaskSearch, isTaskClicked]);

  const handleIsRatingSearch = async (searchValue: any) => {
    const params = {
      ...rating_InitialFilter,
      GlobalSearch: searchValue,
      projects: currentFilterData.Projects,
      returnTypeId: currentFilterData.ReturnTypeId,
      typeofReturnId: currentFilterData.TypeofReturnId,
      ratings: currentFilterData.Ratings,
      dateSubmitted: currentFilterData.DateSubmitted,
    };
    const url = `${process.env.report_api_url}/report/client/rating`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setRatingData(ResponseData.List);
      } else {
        setRatingData([]);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const fetchOrgToken = async () => {
      const orgToken = await localStorage.getItem("Org_Token");
      if (orgToken && isRatingClicked) {
        if (isRatingSearch.length >= 3) {
          handleIsRatingSearch(isRatingSearch);
        } else {
          handleIsRatingSearch("");
        }
      }
    };

    fetchOrgToken();
  }, [isRatingSearch, isRatingClicked]);

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
          globalSearch: isTaskClicked ? isTaskSearch : isRatingSearch,
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

  //handling export on data length
  const handleCanExport = (arg1: boolean) => {
    setCanExport(arg1);
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
          {isTaskClicked && hasPermissionWorklog("Task", "View", "Report") && (
            <div className="flex items-center h-full relative">
              <TextField
                className="m-0"
                placeholder="Search"
                fullWidth
                value={isTaskSearch?.trim().length <= 0 ? "" : isTaskSearch}
                onChange={(e) => setIsTaskSearch(e.target.value)}
                margin="normal"
                variant="standard"
                sx={{ mx: 0.75, maxWidth: 300 }}
              />
              <span className="absolute right-1 pl-1">
                <SearchIcon />
              </span>
            </div>
          )}
          {isRatingClicked &&
            hasPermissionWorklog("Rating", "View", "Report") && (
              <div className="flex items-center h-full relative">
                <TextField
                  className="m-0"
                  placeholder="Search"
                  fullWidth
                  value={
                    isRatingSearch?.trim().length <= 0 ? "" : isRatingSearch
                  }
                  onChange={(e) => setIsRatingSearch(e.target.value)}
                  margin="normal"
                  variant="standard"
                  sx={{ mx: 0.75, maxWidth: 300 }}
                />
                <span className="absolute right-1 pl-1">
                  <SearchIcon />
                </span>
              </div>
            )}
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
          onSearchData={taskData}
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
          onSearchData={ratingData}
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
