"use client";

import React, { useEffect, useState } from "react";
import Datatable from "@/components/approvals/Datatable";
import Navbar from "@/components/common/Navbar";
import Wrapper from "@/components/common/Wrapper";
import ExportIcon from "@/assets/icons/ExportIcon";
import FilterIcon from "@/assets/icons/FilterIcon";
import { Button, InputBase, Popover, Tooltip } from "@mui/material";
import Drawer from "@/components/approvals/Drawer";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { hasPermissionWorklog } from "@/utils/commonFunction";
import FilterDialogApproval from "@/components/approvals/FilterDialogApproval";
import IdleTimer from "@/components/common/IdleTimer";
import Loading from "@/assets/icons/reports/Loading";
import axios from "axios";
import SearchIcon from "@/assets/icons/SearchIcon";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import { AppliedFilterApprovals } from "@/utils/Types/types";
import { Delete, Edit } from "@mui/icons-material";
import { FilterWorklogsPage } from "@/utils/Types/worklogsTypes";
import { callAPI } from "@/utils/API/callAPI";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
import FilterDialog from "@/components/approvals/FilterDialog";
import WrapperNavbar from "@/components/common/WrapperNavbar";

const exportBody = {
  pageNo: 1,
  pageSize: 50000,
  sortColumn: "",
  isDesc: true,
  globalSearch: "",
  userId: null,
  ClientId: null,
  projectId: null,
  IsShowAll: 1,
  DepartmentId: null,
  startDate: null,
  endDate: null,
  dueDate: null,
  StatusId: null,
  ProcessId: null,
  startDateReview: null,
  endDateReview: null,
};

const initialFilter = {
  ClientId: null,
  TypeOfWork: null,
  userId: null,
  ProjectId: null,
  IsShowAll: 1,
  DepartmentId: null,
  ProcessId: null,
  StatusId: null,
  dueDate: null,
  startDate: null,
  endDate: null,
  DateFilter: null,
  startDateReview: null,
  endDateReview: null,
};

