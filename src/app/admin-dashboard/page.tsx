"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "@mui/material";
import { toast } from "react-toastify";
import { hasPermissionWorklog } from "@/utils/commonFunction";
import MUIDataTable from "mui-datatables";
import TablePagination from "@mui/material/TablePagination";
import {
  generateDashboardReportBodyRender,
  handleChangeRowsPerPageWithFilter,
  handlePageChangeWithFilter,
} from "@/utils/datatable/CommonFunction";
import { getMuiTheme, ColorToolTip } from "@/utils/datatable/CommonStyle";
import ExportIcon from "@/assets/icons/ExportIcon";
import Loading from "@/assets/icons/reports/Loading";
import { dashboardReport_Options } from "@/utils/datatable/TableOptions";
import { callAPI } from "@/utils/API/callAPI";
import FilterIcon from "@/assets/icons/FilterIcon";
import FilterDialogDashboard from "@/components/admin-dashboard/FilterDialogDashboard";
import { DashboardInitialFilter } from "@/utils/Types/dashboardTypes";
import { generateCustomColumn } from "@/utils/datatable/ColsGenerateFunctions";
import ReportLoader from "@/components/common/ReportLoader";
import WrapperNavbar from "@/components/common/WrapperNavbar";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
import FilterModel from "@/components/admin-dashboard/FilterModel";
import TaskChart from "@/components/admin-dashboard/TaskChart";
import NewDashboard from "@/components/admin-dashboard/NewDashboard";

interface ClientSummaryStatus {
  ClientName: string;
  newchecking: number;
  ReviewCompleted: number;
  ReviewCompletedAWN: number;
  Assigned: number;
  CreateStatus1: number;
  CreateStatus: number;
  ErrorLogs: number;
  InPreparation: number;
  InReview: number;
  InreviewwithClient: number;
  newstatus251: number;
  NotStarted: number;
  OnHoldFromClient: number;
  PartialSubmitted: number;
  PendingfromAccounting: number;
  Rejected: number;
  Rework: number;
  ReworkReviewCompleted: number;
  ReworkReviewCompletedAWN: number;
  ReworkInPreparation: number;
  ReworkInReview: number;
  ReworkPrepCompleted: number;
  ReworkSubmitted: number;
  SecondManagerReview: number;
  Signedoff: number;
  PreparationCompleted: number;
  Submitted: number;
  Savenewstatus1: number;
  Withdraw: number;
  WithdrawnbyClient: number;
  Total: number;
}

interface DashboardSummaryReport {
  TotalCount: number;
  ClientSummary: ClientSummaryStatus[] | [];
  StatusSummary: { header: string; label: string }[];
}

interface InitialFilter {
  PageSize: number;
  PageNo: number;
  SortColumn: string;
  IsDesc: boolean;
}

const pageNo = 1;
const pageSize = 10;

const initialFilter = {
  PageSize: pageSize,
  PageNo: pageNo,
  SortColumn: "",
  IsDesc: true,
};

const currentFilter = {
  Clients: [],
  WorkTypeId: null,
  DepartmentIds: [],
  AssigneeIds: [],
  ReviewerIds: [],
  StatusIds: [],
  StartDate: null,
  EndDate: null,
};

