"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import AddPlusIcon from "@/assets/icons/AddPlusIcon";
import ExportIcon from "@/assets/icons/ExportIcon";
import FilterIcon from "@/assets/icons/FilterIcon";
import ImportIcon from "@/assets/icons/ImportIcon";
import { Delete, Edit } from "@mui/icons-material";
import { Button, Popover, Tooltip, InputBase } from "@mui/material";
import { toast } from "react-toastify";
import DrawerOverlay from "@/components/settings/drawer/DrawerOverlay";
import Datatable from "@/components/worklogs/Datatable";
import Drawer from "@/components/worklogs/Drawer";
import FilterDialog from "@/components/worklogs/FilterDialog";
import Navbar from "@/components/common/Navbar";
import Wrapper from "@/components/common/Wrapper";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
import { hasPermissionWorklog } from "@/utils/commonFunction";
import SearchIcon from "@/assets/icons/SearchIcon";
import UnassigneeDatatable from "@/components/worklogs/Unassignee/UnassigneeDatatable";
import ImportDialog from "@/components/worklogs/worklogs_Import/ImportDialog";
import IdleTimer from "@/components/common/IdleTimer";
import Loading from "@/assets/icons/reports/Loading";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import { callAPI } from "@/utils/API/callAPI";
import TaskEditDrawer from "@/components/worklogs/TaskEditDrawer";
import TimelineFilterDialog from "@/components/worklogs/HalfDay/TimelineFilterDialog";
import TimelineHalfDay from "@/components/worklogs/HalfDay/TimelineHalfDay";
import UnassigneeFilterDialog from "@/components/worklogs/Unassignee/UnassigneeFilterDialog";
import TimelineDatatable from "@/components/worklogs/HalfDay/TimelineDatatable";
import {
  AppliedFilterWorklogsPage,
  FilterWorklogsPage,
} from "@/utils/Types/worklogsTypes";
import HistoryDatatable from "@/components/worklogs/TaskHistory/HistoryDatatable";
import HistoryFilterDialog from "@/components/worklogs/TaskHistory/HistoryFilterDialog";
import NotificationDrawer from "@/components/common/NotificationDrawer";

interface BreakData {
  BreakId: null | number;
  IsStared: boolean;
  TotalTime: null | string;
}

const initialFilter = {
  ClientId: null,
  TypeOfWork: null,
  ProjectId: null,
  StatusId: null,
  AssignedTo: null,
  AssignedBy: null,
  DueDate: null,
  StartDate: null,
  EndDate: null,
  ReviewStatus: null,
};

const exportBodyTask = {
  PageNo: 1,
  PageSize: 50000,
  SortColumn: "",
  IsDesc: true,
  GlobalSearch: "",
  ClientId: null,
  TypeOfWork: null,
  ProjectId: null,
  StatusId: null,
  AssignedTo: null,
  AssignedBy: null,
  DueDate: null,
  StartDate: null,
  EndDate: null,
  ReviewStatus: null,
};

const exportBodyTimeline = {
  PageNo: 1,
  PageSize: 50000,
  SortColumn: "",
  IsDesc: true,
  GlobalSearch: "",
  ClientId: null,
  ProjectId: null,
  StartDate: null,
  EndDate: null,
  ReceivedFrom: null,
  ReceivedTo: null,
  IsDownload: true,
};

const exportBodyHistory = {
  PageNo: 1,
  PageSize: 50000,
  SortColumn: "",
  IsDesc: true,
  GlobalSearch: "",
  ClientId: null,
  ProjectId: null,
  TypeOfWork: null,
  Department: null,
  ProcessId: null,
  StatusIds: [],
  AssignedBy: null,
  ReviewerId: null,
  ManagerId: null,
  StartDate: null,
  EndDate: null,
};

