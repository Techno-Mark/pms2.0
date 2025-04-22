"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Grid,
  InputBase,
  Popover,
  ThemeProvider,
  Tooltip,
} from "@mui/material";
import { toast } from "react-toastify";
import { hasPermissionWorklog } from "@/utils/commonFunction";
import Chart_BillingType from "@/components/admin-dashboard/charts/Chart_BillingType";
import Chart_TaskStatus from "@/components/admin-dashboard/charts/Chart_TaskStatus";
import Chart_ProjectStatus from "@/components/admin-dashboard/charts/Chart_ProjectStatus";
import InPreparation from "@/assets/icons/dashboard_Admin/InPreparation";
import InReview from "@/assets/icons/dashboard_Admin/InReview";
import Withdraw_Outlined from "@/assets/icons/dashboard_Admin/Withdraw_Outlined";
import TaskOutlinedIcon from "@mui/icons-material/TaskOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import RestorePageOutlinedIcon from "@mui/icons-material/RestorePageOutlined";
import PlaylistAddCheckOutlinedIcon from "@mui/icons-material/PlaylistAddCheckOutlined";
import RunningWithErrorsOutlinedIcon from "@mui/icons-material/RunningWithErrorsOutlined";
import Person4OutlinedIcon from "@mui/icons-material/Person4Outlined";
import Dialog_TaskStatus from "@/components/admin-dashboard/dialog/Dialog_TaskStatus";
import Dialog_BillingType from "@/components/admin-dashboard/dialog/Dialog_BillingType";
import Dialog_ProjectStatus from "@/components/admin-dashboard/dialog/Dialog_ProjectStatus";
import Dialog_DashboardSummaryList from "@/components/admin-dashboard/dialog/Dialog_DashboardSummaryList";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import MUIDataTable from "mui-datatables";
import TablePagination from "@mui/material/TablePagination";
import {
  generateDashboardReportBodyRender,
  generateEmailboxStatusColor,
  handleChangeRowsPerPageWithFilter,
  handlePageChangeWithFilter,
} from "@/utils/datatable/CommonFunction";
import { getMuiTheme, ColorToolTip } from "@/utils/datatable/CommonStyle";
import ExportIcon from "@/assets/icons/ExportIcon";
import Loading from "@/assets/icons/reports/Loading";
import { dashboardReport_Options } from "@/utils/datatable/TableOptions";
import { callAPI } from "@/utils/API/callAPI";
import { KeyValueColorCodeSequence } from "@/utils/Types/types";
import FilterIcon from "@/assets/icons/FilterIcon";
import FilterDialogDashboard from "@/components/admin-dashboard/FilterDialogDashboard";
import { DashboardInitialFilter } from "@/utils/Types/dashboardTypes";
import { generateCustomColumn } from "@/utils/datatable/ColsGenerateFunctions";
import ReportLoader from "@/components/common/ReportLoader";
import WrapperNavbar from "@/components/common/WrapperNavbar";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
import Chart_Errorlog from "@/components/admin-dashboard/charts/Chart_Errorlog";
import Dialog_Errorlog from "@/components/admin-dashboard/dialog/Dialog_Errorlog";
import Chart_EmailType from "@/components/admin-dashboard/charts/Chart_EmailType";
import Dialog_EmailType from "@/components/admin-dashboard/dialog/Dialog_EmailType";
import Chart_SLA from "@/components/admin-dashboard/charts/Chart_SLA";
import Dialog_SLA from "@/components/admin-dashboard/dialog/Dialog_SLA";
import FilterModel from "@/components/admin-dashboard/FilterModel";
import Chart_Status from "@/components/admin-dashboard/charts/Chart_Status";
import Chart_EmailPriority from "@/components/admin-dashboard/charts/Chart_EmailPriority";
import Dialog_Status from "@/components/admin-dashboard/dialog/Dialog_Status";
import Dialog_Priority from "@/components/admin-dashboard/dialog/Dialog_Priority";

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
  const [isBillingTypeDialogOpen, setIsBillingTypeDialogOpen] =
    useState<boolean>(false);
  const [isTaskStatusDialogOpen, setIsTaskStatusDialogOpen] =
    useState<boolean>(false);
  const [isProjectStatusDialogOpen, setIsProjectStatusDialogOpen] =
    useState<boolean>(false);
  const [isErrorlogDialogOpen, setIsErrorlogDialogOpen] =
    useState<boolean>(false);
  const [isEmailTypeDialogOpen, setIsEmailTypeDialogOpen] =
    useState<boolean>(false);
  const [isSLADialogOpen, setIsSLADialogOpen] = useState<boolean>(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState<boolean>(false);
  const [isPriorityDialogOpen, setIsPriorityDialogOpen] =
    useState<boolean>(false);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] =
    useState<boolean>(false);
  const [clickedProjectStatusName, setClickedProjectStatusName] =
    useState<number>(0);
  const [clickedErrorlog, setClickedErrorlog] = useState<number>(0);
  const [clickedSLA, setClickedSLA] = useState<number>(0);
  const [clickedStatus, setClickedStatus] = useState<number>(0);
  const [clickedPriority, setClickedPriority] = useState<number>(0);
  const [clickedEmailType, setClickedEmailType] = useState<string>("");
  const [clickedStatusName, setClickedStatusName] = useState<string>("");
  const [clickedBillingTypeName, setClickedBillingTypeName] =
    useState<string>("");
  const [dashboardSummary, setDashboardSummary] = useState<
    KeyValueColorCodeSequence[] | []
  >([]);
  const [clickedCardName, setClickedCardName] = useState<number>(0);
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
  const [dashboardEmailboxSummary, setDashboardEmailboxSummary] = useState<
    {
      TabName: string;
      Count: number;
    }[]
  >([]);
  const [
    dashboardEmailboxEmailTypeCounts,
    setDashboardEmailboxEmailTypeCounts,
  ] = useState<
    {
      Type: number;
      EmailTypeCount: number;
      EmailType: string;
      CountInPercentage: number;
    }[]
  >([]);
  const [dashboardEmailboxSLACounts, setDashboardEmailboxSLACounts] = useState<
    {
      Type: number;
      SLAType: string;
      Count: number;
      CountInPercentage: number;
    }[]
  >([]);
  const [dashboardEmailboxStatus, setDashboardEmailboxStatus] = useState<
    {
      Type: number;
      StatusType: string;
      Count: number;
      CountInPercentage: number;
    }[]
  >([]);
  const [dashboardEmailboxPriority, setDashboardEmailboxPriority] = useState<
    {
      Type: number;
      Priority: string;
      Count: number;
      CountInPercentage: number;
    }[]
  >([]);

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

  const handleValueFromBillingType = (
    isDialogOpen: boolean,
    selectedPointData: string
  ) => {
    setIsBillingTypeDialogOpen(isDialogOpen);
    setClickedBillingTypeName(selectedPointData);
  };

  const handleValueFromTaskStatus = (
    isDialogOpen: boolean,
    selectedPointData: string
  ) => {
    setIsTaskStatusDialogOpen(isDialogOpen);
    setClickedStatusName(selectedPointData);
  };

  const handleValueFromProjectStatus = (
    isDialogOpen: boolean,
    selectedPointData: number
  ) => {
    setIsProjectStatusDialogOpen(isDialogOpen);
    setClickedProjectStatusName(selectedPointData);
  };

  const handleValueFromErrorlog = (
    isDialogOpen: boolean,
    selectedPointData: number
  ) => {
    setIsErrorlogDialogOpen(isDialogOpen);
    setClickedErrorlog(selectedPointData);
  };

  const handleValueFromEmailType = (
    isDialogOpen: boolean,
    selectedPointData: string
  ) => {
    setIsEmailTypeDialogOpen(isDialogOpen);
    setClickedEmailType(selectedPointData);
  };

  const handleValueFromSLA = (
    isDialogOpen: boolean,
    selectedPointData: number
  ) => {
    setIsSLADialogOpen(isDialogOpen);
    setClickedSLA(selectedPointData);
  };

  const handleValueFromStatus = (
    isDialogOpen: boolean,
    selectedPointData: number
  ) => {
    setIsStatusDialogOpen(isDialogOpen);
    setClickedStatus(selectedPointData);
  };

  const handleValueFromPriority = (
    isDialogOpen: boolean,
    selectedPointData: number
  ) => {
    setIsPriorityDialogOpen(isDialogOpen);
    setClickedPriority(selectedPointData);
  };

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
      type: activeTab === 2 ? 24 : dashboardActiveTab === 1 ? 23 : 29,
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

  const getProjectSummary = async () => {
    const workTypeIdFromLocalStorage =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("workTypeId")
        : 3;
    const params = {
      Clients: currentFilterData.Clients,
      WorkTypeId:
        currentFilterData.WorkTypeId === null
          ? Number(workTypeIdFromLocalStorage)
          : currentFilterData.WorkTypeId,
      DepartmentIds: currentFilterData.DepartmentIds,
      AssigneeIds: currentFilterData.AssigneeIds,
      ReviewerIds: currentFilterData.ReviewerIds,
      StartDate: currentFilterData.StartDate,
      EndDate: currentFilterData.EndDate,
    };
    const url = `${process.env.report_api_url}/dashboard/summary`;
    const successCallback = (
      ResponseData: KeyValueColorCodeSequence[] | [],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setDashboardSummary(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const getSummary = async () => {
    setEmailboxLoading(true);
    const params = {
      ClientId: currentFilterData.Clients,
      DepartmentId: currentFilterData.DepartmentIds,
      AssignTo: currentFilterData.AssigneeIds,
      ReportingManagerId: currentFilterData.ReviewerIds,
      StartDate: currentFilterData.StartDate,
      EndDate: currentFilterData.EndDate,
    };
    const url = `${process.env.emailbox_api_url}/dashboard/GetDashboardWidgetsCounts`;
    const successCallback = (
      ResponseData: {
        TicketMetricsCounts: {
          TabName: string;
          Count: number;
        }[];
        TicketStatusCounts: {
          Type: number;
          StatusType: string;
          Count: number;
          CountInPercentage: number;
        }[];
        EmailTypeCounts: {
          Type: number;
          EmailTypeCount: number;
          EmailType: string;
          CountInPercentage: number;
        }[];
        PriorityCounts: {
          Type: number;
          Priority: string;
          Count: number;
          CountInPercentage: number;
        }[];
        SLACounts: {
          Type: number;
          SLAType: string;
          Count: number;
          CountInPercentage: number;
        }[];
      },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        const totalCount = ResponseData.TicketMetricsCounts.reduce(
          (sum, item) => sum + item.Count,
          0
        );

        setDashboardEmailboxSummary([
          ...ResponseData.TicketMetricsCounts,
          { TabName: "Total", Count: totalCount },
        ]);
        // setDashboardEmailboxSummary(ResponseData.TicketMetricsCounts);
        setDashboardEmailboxEmailTypeCounts(ResponseData.EmailTypeCounts);
        setDashboardEmailboxSLACounts(ResponseData.SLACounts);
        setDashboardEmailboxStatus(ResponseData.TicketStatusCounts);
        setDashboardEmailboxPriority(ResponseData.PriorityCounts);
        setEmailboxLoading(false);
      } else {
        setEmailboxLoading(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const fetchData = async () => {
      activeTab === 1 && dashboardActiveTab == 1 && (await getProjectSummary());
      activeTab === 1 && dashboardActiveTab == 2 && (await getSummary());
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [currentFilterData, dashboardActiveTab]);

  const statusIconMapping: { [key: number | string]: JSX.Element } = {
    2: <Person4OutlinedIcon />,
    8: <CheckCircleOutlineOutlinedIcon />,
    3: <InPreparation />,
    5: <InReview />,
    4: <ErrorOutlineIcon />,
    1: <PendingActionsOutlinedIcon />,
    11: <RunningWithErrorsOutlinedIcon />,
    "total cancel": <CancelOutlinedIcon />,
    10: <PauseCircleOutlineOutlinedIcon />,
    9: <Withdraw_Outlined />,
    7: <RestorePageOutlinedIcon />,
    12: <PlaylistAddCheckOutlinedIcon />,
    6: <TaskOutlinedIcon />,
  };

  const statusIconMappingForEmailbox: { [key: number | string]: JSX.Element } =
    {
      Total: <PlaylistAddCheckOutlinedIcon />,
      Unprocessed: <PendingActionsOutlinedIcon />,
      Inbox: <InPreparation />,
      Approval: <InReview />,
      Draft: <PauseCircleOutlineOutlinedIcon />,
      Junk: <Withdraw_Outlined />,
      Sent: <RestorePageOutlinedIcon />,
      Failed: <ErrorOutlineIcon />,
    };

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
                setDashboardActiveTab(2);
                setEmailboxLoading(true);
              }}
              className={`py-[10px] text-[16px] cursor-pointer select-none ${
                dashboardActiveTab === 2
                  ? "text-secondary font-semibold"
                  : "text-slatyGrey"
              }`}
            >
              Email Ticket
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
        <div className="py-[10px]">
          <Grid
            container
            className="flex items-center px-[20px] py-[10px]"
            gap={1}
          >
            {dashboardSummary &&
              dashboardSummary
                .slice(0, 4)
                .map((item: KeyValueColorCodeSequence) => (
                  <Grid xs={2.9} item key={item.Key}>
                    <Card
                      className={`w-full border shadow-md hover:shadow-xl cursor-pointer`}
                      style={{ borderColor: item.ColorCode }}
                    >
                      <div
                        className="flex p-[20px] items-center"
                        onClick={() => {
                          setClickedCardName(item.Sequence);
                          setIsSummaryDialogOpen(true);
                        }}
                      >
                        <span
                          style={{ color: item.ColorCode }}
                          className={`border-r border-lightSilver pr-[20px]`}
                        >
                          {statusIconMapping[item.Sequence]}
                        </span>
                        <div className="inline-flex flex-col items-start pl-[20px]">
                          <span className="text-[14px] font-normal text-darkCharcoal">
                            {item.Key}
                          </span>
                          <span className="text-[20px] text-slatyGrey font-semibold">
                            {item.Value}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Grid>
                ))}
          </Grid>

          <Grid
            container
            className="flex items-center px-[20px] py-[10px]"
            gap={1}
          >
            {dashboardSummary &&
              dashboardSummary
                .slice(4, 8)
                .map((item: KeyValueColorCodeSequence) => (
                  <Grid xs={2.9} item key={item.Key}>
                    <Card
                      className={`w-full border shadow-md hover:shadow-xl cursor-pointer`}
                      style={{ borderColor: item.ColorCode }}
                    >
                      <div
                        className="flex p-[20px] items-center"
                        onClick={() => {
                          setClickedCardName(item.Sequence);
                          setIsSummaryDialogOpen(true);
                        }}
                      >
                        <span
                          style={{ color: item.ColorCode }}
                          className={`border-r border-lightSilver pr-[20px]`}
                        >
                          {statusIconMapping[item.Sequence]}
                        </span>
                        <div className="inline-flex flex-col items-start pl-[20px]">
                          <span className="text-[14px] font-normal text-darkCharcoal">
                            {item.Key}
                          </span>
                          <span className="text-[20px] text-slatyGrey font-semibold">
                            {item.Value}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Grid>
                ))}
          </Grid>

          <Grid
            container
            className="flex items-center px-[20px] py-[10px]"
            gap={1}
          >
            {dashboardSummary &&
              dashboardSummary
                .slice(8, 12)
                .map((item: KeyValueColorCodeSequence) => (
                  <Grid xs={2.9} item key={item.Key}>
                    <Card
                      className={`w-full border shadow-md hover:shadow-xl cursor-pointer`}
                      style={{ borderColor: item.ColorCode }}
                    >
                      <div
                        className="flex p-[20px] items-center"
                        onClick={() => {
                          setClickedCardName(item.Sequence);
                          setIsSummaryDialogOpen(true);
                        }}
                      >
                        <span
                          style={{ color: item.ColorCode }}
                          className={`border-r border-lightSilver pr-[20px]`}
                        >
                          {statusIconMapping[item.Sequence]}
                        </span>
                        <div className="inline-flex flex-col items-start pl-[20px]">
                          <span className="text-[14px] font-normal text-darkCharcoal">
                            {item.Key}
                          </span>
                          <span className="text-[20px] text-slatyGrey font-semibold">
                            {item.Value}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Grid>
                ))}
          </Grid>

          {/* Task Status Chart */}
          <section className="flex gap-[20px] items-center px-[20px] py-[10px]">
            <Card className="w-full border border-lightSilver rounded-lg">
              <Chart_TaskStatus
                sendData={handleValueFromTaskStatus}
                currentFilterData={currentFilterData}
              />
            </Card>
          </section>

          {/* Project Status and Billing Type Charts */}
          <section className="flex gap-[20px] items-center px-[20px] py-[10px]">
            <Card className="w-full h-[344px] border border-lightSilver rounded-lg px-[10px]">
              <Chart_ProjectStatus
                sendData={handleValueFromProjectStatus}
                onSelectedProjectIds={[]}
                currentFilterData={currentFilterData}
              />
            </Card>

            <Card className="w-full h-[344px] border border-lightSilver rounded-lg px-[10px]">
              <Chart_BillingType
                sendData={handleValueFromBillingType}
                currentFilterData={currentFilterData}
              />
            </Card>
          </section>

          {/* Errorlog Chart */}
          <section className="flex gap-[20px] items-center px-[20px] py-[10px]">
            <Card className="w-full h-[344px] border border-lightSilver rounded-lg px-[10px]">
              <Chart_Errorlog
                sendData={handleValueFromErrorlog}
                onSelectedProjectIds={[]}
                currentFilterData={currentFilterData}
              />
            </Card>
            <div className="w-full h-[344px]"></div>
          </section>
        </div>
      )}

      {activeTab === 1 && dashboardActiveTab === 2 && emailboxLoading && <ReportLoader />}

      {activeTab === 1 && dashboardActiveTab === 2 && !emailboxLoading && (
        <div className="py-[10px]">
          <Grid
            container
            className="flex items-center px-[20px] py-[10px]"
            gap={1}
          >
            {dashboardEmailboxSummary &&
              dashboardEmailboxSummary
                .slice(0, 4)
                .map((item: { TabName: string; Count: number }, index) => (
                  <Grid xs={2.9} item key={index}>
                    <Card
                      className={`w-full border shadow-md hover:shadow-xl`}
                      style={{
                        borderColor: generateEmailboxStatusColor(item.TabName),
                      }}
                    >
                      <div className="flex p-[20px] items-center">
                        <span
                          style={{
                            color: generateEmailboxStatusColor(item.TabName),
                          }}
                          className={`border-r border-lightSilver pr-[20px]`}
                        >
                          {statusIconMappingForEmailbox[item.TabName]}
                        </span>
                        <div className="inline-flex flex-col items-start pl-[20px]">
                          <span className="text-[14px] font-normal text-darkCharcoal">
                            {item.TabName}
                          </span>
                          <span className="text-[20px] text-slatyGrey font-semibold">
                            {item.Count}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Grid>
                ))}
          </Grid>

          <Grid
            container
            className="flex items-center px-[20px] py-[10px]"
            gap={1}
          >
            {dashboardEmailboxSummary &&
              dashboardEmailboxSummary
                .slice(4, 8)
                .map((item: { TabName: string; Count: number }, index) => (
                  <Grid xs={2.9} item key={index}>
                    <Card
                      className={`w-full border shadow-md hover:shadow-xl`}
                      style={{
                        borderColor: generateEmailboxStatusColor(item.TabName),
                      }}
                    >
                      <div className="flex p-[20px] items-center">
                        <span
                          style={{
                            color: generateEmailboxStatusColor(item.TabName),
                          }}
                          className={`border-r border-lightSilver pr-[20px]`}
                        >
                          {statusIconMappingForEmailbox[item.TabName]}
                        </span>
                        <div className="inline-flex flex-col items-start pl-[20px]">
                          <span className="text-[14px] font-normal text-darkCharcoal">
                            {item.TabName}
                          </span>
                          <span className="text-[20px] text-slatyGrey font-semibold">
                            {item.Count}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Grid>
                ))}
          </Grid>

          {/* email type and sla ticket Charts */}
          <section className="flex gap-[20px] items-center px-[20px] py-[10px]">
            <Card className="w-full h-[344px] border border-lightSilver rounded-lg px-[10px]">
              <Chart_EmailType
                dashboardEmailboxEmailTypeCounts={
                  dashboardEmailboxEmailTypeCounts
                }
                sendData={handleValueFromEmailType}
                currentFilterData={currentFilterData}
              />
            </Card>
            <Card className="w-full h-[344px] border border-lightSilver rounded-lg px-[10px]">
              <Chart_SLA
                dashboardEmailboxSLACounts={dashboardEmailboxSLACounts}
                sendData={handleValueFromSLA}
                currentFilterData={currentFilterData}
              />
            </Card>
          </section>

          {/* status and priority Charts */}
          <section className="flex gap-[20px] items-center px-[20px] py-[10px]">
            <Card className="w-full h-[344px] border border-lightSilver rounded-lg px-[10px]">
              <Chart_Status
                dashboardEmailboxStatus={dashboardEmailboxStatus}
                sendData={handleValueFromStatus}
                currentFilterData={currentFilterData}
              />
            </Card>
            <Card className="w-full h-[344px] border border-lightSilver rounded-lg px-[10px]">
              <Chart_EmailPriority
                dashboardEmailboxPriority={dashboardEmailboxPriority}
                sendData={handleValueFromPriority}
                currentFilterData={currentFilterData}
              />
            </Card>
          </section>
        </div>
      )}

      {/* Dashboard Summary Dialog & Datatable */}
      {dashboardActiveTab === 1 && (
        <Dialog_DashboardSummaryList
          onOpen={isSummaryDialogOpen}
          onClose={() => setIsSummaryDialogOpen(false)}
          currentFilterData={currentFilterData}
          onClickedSummaryTitle={clickedCardName}
        />
      )}

      {/* Task Status Dialog & Datatable */}
      {dashboardActiveTab === 1 && (
        <Dialog_TaskStatus
          onOpen={isTaskStatusDialogOpen}
          onClose={() => {
            setIsTaskStatusDialogOpen(false);
            setClickedStatusName("");
          }}
          currentFilterData={currentFilterData}
          onSelectedStatusName={clickedStatusName}
        />
      )}

      {/* Billing Type Dialog & Datatable */}
      {dashboardActiveTab === 1 && (
        <Dialog_BillingType
          onOpen={isBillingTypeDialogOpen}
          onClose={() => {
            setIsBillingTypeDialogOpen(false);
            setClickedBillingTypeName("");
          }}
          currentFilterData={currentFilterData}
          onSelectedStatusName={clickedBillingTypeName}
        />
      )}

      {/* Project Status Dialog & Datatable */}
      {dashboardActiveTab === 1 && (
        <Dialog_ProjectStatus
          onOpen={isProjectStatusDialogOpen}
          onClose={() => setIsProjectStatusDialogOpen(false)}
          currentFilterData={currentFilterData}
          onSelectedProjectStatus={clickedProjectStatusName}
          onSelectedProjectIds={[]}
        />
      )}

      {/* Errorlog Dialog & Datatable */}
      {dashboardActiveTab === 1 && (
        <Dialog_Errorlog
          onOpen={isErrorlogDialogOpen}
          onClose={() => {
            setIsErrorlogDialogOpen(false);
            setClickedErrorlog(0);
          }}
          currentFilterData={currentFilterData}
          onSelectedErrorlog={clickedErrorlog}
          onSelectedProjectIds={[]}
        />
      )}

      {/* EmailType Dialog & Datatable */}
      {dashboardActiveTab === 2 && (
        <Dialog_EmailType
          onOpen={isEmailTypeDialogOpen}
          onClose={() => {
            setIsEmailTypeDialogOpen(false);
            setClickedEmailType("");
          }}
          currentFilterData={currentFilterData}
          onSelectedStatusName={clickedEmailType}
        />
      )}

      {/* SLA Dialog & Datatable */}
      {dashboardActiveTab === 2 && (
        <Dialog_SLA
          onOpen={isSLADialogOpen}
          onClose={() => {
            setIsSLADialogOpen(false);
            setClickedSLA(0);
          }}
          currentFilterData={currentFilterData}
          onSelectedSLA={clickedSLA}
        />
      )}

      {/* Status Dialog & Datatable */}
      {dashboardActiveTab === 2 && (
        <Dialog_Status
          onOpen={isStatusDialogOpen}
          onClose={() => {
            setIsStatusDialogOpen(false);
            setClickedStatus(0);
          }}
          currentFilterData={currentFilterData}
          onSelectedStatus={clickedStatus}
        />
      )}

      {/* Priority Dialog & Datatable */}
      {dashboardActiveTab === 2 && (
        <Dialog_Priority
          onOpen={isPriorityDialogOpen}
          onClose={() => {
            setIsPriorityDialogOpen(false);
            setClickedPriority(0);
          }}
          currentFilterData={currentFilterData}
          onSelectedPriority={clickedPriority}
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
