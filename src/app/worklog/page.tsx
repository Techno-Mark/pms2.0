"use client";
import React, { useEffect, useState } from "react";
import DrawerOverlay from "@/components/settings/drawer/DrawerOverlay";
import Drawer from "@/components/worklog/Drawer";
import Navbar from "@/components/common/Navbar";
import Wrapper from "@/components/common/Wrapper";
import Datatable_Worklog from "@/components/worklog/Datatable_Worklog";
import Datatable_CompletedTask from "@/components/worklog/Datatable_CompletedTask";
import AddPlusIcon from "@/assets/icons/AddPlusIcon";
import FilterIcon from "@/assets/icons/FilterIcon";
import { Button, InputBase, TextField } from "@mui/material";
import { toast } from "react-toastify";
import FilterDialog from "@/components/worklog/filterDialog";
import SearchIcon from "@/assets/icons/SearchIcon";
import ImportIcon from "@/assets/icons/ImportIcon";
import { hasPermissionWorklog } from "@/utils/commonFunction";
import { useRouter } from "next/navigation";
import ImportDialog from "@/components/worklog/worklog_Import/ImportDialog";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import { TaskFilter } from "@/utils/Types/clientWorklog";

const Worklog = () => {
  const router = useRouter();
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [hasEdit, setHasEdit] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [dataFunction, setDataFunction] = useState<(() => void) | null>(null);
  const [isWorklogClicked, setIsWorklogClicked] = useState(true);
  const [isCompletedTaskClicked, setIsCompletedTaskClicked] =
    useState<boolean>(false);
  const [hasComment, setHasComment] = useState(false);
  const [hasErrorLog, setHasErrorLog] = useState(false);
  const [currentFilterData, setCurrentFilterData] = useState<TaskFilter | []>(
    []
  );
  const [errorLog, setErrorLog] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("isClient") === "true") {
      if (
        (hasPermissionWorklog("", "View", "Worklogs") &&
          (hasPermissionWorklog("Task/SubTask", "View", "Worklogs") ||
            hasPermissionWorklog("Rating", "View", "Worklogs"))) === false
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

  const handleDrawerOpen = () => {
    setOpenDrawer(true);
  };

  const handleDrawerClose = () => {
    setOpenDrawer(false);
    setHasEdit(0);
    setHasComment(false);
    setHasErrorLog(false);
  };

  const handleDataFetch = (getData: () => void) => {
    setDataFunction(() => getData);
  };

  const handleEdit = (rowData: number) => {
    setHasEdit(rowData);
    setOpenDrawer(true);
  };

  const handleSetComments = (rowData: boolean, selectedId: number) => {
    setHasComment(true);
    setOpenDrawer(rowData);
    setHasEdit(selectedId);
  };

  const handleSetErrorLog = (rowData: boolean, selectedId: number) => {
    setHasErrorLog(true);
    setOpenDrawer(rowData);
    setHasEdit(selectedId);
  };

  const getIdFromFilterDialog = (data: TaskFilter) => {
    setCurrentFilterData(data);
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
        <div className="flex gap-[16px] items-center py-[6.5px]">
          {hasPermissionWorklog("Task/SubTask", "View", "WorkLogs") && (
            <label
              onClick={() => {
                setIsWorklogClicked(true);
                setIsCompletedTaskClicked(false);
                setErrorLog(false);
                setSearch("");
                setSearchValue("");
              }}
              className={`py-[10px] text-[16px] cursor-pointer select-none ${
                isWorklogClicked
                  ? "text-secondary font-semibold"
                  : "text-slatyGrey"
              }`}
            >
              Work Logs
            </label>
          )}
          {hasPermissionWorklog("Task/SubTask", "View", "WorkLogs") &&
            hasPermissionWorklog("Rating", "View", "WorkLogs") && (
              <span className="text-lightSilver">|</span>
            )}
          {hasPermissionWorklog("Rating", "View", "WorkLogs") && (
            <label
              onClick={() => {
                setIsCompletedTaskClicked(true);
                setIsWorklogClicked(false);
                setErrorLog(true);
                setSearch("");
                setSearchValue("");
              }}
              className={`py-[10px] text-[16px] cursor-pointer select-none ${
                isCompletedTaskClicked
                  ? "text-secondary font-semibold"
                  : "text-slatyGrey"
              }`}
            >
              Completed Task
            </label>
          )}
        </div>

        <div className="flex gap-[20px] items-center justify-center">
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

          <Button
            type="submit"
            variant="contained"
            className="rounded-[4px] !h-[36px] !bg-secondary"
            onClick={
              hasPermissionWorklog("Task/SubTask", "Save", "WorkLogs")
                ? handleDrawerOpen
                : () => toast.error("User not have permission to Create Task")
            }
          >
            <span className="flex items-center justify-center gap-[10px] px-[5px]">
              <span>
                <AddPlusIcon />
              </span>
              <span>Create Task</span>
            </span>
          </Button>
        </div>
      </div>

      {isWorklogClicked && (
        <Datatable_Worklog
          onDataFetch={handleDataFetch}
          onEdit={handleEdit}
          onDrawerOpen={handleDrawerOpen}
          onComment={handleSetComments}
          onErrorLog={handleSetErrorLog}
          currentFilterData={currentFilterData}
          searchValue={searchValue}
          onCloseDrawer={openDrawer}
        />
      )}

      {isCompletedTaskClicked && (
        <Datatable_CompletedTask
          onDataFetch={handleDataFetch}
          onDrawerOpen={handleDrawerOpen}
          onComment={handleSetComments}
          onErrorLog={handleSetErrorLog}
          currentFilterData={currentFilterData}
          searchValue={searchValue}
          onCloseDrawer={openDrawer}
          onEdit={handleEdit}
        />
      )}

      <Drawer
        onDataFetch={dataFunction}
        onOpen={openDrawer}
        onClose={handleDrawerClose}
        onEdit={hasEdit}
        onComment={hasComment}
        onErrorLog={hasErrorLog}
        errorLog={errorLog}
        isCompletedTaskClicked={isCompletedTaskClicked}
      />

      <DrawerOverlay isOpen={openDrawer} onClose={handleDrawerClose} />

      {/* Filter Dialog Box */}
      <FilterDialog
        onOpen={isFilterOpen}
        onClose={closeFilterModal}
        currentFilterData={getIdFromFilterDialog}
        isCompletedTaskClicked={isCompletedTaskClicked}
      />

      <ImportDialog
        onOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onDataFetch={dataFunction}
      />
    </Wrapper>
  );
};

export default Worklog;