const Page = () => {
  const router = useRouter();
  const [timeValue, setTimeValue] = useState<string | null>(null);
  const [preperorTimeValue, setPreperorTimeValue] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<number>(1);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [hasEditId, setHasEditId] = useState(0);
  const [iconIndex, setIconIndex] = useState<number>(0);
  const [hasId, setHasId] = useState<number>(0);
  const [search, setSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [globalSearchValue, setGlobalSearchValue] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [currentFilterId, setCurrentFilterId] = useState<number>(0);
  const [clickedFilterId, setclickedFilterId] = useState<number>(0);
  const [filterList, setFilterList] = useState<FilterWorklogsPage[] | []>([]);
  const [dataFunction, setDataFunction] = useState<(() => void) | null>(null);
  const [currentFilterData, setCurrentFilterData] = useState<
    AppliedFilterApprovals | []
  >([]);
  const [hasComment, setHasComment] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasManual, setHasManual] = useState(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [canExport, setCanExport] = useState<boolean>(false);

  const [anchorElFilter, setAnchorElFilter] =
    React.useState<HTMLButtonElement | null>(null);

  const openFilter = Boolean(anchorElFilter);
  const idFilter = openFilter ? "simple-popover" : undefined;

  const handleClickFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElFilter(event.currentTarget);
  };

  const filteredFilters = filterList.filter((filter: FilterWorklogsPage) =>
    filter.Name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleCloseAllFilter = () => {
    setAnchorElFilter(null);
  };

  const handleSearchChangeWorklog = (e: string) => {
    setSearchValue(e);
  };

  const handleCloseFilter = () => {
    setIsFilterOpen(false);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
  };

  const closeFilterModal = () => {
    setIsFilterOpen(false);
  };

  const getFilterList = async () => {
    const params = {
      type: 21,
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

  const getIdFromFilterDialog = (data: AppliedFilterApprovals) => {
    setCurrentFilterData(data);
  };

  useEffect(() => {
    if (localStorage.getItem("isClient") === "false") {
      if (!hasPermissionWorklog("", "View", "Approvals")) {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [router]);

  const handleDrawerOpen = () => {
    setOpenDrawer(true);
  };

  const handleDrawerClose = () => {
    setOpenDrawer(false);
    setHasEditId(0);
    setHasComment(false);
    setHasError(false);
    setHasManual(false);
    setHasId(0);
    setGlobalSearchValue("");
    setSearch("");
  };

  const handleEdit = (rowId: number, Id: number, iconIndex?: number) => {
    setIconIndex(iconIndex !== undefined ? iconIndex : 0);
    setHasEditId(rowId);
    setOpenDrawer(true);
    setHasId(Id);
  };

  const handleDataFetch = (getData: () => void) => {
    setDataFunction(() => getData);
  };

  const handleSetComments = (rowData: boolean, selectedId: number) => {
    setHasComment(true);
    setOpenDrawer(rowData);
    setHasEditId(selectedId);
  };

  const handleSetError = (rowData: boolean, selectedId: number) => {
    setHasError(true);
    setOpenDrawer(rowData);
    setHasEditId(selectedId);
  };

  const handleSetManual = (rowData: boolean, selectedId: number) => {
    setHasManual(true);
    setOpenDrawer(rowData);
    setHasEditId(selectedId);
  };

  const handleExport = async () => {
    setIsExporting(true);
    const token = localStorage.getItem("token");
    const Org_Token = localStorage.getItem("Org_Token");

    const response = await axios.post(
      `${process.env.worklog_api_url}${
        activeTab === 1
          ? "/workitem/approval/GetReviewExportExcelList"
          : "/workitem/approval/GetAllTasksExportForReviewer"
      }`,
      {
        ...exportBody,
        ...currentFilterData,
        globalSearch: search,
        isDownload: true,
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
        a.download =
          activeTab === 1 ? "approval_report.xlsx" : "all_task_report.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setIsExporting(false);
      }
    } else {
      toast.error("Failed to download, please try again later.");
    }
  };

  const handleCanExport = (arg1: boolean) => {
    setCanExport(arg1);
  };

  const handleSearchChange = (e: string) => {
    setSearch(e);
    const timer = setTimeout(() => {
      setGlobalSearchValue(e.trim());
    }, 500);
    return () => clearTimeout(timer);
  };

  return (
    <WrapperNavbar>
      <IdleTimer onIdle={() => window.location.reload()} />
      <div className="bg-white flex justify-between items-center px-[20px]">
        <div className="flex gap-[10px] items-center py-[6.5px]">
          <span
            className={`py-[10px] cursor-pointer select-none text-[16px] ${
              activeTab === 1
                ? "text-secondary font-semibold"
                : "text-slatyGrey"
            }`}
            onClick={() => {
              setActiveTab(1);
              // setCurrentFilterData({ PageNo: 1, PageSize: 10 });
              setGlobalSearchValue("");
              setSearch("");
            }}
          >
            Review
          </span>
          <span className="text-lightSilver">|</span>
          <span
            className={`py-[10px] cursor-pointer select-none text-[16px] ${
              activeTab === 2
                ? "text-secondary font-semibold"
                : "text-slatyGrey"
            }`}
            onClick={() => {
              setActiveTab(2);
              // setCurrentFilterData({ PageNo: 1, PageSize: 10 });
              setGlobalSearchValue("");
              setSearch("");
            }}
          >
            All Task
          </span>
        </div>
        <div className="flex gap-[20px] items-center">
          {activeTab === 1 && (
            <div className="flex flex-col items-end justify-center text-sm">
              <span className="text-secondary font-light">
                Reviewer Total time: {timeValue}
              </span>
              <span className="text-secondary font-light">
                Preparer Total time: {preperorTimeValue}
              </span>
            </div>
          )}
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
          {/* <ColorToolTip title="Filter" placement="top" arrow>
              <span
                className="cursor-pointer"
                onClick={() => setIsFilterOpen(true)}
              >
                <FilterIcon />
              </span>
            </ColorToolTip> */}

          {filterList.length > 0 && activeTab === 2 ? (
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
                onClose={handleCloseAllFilter}
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
                      handleCloseAllFilter();
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
                            handleCloseAllFilter();
                          }}
                        >
                          {i.Name}
                        </span>
                        <span className="flex gap-[10px] pr-[10px]">
                          <span
                            onClick={() => {
                              setCurrentFilterId(i.FilterId);
                              setIsFilterOpen(true);
                              handleCloseAllFilter();
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
                              handleCloseAllFilter();
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
                      handleCloseAllFilter();
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

          <ColorToolTip title="Export" placement="top" arrow>
            <span
              className={
                canExport ? "cursor-pointer" : "pointer-events-none opacity-50"
              }
              onClick={canExport ? handleExport : undefined}
            >
              {isExporting ? <Loading /> : <ExportIcon />}
            </span>
          </ColorToolTip>
        </div>
      </div>
      <Datatable
        activeTab={activeTab}
        searchValue={globalSearchValue}
        onDataFetch={handleDataFetch}
        onEdit={handleEdit}
        // onDrawerOpen={handleDrawerOpen}
        onCurrentFilterId={clickedFilterId}
        currentFilterData={currentFilterData}
        onFilterOpen={isFilterOpen}
        onCloseDrawer={openDrawer}
        onComment={handleSetComments}
        onErrorLog={handleSetError}
        onManualTime={handleSetManual}
        onHandleExport={handleCanExport}
        onChangeLoader={(e: string | null) => setTimeValue(e)}
        onChangePreperorLoader={(e: string | null) => setPreperorTimeValue(e)}
      />

      <Drawer
        activeTab={activeTab}
        onDataFetch={dataFunction}
        onOpen={openDrawer}
        onClose={handleDrawerClose}
        onEdit={hasEditId}
        // hasIconIndex={iconIndex > 0 ? iconIndex : 0}
        onHasId={hasId}
        onComment={hasComment}
        onErrorLog={hasError}
        onManualTime={hasManual}
      />

      {activeTab === 1 && (
        <FilterDialogApproval
          activeTab={activeTab}
          onOpen={isFilterOpen}
          onClose={handleCloseFilter}
          onDataFetch={() => {}}
          currentFilterData={getIdFromFilterDialog}
        />
      )}

      {activeTab === 2 && (
        <FilterDialog
          getIdFromFilterDialog={getIdFromFilterDialog}
          onOpen={isFilterOpen}
          onClose={closeFilterModal}
          onActionClick={() => {}}
          onDataFetch={getFilterList}
          onCurrentFilterId={currentFilterId}
          currentFilterData={currentFilterData}
        />
      )}

      {/* Delete Dialog Box */}
      {activeTab === 2 && (
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
      )}
    </WrapperNavbar>
  );
};

export default Page;
