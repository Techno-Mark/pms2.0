"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Wrapper from "@/components/common/Wrapper";
import { Card, Grid, ThemeProvider } from "@mui/material";
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
  handleChangeRowsPerPageWithFilter,
  handlePageChangeWithFilter,
} from "@/utils/datatable/CommonFunction";
import { adminDashboardReportCols } from "@/utils/datatable/columns/AdminDatatableColumns";
import { getMuiTheme, ColorToolTip } from "@/utils/datatable/CommonStyle";
import ExportIcon from "@/assets/icons/ExportIcon";
import Loading from "@/assets/icons/reports/Loading";
import { dashboardReport_Options } from "@/utils/datatable/TableOptions";
import { callAPI } from "@/utils/API/callAPI";
import { KeyValueColorCodeSequence } from "@/utils/Types/types";
import FilterIcon from "@/assets/icons/FilterIcon";
import FilterDialogDashboard from "@/components/admin-dashboard/FilterDialogDashboard";
import { DashboardInitialFilter } from "@/utils/Types/dashboardTypes";

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

const Page = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<number>(1);
  const [isBillingTypeDialogOpen, setIsBillingTypeDialogOpen] =
    useState<boolean>(false);
  const [isTaskStatusDialogOpen, setIsTaskStatusDialogOpen] =
    useState<boolean>(false);
  const [isProjectStatusDialogOpen, setIsProjectStatusDialogOpen] =
    useState<boolean>(false);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] =
    useState<boolean>(false);
  const [clickedProjectStatusName, setClickedProjectStatusName] =
    useState<number>(0);
  const [clickedStatusName, setClickedStatusName] = useState<string>("");
  const [clickedBillingTypeName, setClickedBillingTypeName] =
    useState<string>("");
  const [dashboardSummary, setDashboardSummary] = useState<
    KeyValueColorCodeSequence[] | []
  >([]);
  const [clickedCardName, setClickedCardName] = useState<number>(0);
  const [reportData, setReportData] = useState<ClientSummaryStatus[] | []>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [tableDataCount, setTableDataCount] = useState(0);
  const [filteredObject, setFilteredObject] =
    useState<InitialFilter>(initialFilter);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isFilterOpen, setisFilterOpen] = useState<boolean>(false);
  const [currentFilterData, setCurrentFilterData] =
    useState<DashboardInitialFilter>({
      Clients: [],
      TypeOfWork: 3,
      StartDate: null,
      EndDate: null,
    });

  const handleCloseFilter = () => {
    setisFilterOpen(false);
  };

  const getIdFromFilterDialog = (data: DashboardInitialFilter) => {
    setCurrentFilterData(data);
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

  useEffect(() => {
    if (
      !hasPermissionWorklog("", "View", "Dashboard") &&
      localStorage.getItem("isClient")
    ) {
      router.push("/");
    }
  }, [router]);

  const getReportData = async () => {
    const params = { ...filteredObject, ...currentFilterData };
    const url = `${process.env.report_api_url}/dashboard/dashboardclientsummary`;
    const successCallback = (
      ResponseData: DashboardSummaryReport,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setReportData(ResponseData.ClientSummary);
        setTableDataCount(ResponseData.TotalCount);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    activeTab === 2 && getReportData();
  }, [activeTab, filteredObject, currentFilterData]);

  const getProjectSummary = async () => {
    const params = {
      Clients: currentFilterData.Clients,
      WorkTypeId:
        currentFilterData.TypeOfWork === null
          ? 0
          : currentFilterData.TypeOfWork,
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
    <Wrapper className="min-h-screen overflow-y-auto">
      <Navbar />

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
          <ColorToolTip title="Filter" placement="top" arrow>
            <span
              className="cursor-pointer"
              onClick={() => setisFilterOpen(true)}
            >
              <FilterIcon />
            </span>
          </ColorToolTip>
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

      {activeTab === 2 && (
        <ThemeProvider theme={getMuiTheme()}>
          <MUIDataTable
            data={reportData}
            columns={adminDashboardReportCols}
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
        onClose={handleCloseFilter}
        currentFilterData={getIdFromFilterDialog}
      />
    </Wrapper>
  );
};

export default Page;
