/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import FilterIcon from "@/assets/icons/FilterIcon";
import SearchIcon from "@/assets/icons/SearchIcon";
import IdleTimer from "@/components/common/IdleTimer";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
import WrapperNavbar from "@/components/common/WrapperNavbar";
import UnassignedDatatable from "@/components/qa/UnassignedDatatable";
import FilterDialog from "@/components/qa/FilterDialog";
import { callAPI } from "@/utils/API/callAPI";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import {
  AppliedFilterQAPage,
  AppliedFilterQAPageTask,
  FilterQAPage,
} from "@/utils/Types/qaTypes";
import { Delete, Edit } from "@mui/icons-material";
import { Button, InputBase, Popover, Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Loading from "@/assets/icons/reports/Loading";
import ExportIcon from "@/assets/icons/ExportIcon";
import axios from "axios";
import Datatable from "@/components/qa/Datatable";
import TaskFilterDialog from "@/components/qa/UnassignedFilterDialog";
import DrawerOverlay from "@/components/settings/drawer/DrawerOverlay";
import EditDrawer from "@/components/worklogs/Drawer";

const initialFilter1 = {
  ClientId: null,
  TypeOfWork: null,
  ProjectId: null,
  StatusId: null,
  DateFilter: null,
};

const initialFilter2 = {
  ClientId: null,
  TypeOfWork: null,
  ProjectId: null,
  AssignedTo: null,
  AssignedBy: null,
  StartDate: null,
  EndDate: null,
};

const page = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<number>(1);
  const [dataFunction, setDataFunction] = useState<(() => void) | null>(null);
  const [search, setSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [globalSearchValue, setGlobalSearchValue] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [hasEdit, setHasEdit] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [hasSubmissionId, setHasSubmissionId] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [currentFilterId, setCurrentFilterId] = useState<number>(0);
  const [clickedFilterId, setclickedFilterId] = useState<number>(0);
  const [filterList, setFilterList] = useState<FilterQAPage[] | []>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [canExport, setCanExport] = useState<boolean>(false);
  const [currentFilterDataTask, setCurrentFilterDataTask] = useState<
    AppliedFilterQAPageTask | []
  >([]);
  const [currentFilterData, setCurrentFilterData] = useState<
    AppliedFilterQAPage | []
  >([]);
  const [anchorElFilter, setAnchorElFilter] =
    React.useState<HTMLButtonElement | null>(null);

  const openFilter = Boolean(anchorElFilter);
  const idFilter = openFilter ? "simple-popover" : undefined;

  const handleClickFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElFilter(event.currentTarget);
  };

  const filteredFilters = filterList.filter((filter: FilterQAPage) =>
    filter.Name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleCloseAllFilter = () => {
    setAnchorElFilter(null);
  };

  const handleSearchChangeWorklog = (e: string) => {
    setSearchValue(e);
  };

  const handleSearchChange = (e: string) => {
    setSearch(e);
    const timer = setTimeout(() => {
      setGlobalSearchValue(e.trim());
    }, 500);
    return () => clearTimeout(timer);
  };

  const handleDrawerOpen = () => {
    setOpenDrawer(true);
  };

  const handleDrawerClose = () => {
    setOpenDrawer(false);
    setHasEdit(0);
    setHasSubmissionId(0);
    setGlobalSearchValue("");
    setSearch("");
    setHasError(false);
  };

  const handleEdit = (rowData1: number, rowData2: number) => {
    setHasEdit(rowData1);
    setHasSubmissionId(rowData2);
    setOpenDrawer(true);
  };

  const handleSetError = (
    rowData: boolean,
    selectedId1: number,
    selectedId2: number
  ) => {
    setHasError(true);
    setOpenDrawer(rowData);
    setHasEdit(selectedId1);
    setHasSubmissionId(selectedId2);
  };

  const handleDataFetch = (getData: () => void) => {
    setDataFunction(() => getData);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
  };

  const closeFilterModal = () => {
    setIsFilterOpen(false);
  };

  const getIdFromFilterDialogTask = (data: AppliedFilterQAPageTask) => {
    setCurrentFilterDataTask(data);
  };

  const getIdFromFilterDialog = (data: AppliedFilterQAPage) => {
    setCurrentFilterData(data);
  };

  const getFilterList = async () => {
    const params = {
      type: activeTab === 1 ? 22 : 21,
    };
    const url = `${process.env.worklog_api_url}/filter/getfilterlist`;
    const successCallback = (
      ResponseData: FilterQAPage[] | [],
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
        activeTab === 1 && setCurrentFilterDataTask(initialFilter1);
        activeTab === 2 && setCurrentFilterData(initialFilter2);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    getFilterList();
  }, [activeTab]);

  const handleCanExport = (arg1: boolean) => {
    setCanExport(arg1);
  };

  const handleExport = async () => {
    setIsExporting(true);
    const token = localStorage.getItem("token");
    const Org_Token = localStorage.getItem("Org_Token");

    const response = await axios.post(
      `${process.env.worklog_api_url}/workitem/quality/getuserlistexport`,
      {
        ...currentFilterDataTask,
        PageNo: 1,
        PageSize: 50000,
        SortColumn: "",
        IsDesc: true,
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
        a.download = "Qa_report.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setIsExporting(false);
      }
    } else {
      setIsExporting(false);
      toast.error("Failed to download, please try again later.");
    }
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
              setGlobalSearchValue("");
              setSearch("");
            }}
          >
            Task
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
              setGlobalSearchValue("");
              setSearch("");
            }}
          >
            Unassigned Task
          </span>
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
          {/* <ColorToolTip title="Filter" placement="top" arrow>
              <span
                className="cursor-pointer"
                onClick={() => setIsFilterOpen(true)}
              >
                <FilterIcon />
              </span>
            </ColorToolTip> */}

          {filterList.length > 0 ? (
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

                  {filteredFilters.map((i: FilterQAPage) => {
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
                      activeTab === 1
                        ? setCurrentFilterDataTask(initialFilter1)
                        : setCurrentFilterData(initialFilter2);
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

      {activeTab === 1 && (
        <Datatable
          onEdit={handleEdit}
          onDrawerOpen={handleDrawerOpen}
          onDrawerClose={handleDrawerClose}
          onDataFetch={handleDataFetch}
          onCurrentFilterId={clickedFilterId}
          currentFilterData={currentFilterDataTask}
          searchValue={globalSearchValue}
          onHandleExport={handleCanExport}
          onErrorLog={handleSetError}
        />
      )}

      {activeTab === 2 && (
        <UnassignedDatatable
          onDataFetch={handleDataFetch}
          onCurrentFilterId={clickedFilterId}
          currentFilterData={currentFilterData}
          searchValue={globalSearchValue}
        />
      )}

      {activeTab === 1 && (
        <EditDrawer
          onOpen={openDrawer}
          onClose={handleDrawerClose}
          onEdit={hasEdit}
          submissionId={hasSubmissionId}
          onDataFetch={dataFunction}
          isTaskDisabled={true}
          onErrorLog={hasError}
        />
      )}

      {activeTab === 1 && (
        <TaskFilterDialog
          currentFilterData={getIdFromFilterDialogTask}
          onOpen={isFilterOpen}
          onClose={closeFilterModal}
          onActionClick={() => {}}
          onDataFetch={getFilterList}
          onCurrentFilterId={currentFilterId}
        />
      )}

      {activeTab === 1 && (
        <TaskFilterDialog
          currentFilterData={getIdFromFilterDialogTask}
          onOpen={isFilterOpen}
          onClose={closeFilterModal}
          onActionClick={() => {}}
          onDataFetch={getFilterList}
          onCurrentFilterId={currentFilterId}
        />
      )}

      {activeTab === 2 && (
        <FilterDialog
          currentFilterData={getIdFromFilterDialog}
          onOpen={isFilterOpen}
          onClose={closeFilterModal}
          onActionClick={() => {}}
          onDataFetch={getFilterList}
          onCurrentFilterId={currentFilterId}
        />
      )}

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

      <DrawerOverlay isOpen={openDrawer} onClose={handleDrawerClose} />
    </WrapperNavbar>
  );
};

export default page;
