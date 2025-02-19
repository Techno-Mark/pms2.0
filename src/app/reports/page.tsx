"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Wrapper from "@/components/common/Wrapper";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputBase,
} from "@mui/material";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import LineIcon from "@/assets/icons/reports/LineIcon";
import MoreIcon from "@/assets/icons/reports/MoreIcon";
import FilterIcon from "@/assets/icons/FilterIcon";
import ExportIcon from "@/assets/icons/ExportIcon";
import Loading from "@/assets/icons/reports/Loading";
import SearchIcon from "@/assets/icons/SearchIcon";
import ProjectReport from "@/components/reports/tables/ProjectReport";
import UserReport from "@/components/reports/tables/UserReport";
import TimeSheetReport from "@/components/reports/tables/TimeSheetReport";
import WorkloadReport from "@/components/reports/tables/WorkloadReport";
import UserLogsReport from "@/components/reports/tables/UserLogsReport";
import AuditReport from "@/components/reports/tables/AuditReport";
import BillingReport from "@/components/reports/tables/BillingReport";
import CustomReport from "@/components/reports/tables/CustomReport";
import { hasPermissionWorklog } from "@/utils/commonFunction";
import { haveSameData } from "@/utils/reports/commonFunctions";
import {
  customreport_InitialFilter,
  getCurrentTabDetails,
} from "@/utils/reports/getFilters";
import ProjectReportFilter from "@/components/reports/Filter/ProjectReportFilter";
import UserReportFilter from "@/components/reports/Filter/UserReportFilter";
import WorkLoadReportFilter from "@/components/reports/Filter/WorkLoadReportFilter";
import UserLogsReportFilter from "@/components/reports/Filter/UserLogsReportFilter";
import TimesheetReportFilter from "@/components/reports/Filter/TimesheetReportFilter";
import BillingReportFilter from "@/components/reports/Filter/BillingReportFilter";
import CustomReportFilter from "@/components/reports/Filter/CustomReportFilter";
import RatingReport from "@/components/reports/tables/RatingReport";
import RatingReportFilter from "@/components/reports/Filter/RatingReportFilter";
import AuditReportFilter from "@/components/reports/Filter/AuditReportFilter";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import LogReport from "@/components/reports/tables/LogReport";
import LogReportFilter from "@/components/reports/Filter/LogReportFilter";
import ActivityReport from "@/components/reports/tables/ActivityReport";
import ActivityReportFilter from "@/components/reports/Filter/ActivityReportFilter";
import APReport from "@/components/reports/tables/APReport";
import APReportFilter from "@/components/reports/Filter/APReportFilter";
import ClientReport from "@/components/reports/tables/ClientReport";
import KRAReport from "@/components/reports/tables/KRAReport";
import AutoManualReport from "@/components/reports/tables/AutoManualReport";
import WLTRReport from "@/components/reports/tables/WLTRReport";
import WLTRReportFilter from "@/components/reports/Filter/WLTRReportFilter";
import AutoManualReportFilter from "@/components/reports/Filter/AutoManualReportFilter";
import KRAReportFilter from "@/components/reports/Filter/KRAReportFilter";
import ClientReportFilter from "@/components/reports/Filter/ClientReportFilter";
import { DialogTransition } from "@/utils/style/DialogTransition";
import ErrorLogReport from "@/components/reports/tables/ErrorLogReport";
import ErrorLogReportFilter from "@/components/reports/Filter/ErrorLogReportFilter";
import WrapperNavbar from "@/components/common/WrapperNavbar";
import EmailTypeReport from "@/components/reports/tables/EmailTypeReport";
import EmailTypeReportFilter from "@/components/reports/Filter/EmailTypeReportFilter";

interface Tabs {
  label: string;
  value: number;
  name: string;
}

const allTabs = [
  { label: "project", value: 1, name: "Project" },
  { label: "user", value: 2, name: "Attendance" },
  { label: "timesheet", value: 3, name: "Timesheet" },
  { label: "actual/planned", value: 12, name: "Actual/Planned" },
  { label: "billing", value: 7, name: "Billing" },
  { label: "custom", value: 8, name: "Custom" },
  { label: "user log", value: 5, name: "User Work Log" },
  { label: "audit", value: 6, name: "Audit" },
  { label: "rating", value: 9, name: "Rating" },
  { label: "log", value: 10, name: "Log" },
  { label: "activity", value: 11, name: "Activity" },
  { label: "workload", value: 4, name: "Workload" },
  { label: "client", value: 13, name: "Client" },
  { label: "kra", value: 14, name: "Efficiency" },
  { label: "auto/manual", value: 15, name: "Auto/Manual" },
  { label: "wltr", value: 16, name: "WLTR" },
  { label: "errorlog", value: 17, name: "Error Log" },
  { label: "errorlog", value: 18, name: "Email Type" },
];