const Page = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<number>(1);
  const [dashboardActiveTab, setDashboardActiveTab] = useState<number>(1);
  const [reportLoader, setReportLoader] = useState<boolean>(true);
  const [reportData, setReportData] = useState<ClientSummaryStatus[] | []>([]);
  const [reportDataHeader, setReportDataHeader] = useState<
    { header: string; label: string }[] | []
  >([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [tableDataCount, setTableDataCount] = useState(0);
  const [filteredObject, setFilteredObject] =
    useState<InitialFilter>(initialFilter);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [filterList, setFilterList] = useState<DashboardInitialFilter[] | []>(
    []
  );
  const [searchValue, setSearchValue] = useState("");
  const [currentFilterId, setCurrentFilterId] = useState<number>(0);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [currentFilterData, setCurrentFilterData] =
    useState<DashboardInitialFilter>({
      Clients: [],
      WorkTypeId: null,
      DepartmentIds: [],
      AssigneeIds: [],
      ReviewerIds: [],
      StatusIds: [],
      StartDate: null,
      EndDate: null,
    });
  const [emailboxLoading, setEmailboxLoading] = useState(true);

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

  const handleCloseFilterDialog = () => {
    setIsFilterOpen(false);
  };

  const handleSearchChangeWorklog = (e: string) => {
    setSearchValue(e);
  };

  const filteredFilters = filterList.filter((filter: any) =>
    filter.Name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const getIdFromFilterDialog = (data: DashboardInitialFilter) => {
    setCurrentFilterData(data);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
  };

  useEffect(() => {
    if (localStorage.getItem("isClient") === "false") {
      if (!hasPermissionWorklog("", "View", "Dashboard")) {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    if (
      !hasPermissionWorklog("", "View", "Dashboard") &&
      localStorage.getItem("isClient")
    ) {
      router.push("/");
    }
  }, [router]);

  const getFilterList = async () => {
    const params = {
      type: activeTab === 2 ? 24 : 23,
    };
    const url = `${process.env.worklog_api_url}/filter/getfilterlist`;
    const successCallback = (
      ResponseData: DashboardInitialFilter[],
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
        setCurrentFilterData(currentFilter);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    getFilterList();
  }, [activeTab, dashboardActiveTab]);

  const getReportData = async () => {
    setReportLoader(true);
    const params = { ...filteredObject, ...currentFilterData };
    const url = `${process.env.report_api_url}/dashboard/dashboardclientsummary`;
    const successCallback = (
      ResponseData: DashboardSummaryReport,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setReportData(ResponseData.ClientSummary);
        setReportDataHeader(ResponseData.StatusSummary);
        setTableDataCount(ResponseData.TotalCount);
        setReportLoader(false);
      } else {
        setReportLoader(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    setPage(0);
    setRowsPerPage(pageSize);
    setFilteredObject({
      ...filteredObject,
      PageSize: pageSize,
      PageNo: pageNo,
    });
  }, [currentFilterData, activeTab]);

  useEffect(() => {
    const fetchData = async () => {
      activeTab === 2 && (await getReportData());
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [activeTab, filteredObject, currentFilterData]);

  const exportSummaryReport = async () => {
    try {
      setIsExporting(true);

      const token = await localStorage.getItem("token");
      const Org_Token = await localStorage.getItem("Org_Token");

      const response = await axios.post(
        `${process.env.report_api_url}/dashboard/dashboardclientsummary/export`,
        {
          ...filteredObject,
          ...currentFilterData,
          IsDownload: true,
        },
        {
          headers: { Authorization: `bearer ${token}`, org_token: Org_Token },
          responseType: "arraybuffer",
        }
      );

      handleExportResponse(response);
    } catch (error: any) {
      setIsExporting(false);
      toast.error(error);
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
        a.download = `DashboardSummary_report.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setIsExporting(false);
      }
    } else {
      setIsExporting(false);
      toast.error("Please try again.");
    }
  };

  return (
    <WrapperNavbar className="min-h-screen overflow-y-auto">
      <div className="flex items-center justify-between w-full px-6 border-b border-gray-300">
        <div className="flex gap-[16px] items-center py-[6.5px]">
          <label
            onClick={() => {
              setActiveTab(1);
            }}
            className={`py-[10px] text-[16px] cursor-pointer select-none ${
              activeTab === 1
                ? "text-secondary font-semibold"
                : "text-slatyGrey"
            }`}
          >
            Dashboard
          </label>
          <span className="text-lightSilver">|</span>
          <label
            onClick={() => {
              setActiveTab(2);
            }}
            className={`py-[10px] text-[16px] cursor-pointer select-none ${
              activeTab === 2
                ? "text-secondary font-semibold"
                : "text-slatyGrey"
            }`}
          >
            Report
          </label>
        </div>

        {activeTab === 2 && (
          <div className="flex items-center justify-center gap-2">
            {filterList.length > 0 ? (
              <FilterModel
                idFilter={idFilter}
                handleClickFilter={handleClickFilter}
                openFilter={openFilter}
                anchorElFilter={anchorElFilter}
                handleCloseFilter={handleCloseFilter}
                setIsFilterOpen={setIsFilterOpen}
                setCurrentFilterId={setCurrentFilterId}
                searchValue={searchValue}
                handleSearchChangeWorklog={handleSearchChangeWorklog}
                filteredFilters={filteredFilters}
                currentFilter={currentFilter}
                setCurrentFilterData={setCurrentFilterData}
                setIsDeleteOpen={setIsDeleteOpen}
              />
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
                className={`${
                  isExporting ? "cursor-default" : "cursor-pointer"
                }`}
                onClick={exportSummaryReport}
              >
                {isExporting ? <Loading /> : <ExportIcon />}
              </span>
            </ColorToolTip>
          </div>
        )}
      </div>
      {activeTab === 1 && (
        <div className="flex items-center justify-between px-6">
          <div className="flex gap-[16px] items-center py-[6.5px]">
            <label
              onClick={() => {
                setDashboardActiveTab(1);
                setEmailboxLoading(true);
              }}
              className={`py-[10px] text-[16px] cursor-pointer select-none ${
                dashboardActiveTab === 1
                  ? "text-secondary font-semibold"
                  : "text-slatyGrey"
              }`}
            >
              Task
            </label>
            <span className="text-lightSilver">|</span>
            <label
              onClick={() => {
                setDashboardActiveTab(3);
                setEmailboxLoading(true);
              }}
              className={`py-[10px] text-[16px] cursor-pointer select-none ${
                dashboardActiveTab === 3
                  ? "text-secondary font-semibold"
                  : "text-slatyGrey"
              }`}
            >
              New Dashboard
            </label>
          </div>
          <div>
            {filterList.length > 0 ? (
              <FilterModel
                idFilter={idFilter}
                handleClickFilter={handleClickFilter}
                openFilter={openFilter}
                anchorElFilter={anchorElFilter}
                handleCloseFilter={handleCloseFilter}
                setIsFilterOpen={setIsFilterOpen}
                setCurrentFilterId={setCurrentFilterId}
                searchValue={searchValue}
                handleSearchChangeWorklog={handleSearchChangeWorklog}
                filteredFilters={filteredFilters}
                currentFilter={currentFilter}
                setCurrentFilterData={setCurrentFilterData}
                setIsDeleteOpen={setIsDeleteOpen}
              />
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
          </div>
        </div>
      )}

      {activeTab === 1 && dashboardActiveTab === 1 && (
        <TaskChart
          activeTab={activeTab}
          dashboardActiveTab={dashboardActiveTab}
          currentFilterData={currentFilterData}
        />
      )}

      {activeTab === 1 && dashboardActiveTab === 3 && (
        <NewDashboard
          activeTab={activeTab}
          dashboardActiveTab={dashboardActiveTab}
          currentFilterData={currentFilterData}
        />
      )}

      {activeTab === 2 && reportLoader && <ReportLoader />}
      {activeTab === 2 && !reportLoader && (
        <ThemeProvider theme={getMuiTheme()}>
          <MUIDataTable
            data={reportData}
            columns={
              reportDataHeader.length > 0
                ? [
                    ...[{ header: "ClientName", label: "Client Name" }].map(
                      (i: { header: string; label: string }) =>
                        generateCustomColumn(
                          i.header,
                          i.label,
                          generateDashboardReportBodyRender
                        )
                    ),
                    ...[
                      { header: "Total", label: "Total" },
                      ...reportDataHeader,
                    ].map((i: { header: string; label: string }) =>
                      generateCustomColumn(
                        i.header,
                        i.label,
                        generateDashboardReportBodyRender
                      )
                    ),
                  ]
                : [
                    { header: "ClientName", label: "Client Name" },
                    { header: "Total", label: "Total" },
                  ].map((i: { header: string; label: string }) =>
                    generateCustomColumn(
                      i.header,
                      i.label,
                      generateDashboardReportBodyRender
                    )
                  )
            }
            title={undefined}
            options={dashboardReport_Options}
            data-tableid="Datatable"
          />
          <TablePagination
            component="div"
            count={tableDataCount}
            page={page}
            onPageChange={(
              event: React.MouseEvent<HTMLButtonElement> | null,
              newPage: number
            ) => {
              handlePageChangeWithFilter(newPage, setPage, setFilteredObject);
            }}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(
              event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => {
              handleChangeRowsPerPageWithFilter(
                event,
                setRowsPerPage,
                setPage,
                setFilteredObject
              );
            }}
          />
        </ThemeProvider>
      )}

      <FilterDialogDashboard
        activeTab={activeTab}
        dashboardActiveTab={dashboardActiveTab}
        onOpen={isFilterOpen}
        onClose={handleCloseFilterDialog}
        getFilterList={getFilterList}
        currentFilterData={getIdFromFilterDialog}
        onCurrentFilterId={currentFilterId}
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
    </WrapperNavbar>
  );
};

export default Page;
