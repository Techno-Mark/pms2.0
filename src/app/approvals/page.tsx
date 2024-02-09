/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import React, { useEffect, useState } from "react";
import Datatable from "@/components/approvals/Datatable";
import Navbar from "@/components/common/Navbar";
import Wrapper from "@/components/common/Wrapper";
import ExportIcon from "@/assets/icons/ExportIcon";
import FilterIcon from "@/assets/icons/FilterIcon";
import { InputBase } from "@mui/material";
import Drawer from "@/components/approvals/Drawer";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { hasPermissionWorklog } from "@/utils/commonFunction";
import FilterDialog_Approval from "@/components/approvals/FilterDialog_Approval";
import IdleTimer from "@/components/common/IdleTimer";
import Loading from "@/assets/icons/reports/Loading";
import axios from "axios";
import SearchIcon from "@/assets/icons/SearchIcon";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";

const exportBody = {
  pageNo: 1,
  pageSize: 50000,
  sortColumn: "",
  isDesc: true,
  globalSearch: "",
  userId: null,
  ClientId: null,
  projectId: null,
  startDate: null,
  endDate: null,
  dueDate: null,
  StatusId: null,
  ProcessId: null,
};

const Page = () => {
  const router = useRouter();
  const [timeValue, setTimeValue] = useState(null);
  const [activeTab, setActiveTab] = useState<number>(1);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [hasEditId, setHasEditId] = useState(0);
  const [iconIndex, setIconIndex] = useState<number>(0);
  const [hasId, setHasId] = useState("");
  const [globalSearchValue, setGlobalSearchValue] = useState("");
  const [isFilterOpen, setisFilterOpen] = useState<boolean>(false);
  const [dataFunction, setDataFunction] = useState<(() => void) | null>(null);
  const [currentFilterData, setCurrentFilterData] = useState<any>([]);
  const [hasComment, setHasComment] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasManual, setHasManual] = useState(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [canExport, setCanExport] = useState<boolean>(false);

  const handleCloseFilter = () => {
    setisFilterOpen(false);
  };

  const getIdFromFilterDialog = (data: any) => {
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
    setHasId("");
    setGlobalSearchValue("");
  };

  const handleEdit = (rowId: any, Id: any, iconIndex?: number) => {
    setIconIndex(iconIndex !== undefined ? iconIndex : 0);
    setHasEditId(rowId);
    setOpenDrawer(true);
    setHasId(Id);
  };

  const handleDataFetch = (getData: () => void) => {
    setDataFunction(() => getData);
  };

  const handleSetComments = (rowData: any, selectedId: number) => {
    setHasComment(true);
    setOpenDrawer(rowData);
    setHasEditId(selectedId);
  };

  const handleSetError = (rowData: any, selectedId: number) => {
    setHasError(true);
    setOpenDrawer(rowData);
    setHasEditId(selectedId);
  };

  const handleSetManual = (rowData: any, selectedId: number) => {
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

  return (
    <Wrapper>
      <IdleTimer onIdle={() => window.location.reload()} />
      <div>
        <Navbar />
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
                setCurrentFilterData({ PageNo: 1, PageSize: 10 });
                setGlobalSearchValue("");
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
                setCurrentFilterData({ PageNo: 1, PageSize: 10 });
                setGlobalSearchValue("");
              }}
            >
              All Task
            </span>
          </div>
          <div className="flex gap-[20px] items-center">
            {activeTab === 1 && (
              <span className="text-secondary font-light">
                Total time: {timeValue}
              </span>
            )}
            <div className="relative">
              <InputBase
                className="pl-1 pr-7 border-b border-b-lightSilver w-52"
                placeholder="Search"
                value={globalSearchValue}
                onChange={(e: any) => setGlobalSearchValue(e.target.value)}
              />
              <span className="absolute top-2 right-2 text-slatyGrey">
                <SearchIcon />
              </span>
            </div>
            <ColorToolTip title="Filter" placement="top" arrow>
              <span
                className="cursor-pointer"
                onClick={() => setisFilterOpen(true)}
              >
                <FilterIcon />
              </span>
            </ColorToolTip>

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
          </div>
        </div>
        <Datatable
          activeTab={activeTab}
          searchValue={globalSearchValue}
          onDataFetch={handleDataFetch}
          onEdit={handleEdit}
          onDrawerOpen={handleDrawerOpen}
          currentFilterData={currentFilterData}
          onFilterOpen={isFilterOpen}
          onCloseDrawer={openDrawer}
          onComment={handleSetComments}
          onErrorLog={handleSetError}
          onManualTime={handleSetManual}
          onHandleExport={handleCanExport}
          onChangeLoader={(e: any) => setTimeValue(e)}
        />

        <Drawer
          onDataFetch={dataFunction}
          onOpen={openDrawer}
          onClose={handleDrawerClose}
          onEdit={hasEditId}
          hasIconIndex={iconIndex > 0 ? iconIndex : 0}
          onHasId={hasId}
          onComment={hasComment}
          onErrorLog={hasError}
          onManualTime={hasManual}
        />

        <FilterDialog_Approval
          activeTab={activeTab}
          onOpen={isFilterOpen}
          onClose={handleCloseFilter}
          onDataFetch={() => {}}
          currentFilterData={getIdFromFilterDialog}
        />
      </div>
    </Wrapper>
  );
};

export default Page;
