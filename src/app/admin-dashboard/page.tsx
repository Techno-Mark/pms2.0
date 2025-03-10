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
import { Delete, Edit } from "@mui/icons-material";
import SearchIcon from "@/assets/icons/SearchIcon";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
import Chart_Errorlog from "@/components/admin-dashboard/charts/Chart_Errorlog";
import Dialog_Errorlog from "@/components/admin-dashboard/dialog/Dialog_Errorlog";

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
  const [isBillingTypeDialogOpen, setIsBillingTypeDialogOpen] =
    useState<boolean>(false);
  const [isTaskStatusDialogOpen, setIsTaskStatusDialogOpen] =
    useState<boolean>(false);
  const [isProjectStatusDialogOpen, setIsProjectStatusDialogOpen] =
    useState<boolean>(false);
  const [isErrorlogDialogOpen, setIsErrorlogDialogOpen] =
    useState<boolean>(false);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] =
    useState<boolean>(false);
  const [clickedProjectStatusName, setClickedProjectStatusName] =
    useState<number>(0);
  const [clickedErrorlog, setClickedErrorlog] = useState<number>(0);
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
      type: activeTab === 1 ? 23 : 24,
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
  }, [activeTab]);

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

  useEffect(() => {
    const fetchData = async () => {
      await getProjectSummary();
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [currentFilterData]);

  const statusIconMapping: any = {
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
      <div className="flex items-center justify-between w-full px-6">
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

        <div className="flex items-center justify-center gap-2">
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

                  {filteredFilters.map((i: any) => {
                    return (
                      <div
                        key={i.FilterId}
                        className="group px-2 cursor-pointer bg-whiteSmoke hover:bg-lightSilver flex justify-between items-center h-9"
                      >
                        <span
                          className="pl-1"
                          onClick={() => {
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
                      handleCloseFilter();
                      setCurrentFilterData(currentFilter);
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
          {activeTab === 2 && (
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
          )}
        </div>
      </div>

      {activeTab === 1 && (
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
            <Card className="w-full"></Card>
          </section>
        </div>
      )}

      {/* Dashboard Summary Dialog & Datatable */}
      {activeTab === 1 && (
        <Dialog_DashboardSummaryList
          onOpen={isSummaryDialogOpen}
          onClose={() => setIsSummaryDialogOpen(false)}
          currentFilterData={currentFilterData}
          onClickedSummaryTitle={clickedCardName}
        />
      )}

      {/* Task Status Dialog & Datatable */}
      {activeTab === 1 && (
        <Dialog_TaskStatus
          onOpen={isTaskStatusDialogOpen}
          onClose={() => setIsTaskStatusDialogOpen(false)}
          currentFilterData={currentFilterData}
          onSelectedStatusName={clickedStatusName}
        />
      )}

      {/* Billing Type Dialog & Datatable */}
      {activeTab === 1 && (
        <Dialog_BillingType
          onOpen={isBillingTypeDialogOpen}
          onClose={() => setIsBillingTypeDialogOpen(false)}
          currentFilterData={currentFilterData}
          onSelectedStatusName={clickedBillingTypeName}
        />
      )}

      {/* Project Status Dialog & Datatable */}
      {activeTab === 1 && (
        <Dialog_ProjectStatus
          onOpen={isProjectStatusDialogOpen}
          onClose={() => setIsProjectStatusDialogOpen(false)}
          currentFilterData={currentFilterData}
          onSelectedProjectStatus={clickedProjectStatusName}
          onSelectedProjectIds={[]}
        />
      )}

      {/* Errorlog Dialog & Datatable */}
      {activeTab === 1 && (
        <Dialog_Errorlog
          onOpen={isErrorlogDialogOpen}
          onClose={() => setIsErrorlogDialogOpen(false)}
          currentFilterData={currentFilterData}
          onSelectedErrorlog={clickedErrorlog}
          onSelectedProjectIds={[]}
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