const Page = () => {
  const router = useRouter();
  const [isLoadingWorklogsDatatable, setIsLoadingWorklogsDatatable] =
    useState(false);
  const [timeValue, setTimeValue] = useState<string | null>(null);
  const [todayTimeValue, setTodayTimeValue] = useState<string | null>(null);
  const [breakTimeValue, setBreakTimeValue] = useState<string | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [hasEdit, setHasEdit] = useState(0);
  const [hasRecurring, setHasRecurring] = useState(false);
  const [hasComment, setHasComment] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [dataFunction, setDataFunction] = useState<(() => void) | null>(null);
  const [filterList, setFilterList] = useState<FilterWorklogsPage[] | []>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [currentFilterId, setCurrentFilterId] = useState<number>(0);
  const [clickedFilterId, setclickedFilterId] = useState<number>(0);
  const [searchValue, setSearchValue] = useState("");
  const [search, setSearch] = useState("");
  const [globalSearchValue, setGlobalSearchValue] = useState("");
  const [currentFilterData, setCurrentFilterData] = useState<
    AppliedFilterWorklogsPage | any
  >([]);
  const [currentFilterWithoutSaveData, setCurrentFilterWithoutSaveData] =
    useState<any>([]);
  const [breakId, setBreakID] = useState<number>(0);
  const [loaded, setLoaded] = useState(false);
  const [isTimelineClicked, setIsTimelineClicked] = useState(false);
  const [isTaskClicked, setIsTaskClicked] = useState(true);
  const [isUnassigneeClicked, setIsUnassigneeClicked] = useState(false);
  const [isHistoryClicked, setIsHistoryClicked] = useState(false);
  const [hasId, setHasId] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [canExport, setCanExport] = useState<boolean>(false);
  const [isHalfDay, setIsHalfDay] = useState<boolean>(false);
  const [emailNotificationOpen, setEmailNotificationOpen] = useState(false);

  const [anchorElFilter, setAnchorElFilter] =
    React.useState<HTMLButtonElement | null>(null);

  const openFilter = Boolean(anchorElFilter);
  const idFilter = openFilter ? "simple-popover" : undefined;

  const handleClickFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElFilter(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setAnchorElFilter(null);
  };

  const handleSearchChangeWorklog = (e: string) => {
    setSearchValue(e);
  };

  useEffect(() => {
    if (localStorage.getItem("isClient") === "false") {
      if (!hasPermissionWorklog("", "View", "WorkLogs")) {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [router]);

  const filteredFilters = filterList.filter((filter: FilterWorklogsPage) =>
    filter.Name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
  };

  const handleDataFetch = (getData: () => void) => {
    setDataFunction(() => getData);
  };

  const handleUserDetailsFetch = (getData: () => void) => {
    setLoaded(true);
  };

  const handleIsEdit = (value: boolean) => {
    setIsEdit(value);
  };

  const handleDrawerOpen = () => {
    setOpenDrawer(true);
  };

  const handleDrawerClose = () => {
    setIsEdit(false);
    setOpenDrawer(false);
    setHasEdit(0);
    setHasRecurring(false);
    setHasComment(false);
    setHasId("");
    setGlobalSearchValue("");
    setSearch("");
  };

  const handleEdit = (rowData: number) => {
    setHasEdit(rowData);
    setOpenDrawer(true);
  };

  const handleSetRecurring = (rowData: boolean, selectedId: number) => {
    setHasRecurring(true);
    setOpenDrawer(rowData);
    setHasEdit(selectedId);
  };

  const handleSetComments = (rowData: boolean, selectedId: number) => {
    setHasComment(true);
    setOpenDrawer(rowData);
    setHasEdit(selectedId);
  };

  const closeFilterModal = () => {
    setIsFilterOpen(false);
  };

  const closeHalfDayModal = () => {
    setIsHalfDay(false);
  };

  const getFilterList = async () => {
    const params = {
      type: 1,
    };
    const url = `${process.env.worklog_api_url}/filter/getfilterlist`;
    const successCallback = (
      ResponseData: FilterWorklogsPage[] | [],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setFilterList(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const deleteFilter = async (FilterId: number) => {
    const params = {
      filterId: FilterId,
    };
    const url = `${process.env.worklog_api_url}/filter/delete`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Filter has been deleted successfully.");
        setCurrentFilterId(0);
        getFilterList();
        setCurrentFilterData(initialFilter);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    getFilterList();
  }, []);

  const getIdFromFilterDialog = (data: AppliedFilterWorklogsPage) => {
    setCurrentFilterData(data);
  };

  const getIdFromFilterWithoutSaveDialog = (data: any) => {
    setCurrentFilterWithoutSaveData(data);
  };

  const getBreakData = async () => {
    const params = {};
    const url = `${process.env.worklog_api_url}/workitem/break/getbyuser`;
    const successCallback = (
      ResponseData: BreakData,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        if (ResponseData.BreakId === null) {
          setBreakID(0);
        } else if (ResponseData.IsStared && ResponseData.BreakId !== null) {
          setBreakID(ResponseData.BreakId);
        }
      }
    };
    callAPI(url, params, successCallback, "GET");
  };

  const setBreak = async () => {
    setIsLoadingWorklogsDatatable(true);
    const params = {
      breakId: breakId,
    };
    const url = `${process.env.worklog_api_url}/workitem/break/setbreak`;
    const successCallback = (
      ResponseData: number,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        getBreakData();
        setBreakID((prev) => (ResponseData === prev ? 0 : ResponseData));
        setIsLoadingWorklogsDatatable(false);
      } else {
        setIsLoadingWorklogsDatatable(false);
        getBreakData();
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    getBreakData();
  }, []);

  const handleCanExport = (arg1: boolean) => {
    setCanExport(arg1);
  };

  const handleExport = async () => {
    setIsExporting(true);
    const token = localStorage.getItem("token");
    const Org_Token = localStorage.getItem("Org_Token");
    const api = isTaskClicked
      ? "workitem/getexportexcellist"
      : isTimelineClicked
      ? "workitem/timeline/export"
      : "workitem/history/export";

    const exportBody = isTaskClicked
      ? { ...exportBodyTask, ...currentFilterData }
      : isTimelineClicked
      ? { ...exportBodyTimeline, ...currentFilterWithoutSaveData }
      : { ...exportBodyHistory, ...currentFilterWithoutSaveData };

    const response = await axios.post(
      `${process.env.worklog_api_url}/${api}`,
      {
        ...exportBody,
        ...currentFilterData,
        GlobalSearch: globalSearchValue,
      },
      {
        headers: {
          Authorization: `bearer ${token}`,
          org_token: Org_Token,
        },
        responseType: "arraybuffer",
      }
    );
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
        a.download = `${
          isTaskClicked
            ? "Worklog_report.xlsx"
            : isTimelineClicked
            ? "Timeline_report.xlsx"
            : "History_report.xlsx"
        }`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setIsExporting(false);
        setIsExporting(false);
      }
    } else {
      setIsExporting(false);
      toast.error("Failed to download, please try again later.");
    }
  };

  const handleSearchChange = (e: string) => {
    setSearch(e);
    const timer = setTimeout(() => {
      setGlobalSearchValue(e.trim());
    }, 500);
    return () => clearTimeout(timer);
  };

  return (
    <Wrapper>
      <IdleTimer onIdle={() => window.location.reload()} />
      <div>
        <Navbar
          onUserDetailsFetch={handleUserDetailsFetch}
          setEmailNotificationOpen={setEmailNotificationOpen}
        />
        <div className="bg-white flex justify-between items-center px-[20px]">
          <div className="flex gap-[10px] items-center py-[6.5px]">
            <label
              onClick={() => {
                setGlobalSearchValue("");
                setSearch("");
                setIsTimelineClicked(true);
                setIsTaskClicked(false);
                setIsUnassigneeClicked(false);
                setIsHistoryClicked(false);
                setCurrentFilterId(0);
                setCurrentFilterData([]);
                setCurrentFilterWithoutSaveData([]);
                setclickedFilterId(0);
              }}
              className={`py-[10px] text-[16px] cursor-pointer select-none ${
                isTimelineClicked
                  ? "text-secondary font-semibold"
                  : "text-slatyGrey"
              }`}
            >
              Timeline
            </label>
            <span className="text-lightSilver">|</span>
            <label
              onClick={() => {
                setGlobalSearchValue("");
                setSearch("");
                setIsTimelineClicked(false);
                setIsTaskClicked(true);
                setIsUnassigneeClicked(false);
                setIsHistoryClicked(false);
                setCurrentFilterId(0);
                setCurrentFilterData([]);
                setCurrentFilterWithoutSaveData([]);
                setclickedFilterId(0);
              }}
              className={`py-[10px] text-[16px] cursor-pointer select-none ${
                isTaskClicked
                  ? "text-secondary font-semibold"
                  : "text-slatyGrey"
              }`}
            >
              Task
            </label>
            {hasPermissionWorklog("", "View", "WorkLogs") &&
              hasPermissionWorklog("", "ClientManager", "WorkLogs") && (
                <span className="text-lightSilver">|</span>
              )}
            {hasPermissionWorklog("", "ClientManager", "WorkLogs") && (
              <label
                onClick={() => {
                  setGlobalSearchValue("");
                  setSearch("");
                  setIsTimelineClicked(false);
                  setIsTaskClicked(false);
                  setIsUnassigneeClicked(true);
                  setIsHistoryClicked(false);
                  setCurrentFilterId(0);
                  setCurrentFilterData([]);
                  setCurrentFilterWithoutSaveData([]);
                  setclickedFilterId(0);
                }}
                className={`py-[10px] text-[16px] cursor-pointer select-none ${
                  isUnassigneeClicked
                    ? "text-secondary font-semibold"
                    : "text-slatyGrey"
                }`}
              >
                Unassigned Task
              </label>
            )}
            <span className="text-lightSilver">|</span>
            <label
              onClick={() => {
                setGlobalSearchValue("");
                setSearch("");
                setIsTimelineClicked(false);
                setIsTaskClicked(false);
                setIsUnassigneeClicked(false);
                setIsHistoryClicked(true);
                setCurrentFilterId(0);
                setCurrentFilterData([]);
                setCurrentFilterWithoutSaveData([]);
                setclickedFilterId(0);
              }}
              className={`py-[10px] text-[16px] cursor-pointer select-none ${
                isHistoryClicked
                  ? "text-secondary font-semibold"
                  : "text-slatyGrey"
              }`}
            >
              History
            </label>
          </div>
          <div className="flex items-center justify-center gap-[10px]">
            <div className="flex flex-col items-end justify-center">
              {(isTaskClicked || isTimelineClicked) && (
                <span className="text-secondary font-light text-[14px]">
                  Total time: {timeValue}
                </span>
              )}
              {isTaskClicked && (
                <span className="text-secondary font-light text-[14px]">
                  Today&apos;s time: {todayTimeValue}
                </span>
              )}
            </div>
            <div className="relative">
              <InputBase
                className="pl-1 pr-7 border-b border-b-lightSilver w-48"
                placeholder="Search"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <span className="absolute top-2 right-2 text-slatyGrey">
                <SearchIcon />
              </span>
            </div>

            {filterList.length > 0 && isTaskClicked ? (
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
                        onChange={(e) =>
                          handleSearchChangeWorklog(e.target.value)
                        }
                        sx={{ fontSize: 14 }}
                      />
                      <span className="absolute top-4 right-3 text-slatyGrey">
                        <SearchIcon />
                      </span>
                    </span>

                    {filteredFilters.map((i: FilterWorklogsPage) => {
                      return (
                        <div
                          key={i.FilterId}
                          className="group px-2 cursor-pointer bg-whiteSmoke hover:bg-lightSilver flex justify-between items-center h-9"
                        >
                          <span
                            className="pl-1"
                            onClick={() => {
                              setclickedFilterId(i.FilterId);
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
                        setclickedFilterId(0);
                        handleCloseFilter();
                        setCurrentFilterData(initialFilter);
                      }}
                      className="mt-2"
                      color="error"
                    >
                      clear all
                    </Button>
                  </div>
                </Popover>
              </div>
            ) : (
              <ColorToolTip title="Filter" placement="top" arrow>
                <span
                  className="cursor-pointer"
                  onClick={() => setIsFilterOpen(true)}
                >
                  <FilterIcon />
                </span>
              </ColorToolTip>
            )}
            {isTaskClicked ? (
              <ColorToolTip title="Import" placement="top" arrow>
                <span
                  className="cursor-pointer"
                  onClick={() => {
                    setIsImportOpen(true);
                  }}
                >
                  <ImportIcon />
                </span>
              </ColorToolTip>
            ) : (
              <></>
            )}
            {isTaskClicked || isTimelineClicked || isHistoryClicked ? (
              <ColorToolTip title="Export" placement="top" arrow>
                <span
                  className={
                    canExport
                      ? "cursor-pointer"
                      : "pointer-events-none opacity-50"
                  }
                  onClick={canExport ? handleExport : undefined}
                >
                  {isExporting ? <Loading /> : <ExportIcon />}
                </span>
              </ColorToolTip>
            ) : (
              <></>
            )}
            {isTaskClicked && (
              <>
                <Button
                  type="submit"
                  variant="contained"
                  color="info"
                  className={`flex flex-col items-center justify-center rounded-[4px] !h-[36px] !w-[125px] text-[13px] pt-2 ${
                    breakId === 0 ? "!bg-secondary" : "!bg-[#ff9f43]"
                  }`}
                  onClick={
                    loaded &&
                    hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs")
                      ? setBreak
                      : () =>
                          toast.error("User not have permission to Break Task")
                  }
                >
                  <span className="text-white font-light">
                    {breakTimeValue}
                  </span>
                  <span className="text-white font-light -mt-2">
                    {breakId === 0 ? "Break" : "Stop break"}
                  </span>
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  className="rounded-[4px] !h-[36px] !bg-secondary"
                  onClick={
                    hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs")
                      ? handleDrawerOpen
                      : () =>
                          toast.error("User not have permission to Create Task")
                  }
                >
                  <p className="flex items-center justify-center gap-[10px] px-[5px]">
                    <span>
                      <AddPlusIcon />
                    </span>
                    <span className="pt-1">Create Task</span>
                  </p>
                </Button>
              </>
            )}
            {isTimelineClicked && (
              <Button
                type="button"
                variant="contained"
                color="info"
                className="rounded-[4px] !h-[36px] !bg-[#ff9f43]"
                onClick={() => setIsHalfDay(true)}
              >
                Half Day
              </Button>
            )}
          </div>
        </div>
        {isTaskClicked && (
          <Datatable
            searchValue={globalSearchValue}
            isOnBreak={breakId}
            onGetBreakData={getBreakData}
            currentFilterData={currentFilterData}
            onCurrentFilterId={clickedFilterId}
            onDataFetch={handleDataFetch}
            onEdit={handleEdit}
            onRecurring={handleSetRecurring}
            onIsEdit={handleIsEdit}
            onDrawerOpen={handleDrawerOpen}
            onDrawerClose={handleDrawerClose}
            onComment={handleSetComments}
            onHandleExport={handleCanExport}
            isUnassigneeClicked={isUnassigneeClicked}
            onChangeTimeLoader={(e: string | null) => setTimeValue(e)}
            onChangeTodayTimeLoader={(e: string | null) => setTodayTimeValue(e)}
            onChangeBreakTimeLoader={(e: string | null) => setBreakTimeValue(e)}
            setLoading={isLoadingWorklogsDatatable}
          />
        )}

        {isUnassigneeClicked && (
          <UnassigneeDatatable
            searchValue={globalSearchValue}
            currentFilterData={currentFilterData}
            onDataFetch={handleDataFetch}
            onEdit={handleEdit}
            onRecurring={handleSetRecurring}
            onDrawerOpen={handleDrawerOpen}
            onDrawerClose={handleDrawerClose}
            onComment={handleSetComments}
            isUnassigneeClicked={isUnassigneeClicked}
          />
        )}

        {isTimelineClicked && (
          <TimelineDatatable
            currentFilterData={currentFilterWithoutSaveData}
            onDataFetch={handleDataFetch}
            searchValue={globalSearchValue.trim()}
            onHandleExport={handleCanExport}
            getTotalTime={(e: string | null) => setTimeValue(e)}
          />
        )}

        {isHistoryClicked && (
          <HistoryDatatable
            currentFilterData={currentFilterWithoutSaveData}
            onDataFetch={handleDataFetch}
            searchValue={globalSearchValue.trim()}
            // onHandleExport={handleCanExport}
          />
        )}

        {isEdit ? (
          <TaskEditDrawer
            onDataFetch={dataFunction}
            onOpen={openDrawer}
            onClose={handleDrawerClose}
            onEdit={hasEdit}
          />
        ) : (
          <Drawer
            onDataFetch={dataFunction}
            onOpen={openDrawer}
            onClose={handleDrawerClose}
            onEdit={hasEdit}
            onRecurring={hasRecurring}
            onComment={hasComment}
            // onHasId={hasId}
            isUnassigneeClicked={isUnassigneeClicked}
          />
        )}
        <DrawerOverlay isOpen={openDrawer} onClose={handleDrawerClose} />

        {/* Filter Dialog Box */}
        {isTaskClicked && (
          <FilterDialog
            currentFilterData={getIdFromFilterDialog}
            onOpen={isFilterOpen}
            onClose={closeFilterModal}
            onActionClick={() => {}}
            onDataFetch={getFilterList}
            onCurrentFilterId={currentFilterId}
          />
        )}
        {isUnassigneeClicked && (
          <UnassigneeFilterDialog
            onOpen={isFilterOpen}
            onClose={closeFilterModal}
            currentFilterData={getIdFromFilterDialog}
          />
        )}
        {isTimelineClicked && (
          <TimelineFilterDialog
            onOpen={isFilterOpen}
            onClose={closeFilterModal}
            currentFilterData={getIdFromFilterWithoutSaveDialog}
          />
        )}
        {isTimelineClicked && (
          <TimelineHalfDay onOpen={isHalfDay} onClose={closeHalfDayModal} />
        )}
        {isHistoryClicked && (
          <HistoryFilterDialog
            onOpen={isFilterOpen}
            onClose={closeFilterModal}
            currentFilterData={getIdFromFilterWithoutSaveDialog}
          />
        )}
      </div>

      <ImportDialog
        onOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onDataFetch={dataFunction}
      />

      {/* Delete Dialog Box */}
      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        onActionClick={() => {
          deleteFilter(currentFilterId);
        }}
        Title={"Delete Filter"}
        firstContent={"Are you sure you want to delete this saved filter?"}
        secondContent={
          "If you delete this, you will permanently loose this saved filter and selected fields."
        }
      />
      <NotificationDrawer
        emailNotificationOpen={emailNotificationOpen}
        setEmailNotificationOpen={setEmailNotificationOpen}
      />
      <DrawerOverlay isOpen={emailNotificationOpen} onClose={() => {}} />
    </Wrapper>
  );
};

export default Page;