interface MoreTabs {
  moreTabs: Tabs[];
  handleMoreTabsClick: (tab: Tabs, index: number) => void;
}

const MoreTabs = ({ moreTabs, handleMoreTabsClick }: MoreTabs) => {
  return (
    <div
      style={{
        boxShadow: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)",
      }}
      className="absolute w-36 z-50 bg-slate-50 rounded flex flex-col whitespace-nowrap"
    >
      {moreTabs
        .filter((tab: Tabs | boolean) => tab !== false)
        .map((tab: Tabs, index: number) => (
          <div
            key={tab.value}
            className={`py-1 w-full hover:bg-[#0000000e] ${
              index === 0 ? "rounded-t" : ""
            } ${index === moreTabs.length - 1 ? "rounded-b" : ""}`}
            onClick={() => handleMoreTabsClick(tab, index)}
          >
            <label className={`mx-4 my-[3px] flex cursor-pointer text-base`}>
              {tab.name}
            </label>
          </div>
        ))}
    </div>
  );
};

const Page = () => {
  const router = useRouter();
  const moreTabsRef = useRef<HTMLDivElement>(null);
  const [canExport, setCanExport] = useState<boolean>(false);
  const [activeTabs, setActiveTabs] = useState<any[]>([]);
  const [moreTabs, setMoreTabs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<number>(1);
  const [showMoreTabs, setShowMoreTabs] = useState<boolean>(false);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [filteredData, setFilteredData] = useState<any>(null);
  const [hasRaisedInvoiceData, setHasRaisedInvoiceData] =
    useState<boolean>(false);
  const [saveBTCData, setSaveBTCData] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [hasHoursShared, setHasHoursShared] = useState<boolean>(false);
  const [saveHourData, setSaveHourData] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    const handleOutsideClick = (event: any) => {
      const isOutsideMoreTabs =
        moreTabsRef.current && !moreTabsRef.current.contains(event.target);

      if (isOutsideMoreTabs) {
        setShowMoreTabs(false);
      }
    };

    window.addEventListener("click", handleOutsideClick);

    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const hasTabsPermission = () => {
    return (
      hasPermissionWorklog("", "View", "Report") &&
      (hasPermissionWorklog("project", "View", "Report") ||
        hasPermissionWorklog("user", "View", "Report") ||
        hasPermissionWorklog("timesheet", "View", "Report") ||
        hasPermissionWorklog("workload", "View", "Report") ||
        hasPermissionWorklog("user log", "View", "Report") ||
        hasPermissionWorklog("audit", "View", "Report") ||
        hasPermissionWorklog("billing", "View", "Report") ||
        hasPermissionWorklog("custom", "View", "Report") ||
        hasPermissionWorklog("log", "View", "Report") ||
        hasPermissionWorklog("activity", "View", "Report") ||
        hasPermissionWorklog("Actual/Planned", "View", "Report") ||
        hasPermissionWorklog("client", "View", "Report") ||
        hasPermissionWorklog("kra", "View", "Report") ||
        hasPermissionWorklog("Auto/Manual", "View", "Report") ||
        hasPermissionWorklog("wltr", "View", "Report") ||
        hasPermissionWorklog("errorlog", "View", "Report"))
    );
  };

  const actionAfterPermissionCheck = () => {
    if (!hasTabsPermission()) {
      router.push("/");
    } else {
      setActiveTabs(
        allTabs
          .map((tab) =>
            hasPermissionWorklog(tab.label, "view", "report") ? tab : false
          )
          .filter((tab) => tab !== false)
          .slice(0, 6)
      );
      setActiveTab(
        allTabs
          .filter((tab) => hasPermissionWorklog(tab.label, "view", "report"))
          .map((tab) => tab.value)[0]
      );
      setMoreTabs(
        allTabs
          .map((tab) =>
            hasPermissionWorklog(tab.label, "view", "report") ? tab : false
          )
          .filter((tab) => tab !== false)
          .slice(6)
      );
    }
  };

  useEffect(() => {
    const isClient = localStorage.getItem("isClient") === "false";

    if (isClient) {
      actionAfterPermissionCheck();
    } else {
      router.push("/");
    }
  }, [router]);

  const handleTabChange = (tabId: number) => {
    setActiveTab(tabId);
    setFilteredData(null);
    setSearchValue("");
    setSearch("");
  };

  const handleCanExport = (arg1: boolean) => {
    setCanExport(arg1);
  };

  const handleMoreTabsClick = (tab: Tabs, index: number) => {
    const clickedIndex = index;

    const lastVisibleTab = activeTabs[activeTabs.length - 1];

    setShowMoreTabs(false);

    handleTabChange(tab.value);

    setActiveTabs((prevTabs) =>
      prevTabs.map((tab: Tabs, index: number) =>
        index === activeTabs.length - 1 ? moreTabs[clickedIndex] : tab
      )
    );

    setMoreTabs((prevTabs) =>
      prevTabs.map((tab: Tabs, index: number) =>
        index === clickedIndex ? lastVisibleTab : tab
      )
    );
  };

  const handleFilterData = (arg1: any) => {
    setFilteredData(arg1);
  };

  const handleFilter = (arg1: boolean) => {
    setIsFiltering(arg1);
  };

  const handleExport = async () => {
    setIsExporting(true);
    const token = localStorage.getItem("token");
    const Org_Token = localStorage.getItem("Org_Token");

    const filtered =
      filteredData === null
        ? getCurrentTabDetails(activeTab, true)
        : filteredData;

    const response = await axios.post(
      getCurrentTabDetails(activeTab).toLowerCase() === "billing"
        ? `${process.env.report_api_url}/report/billing/exportclientwisezipReport`
        : getCurrentTabDetails(activeTab).toLowerCase() === "auto/manual"
        ? `${process.env.report_api_url}/report/automanual/export`
        : getCurrentTabDetails(activeTab).toLowerCase() === "a/p"
        ? `${process.env.report_api_url}/report/actualplanned/export`
        : `${process.env.report_api_url}/report/${getCurrentTabDetails(
            activeTab
          )}/export`,
      {
        ...filtered,
        globalSearch: searchValue.trim().length > 0 ? searchValue : "",
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
        a.download = `${
          allTabs
            .map((i: Tabs) => (i.value === activeTab ? i.name : false))
            .filter((j: string | boolean) => j !== false)[0]
        }_report.${
          getCurrentTabDetails(activeTab).toLowerCase() === "billing" ||
          getCurrentTabDetails(activeTab).toLowerCase() === "timesheet"
            ? "zip"
            : "xlsx"
        }`;
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

  const handleSearchChange = (e: string) => {
    setSearch(e);
    const timer = setTimeout(() => {
      setSearchValue(e.trim());
    }, 500);
    return () => clearTimeout(timer);
  };

  return (
    <WrapperNavbar>
      <div className="w-full pr-5 flex items-center justify-between">
        <div className="flex justify-between items-center">
          <div
            className={`flex justify-center items-center ${
              moreTabs.length <= 0 ? "my-2" : ""
            }`}
          >
            {activeTabs
              .filter((tab: boolean) => tab !== false)
              .map((tab: Tabs, index: number) => (
                <Fragment key={tab.value}>
                  <label
                    className={`mx-4 cursor-pointer text-base ${
                      activeTab === tab.value
                        ? "text-secondary font-semibold"
                        : "text-slatyGrey"
                    }`}
                    onClick={() => handleTabChange(tab.value)}
                  >
                    {tab.name}
                  </label>
                  <LineIcon />
                </Fragment>
              ))}
          </div>
          <div className="cursor-pointer relative">
            {moreTabs.length > 0 && (
              <div
                ref={moreTabsRef}
                onClick={() => setShowMoreTabs(!showMoreTabs)}
              >
                <MoreIcon />
              </div>
            )}
            {showMoreTabs && (
              <MoreTabs
                moreTabs={moreTabs}
                handleMoreTabsClick={handleMoreTabsClick}
              />
            )}
          </div>
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
          <ColorToolTip title="Export" placement="top" arrow>
            <span
              className={`${
                isExporting ? "cursor-default" : "cursor-pointer"
              } ${
                !canExport ||
                (getCurrentTabDetails(activeTab).toLowerCase() === "custom" &&
                  (filteredData === null ||
                    haveSameData(customreport_InitialFilter, filteredData)))
                  ? "opacity-50 pointer-events-none"
                  : ""
              } `}
              onClick={
                !canExport ||
                (getCurrentTabDetails(activeTab).toLowerCase() === "custom" &&
                  (filteredData === null ||
                    haveSameData(customreport_InitialFilter, filteredData)))
                  ? undefined
                  : handleExport
              }
            >
              {isExporting ? <Loading /> : <ExportIcon />}
            </span>
          </ColorToolTip>

          {activeTab === 7 && (
            <Button
              type="submit"
              variant="contained"
              color="info"
              disabled={!hasRaisedInvoiceData}
              className={`whitespace-nowrap ${
                hasRaisedInvoiceData ? "!bg-secondary" : ""
              }`}
              onClick={() => setSaveBTCData(true)}
            >
              {filteredData !== null && filteredData?.IsBTC
                ? "Invoice UnRaise"
                : "Invoice Raise"}
            </Button>
          )}

          {activeTab === 8 && (
            <Button
              type="submit"
              variant="contained"
              color="info"
              disabled={!hasHoursShared}
              className={`whitespace-nowrap ${
                hasHoursShared ? "!bg-secondary" : ""
              }`}
              onClick={() => setIsDeleting(true)}
            >
              Hours Shared
            </Button>
          )}
        </div>
      </div>

      <Dialog
        open={isDeleting}
        TransitionComponent={DialogTransition}
        onClose={() => setIsDeleting(false)}
      >
        <DialogTitle className="h-[64px] p-[20px] flex items-center justify-between border-b border-b-lightSilver">
          <span className="text-lg font-medium">Share Hours</span>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <div className="flex flex-col mr-20 mb-8 mt-4">
              Are you sure you want to Share Hours?
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions className="border-t border-t-lightSilver p-[20px] gap-[10px] h-[64px]">
          <Button
            variant="outlined"
            color="error"
            onClick={() => setIsDeleting(false)}
          >
            Cancel
          </Button>
          <Button
            className="!bg-secondary"
            variant="contained"
            onClick={() => {
              setSaveHourData(true);
              setIsDeleting(false);
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* tabs */}
      {activeTab === 1 && (
        <ProjectReport
          searchValue={searchValue}
          filteredData={filteredData}
          onHandleExport={handleCanExport}
        />
      )}
      {activeTab === 2 && (
        <UserReport
          searchValue={searchValue}
          filteredData={filteredData}
          onHandleExport={handleCanExport}
        />
      )}
      {activeTab === 3 && (
        <TimeSheetReport
          searchValue={searchValue}
          filteredData={filteredData}
          onHandleExport={handleCanExport}
        />
      )}
      {activeTab === 4 && (
        <WorkloadReport
          searchValue={searchValue}
          filteredData={filteredData}
          onHandleExport={handleCanExport}
        />
      )}
      {activeTab === 5 && (
        <UserLogsReport
          searchValue={searchValue}
          filteredData={filteredData}
          onHandleExport={handleCanExport}
        />
      )}
      {activeTab === 6 && (
        <AuditReport
          searchValue={searchValue}
          filteredData={filteredData}
          onHandleExport={handleCanExport}
        />
      )}
      {activeTab === 7 && (
        <BillingReport
          searchValue={searchValue}
          filteredData={filteredData}
          hasRaisedInvoiceData={(arg1: boolean) =>
            setHasRaisedInvoiceData(arg1)
          }
          isSavingBTCData={saveBTCData}
          onSaveBTCDataComplete={() => setSaveBTCData(false)}
          onHandleExport={handleCanExport}
        />
      )}
      {activeTab === 8 && (
        <CustomReport
          searchValue={searchValue}
          filteredData={filteredData}
          hasHoursShared={(arg1: boolean) => setHasHoursShared(arg1)}
          isSavingHourData={saveHourData}
          onSaveHourDataComplete={() => setSaveHourData(false)}
          onHandleExport={handleCanExport}
        />
      )}
      {activeTab === 9 && (
        <RatingReport
          searchValue={searchValue}
          filteredData={filteredData}
          onHandleExport={handleCanExport}
        />
      )}

      {activeTab === 10 && (
        <LogReport
          searchValue={searchValue}
          filteredData={filteredData}
          onHandleExport={handleCanExport}
        />
      )}

      {activeTab === 11 && (
        <ActivityReport
          searchValue={searchValue}
          filteredData={filteredData}
          onHandleExport={handleCanExport}
        />
      )}

      {activeTab === 12 && (
        <APReport
          searchValue={searchValue}
          filteredData={filteredData}
          onHandleExport={handleCanExport}
        />
      )}

      {activeTab === 13 && (
        <ClientReport
          searchValue={searchValue}
          filteredData={filteredData}
          onHandleExport={handleCanExport}
        />
      )}

      {activeTab === 14 && (
        <KRAReport
          searchValue={searchValue}
          filteredData={filteredData}
          onHandleExport={handleCanExport}
        />
      )}

      {activeTab === 15 && (
        <AutoManualReport
          searchValue={searchValue}
          filteredData={filteredData}
          onHandleExport={handleCanExport}
        />
      )}

      {activeTab === 16 && (
        <WLTRReport
          searchValue={searchValue}
          filteredData={filteredData}
          onHandleExport={handleCanExport}
        />
      )}

      {activeTab === 17 && (
        <ErrorLogReport
          searchValue={searchValue}
          filteredData={filteredData}
          onHandleExport={handleCanExport}
        />
      )}

      {activeTab === 18 && (
        <EmailTypeReport
          searchValue={searchValue}
          filteredData={filteredData}
          onHandleExport={handleCanExport}
        />
      )}

      {/* tabs filter */}
      {activeTab === 1 && (
        <ProjectReportFilter
          isFiltering={isFiltering}
          sendFilterToPage={handleFilterData}
          onDialogClose={handleFilter}
        />
      )}

      {activeTab === 2 && (
        <UserReportFilter
          isFiltering={isFiltering}
          sendFilterToPage={handleFilterData}
          onDialogClose={handleFilter}
        />
      )}

      {activeTab === 3 && (
        <TimesheetReportFilter
          isFiltering={isFiltering}
          sendFilterToPage={handleFilterData}
          onDialogClose={handleFilter}
        />
      )}

      {activeTab === 4 && (
        <WorkLoadReportFilter
          isFiltering={isFiltering}
          sendFilterToPage={handleFilterData}
          onDialogClose={handleFilter}
        />
      )}

      {activeTab === 5 && (
        <UserLogsReportFilter
          isFiltering={isFiltering}
          sendFilterToPage={handleFilterData}
          onDialogClose={handleFilter}
        />
      )}

      {activeTab === 6 && (
        <AuditReportFilter
          isFiltering={isFiltering}
          sendFilterToPage={handleFilterData}
          onDialogClose={handleFilter}
        />
      )}

      {activeTab === 7 && (
        <BillingReportFilter
          isFiltering={isFiltering}
          sendFilterToPage={handleFilterData}
          onDialogClose={handleFilter}
        />
      )}
      {activeTab === 8 && (
        <CustomReportFilter
          isFiltering={isFiltering}
          sendFilterToPage={handleFilterData}
          onDialogClose={handleFilter}
        />
      )}
      {activeTab === 9 && (
        <RatingReportFilter
          isFiltering={isFiltering}
          sendFilterToPage={handleFilterData}
          onDialogClose={handleFilter}
        />
      )}
      {activeTab === 10 && (
        <LogReportFilter
          isFiltering={isFiltering}
          sendFilterToPage={handleFilterData}
          onDialogClose={handleFilter}
        />
      )}
      {activeTab === 11 && (
        <ActivityReportFilter
          isFiltering={isFiltering}
          sendFilterToPage={handleFilterData}
          onDialogClose={handleFilter}
        />
      )}
      {activeTab === 12 && (
        <APReportFilter
          isFiltering={isFiltering}
          sendFilterToPage={handleFilterData}
          onDialogClose={handleFilter}
        />
      )}
      {activeTab === 13 && (
        <ClientReportFilter
          isFiltering={isFiltering}
          sendFilterToPage={handleFilterData}
          onDialogClose={handleFilter}
        />
      )}
      {activeTab === 14 && (
        <KRAReportFilter
          isFiltering={isFiltering}
          sendFilterToPage={handleFilterData}
          onDialogClose={handleFilter}
        />
      )}
      {activeTab === 15 && (
        <AutoManualReportFilter
          isFiltering={isFiltering}
          sendFilterToPage={handleFilterData}
          onDialogClose={handleFilter}
        />
      )}
      {activeTab === 16 && (
        <WLTRReportFilter
          isFiltering={isFiltering}
          sendFilterToPage={handleFilterData}
          onDialogClose={handleFilter}
        />
      )}
      {activeTab === 17 && (
        <ErrorLogReportFilter
          isFiltering={isFiltering}
          sendFilterToPage={handleFilterData}
          onDialogClose={handleFilter}
        />
      )}
      {activeTab === 18 && (
        <EmailTypeReportFilter
          isFiltering={isFiltering}
          sendFilterToPage={handleFilterData}
          onDialogClose={handleFilter}
        />
      )}
    </WrapperNavbar>
  );
};

export default Page;
