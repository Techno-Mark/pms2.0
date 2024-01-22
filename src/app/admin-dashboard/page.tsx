/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Wrapper from "@/components/common/Wrapper";
import {
  Autocomplete,
  Card,
  FormControl,
  Grid,
  TextField,
  ThemeProvider,
} from "@mui/material";
import { toast } from "react-toastify";
import { hasPermissionWorklog } from "@/utils/commonFunction";
import Chart_BillingType from "@/components/admin-dashboard/charts/Chart_BillingType";
import Chart_TaskStatus from "@/components/admin-dashboard/charts/Chart_TaskStatus";
import Chart_ProjectStatus from "@/components/admin-dashboard/charts/Chart_ProjectStatus";
import InReview from "@/assets/icons/dashboard_Admin/InReview";
import Withdraw_Outlined from "@/assets/icons/dashboard_Admin/Withdraw_Outlined";
import InPreparation from "@/assets/icons/dashboard_Admin/InPreparation";
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
import { getClientDropdownData } from "@/utils/commonDropdownApiCall";
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

const pageNo = 1;
const pageSize = 10;

const initialFilter = {
  PageSize: pageSize,
  PageNo: pageNo,
  SortColumn: "",
  IsDesc: true,
  Clients: null,
};

const Page = () => {
  const router = useRouter();
  const [isBillingTypeDialogOpen, setIsBillingTypeDialogOpen] =
    useState<boolean>(false);
  const [isTaskStatusDialogOpen, setIsTaskStatusDialogOpen] =
    useState<boolean>(false);
  const [isProjectStatusDialogOpen, setIsProjectStatusDialogOpen] =
    useState<boolean>(false);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] =
    useState<boolean>(false);
  const [clickedProjectStatusName, setClickedProjectStatusName] =
    useState<string>("");
  const [clickedStatusName, setClickedStatusName] = useState<string>("");
  const [clickedBillingTypeName, setClickedBillingTypeName] =
    useState<string>("");
  const [dashboardSummary, setDashboardSummary] = useState<any | any[]>([]);
  const [clickedCardName, setClickedCardName] = useState<string>("");
  const [isDashboardClicked, setIsDashboardClicked] = useState(true);
  const [isReportClicked, setIsReportClicked] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [tableDataCount, setTableDataCount] = useState(0);
  const [filteredObject, setFilteredObject] = useState<any>(initialFilter);
  const [clients, setClients] = useState<any[]>([]);
  const [clientDropdownData, setClientDropdownData] = useState<any>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);

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
    selectedPointData: string
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
    const params = filteredObject;
    const url = `${process.env.report_api_url}/dashboard/dashboardclientsummary`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setReportData(ResponseData.ClientSummary);
        setTableDataCount(ResponseData.TotalCount);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const getData = async () => {
      setClientDropdownData(await getClientDropdownData());
    };

    isReportClicked && getReportData();
    isReportClicked && getData();
  }, [isDashboardClicked, isReportClicked, filteredObject]);

  const getProjectSummary = async () => {
    const params = {
      WorkTypeId: null,
    };
    const url = `${process.env.report_api_url}/dashboard/summary`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setDashboardSummary(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    getProjectSummary();
  }, []);

  const statusIconMapping: any = {
    Assigned: <Person4OutlinedIcon />,
    Accepted: <CheckCircleOutlineOutlinedIcon />,
    "In Preparation": <InPreparation />,
    "In Review": <InReview />,
    "Error Logs": <ErrorOutlineIcon />,
    "Not Started": <PendingActionsOutlinedIcon />,
    "Overdue Task": <RunningWithErrorsOutlinedIcon />,
    Rejected: <CancelOutlinedIcon />,
    "On Hold": <PauseCircleOutlineOutlinedIcon />,
    Withdraw: <Withdraw_Outlined />,
    Rework: <RestorePageOutlinedIcon />,
    "Total Received": <PlaylistAddCheckOutlinedIcon />,
    "Review Completed": <TaskOutlinedIcon />,
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
      <div>
        <Navbar />

        <div className="flex items-center justify-between w-full px-6">
          <div className="flex gap-[16px] items-center py-[6.5px]">
            <label
              onClick={() => {
                setIsDashboardClicked(true);
                setIsReportClicked(false);
                setClients([]);
              }}
              className={`py-[10px] text-[16px] cursor-pointer select-none ${
                isDashboardClicked
                  ? "text-secondary font-semibold"
                  : "text-slatyGrey"
              }`}
            >
              Dashboard
            </label>
            <span className="text-lightSilver">|</span>
            <label
              onClick={() => {
                setIsReportClicked(true);
                setIsDashboardClicked(false);
                setClients([]);
                setFilteredObject({ ...filteredObject, Clients: null });
              }}
              className={`py-[10px] text-[16px] cursor-pointer select-none ${
                isReportClicked
                  ? "text-secondary font-semibold"
                  : "text-slatyGrey"
              }`}
            >
              Report
            </label>
          </div>

          {isReportClicked && (
            <div className="flex items-center justify-center gap-2">
              <FormControl
                variant="standard"
                sx={{ mx: 0.75, my: 0.4, minWidth: 210 }}
              >
                <Autocomplete
                  multiple
                  id="tags-standard"
                  options={clientDropdownData.filter(
                    (option: any) =>
                      !clients.find(
                        (client: any) => client.value === option.value
                      )
                  )}
                  getOptionLabel={(option: any) => option.label}
                  onChange={(e: any, data: any) => {
                    setFilteredObject({
                      ...filteredObject,
                      Clients: data.map((i: any) => i.value),
                    });
                    setClients(data);
                  }}
                  value={clients}
                  renderInput={(params: any) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Client Name"
                    />
                  )}
                />
              </FormControl>
              <ColorToolTip title="Export" placement="top" arrow>
                <span
                  className={`${
                    isExporting ? "cursor-default" : "cursor-pointer"
                  } mt-7`}
                  onClick={exportSummaryReport}
                >
                  {isExporting ? <Loading /> : <ExportIcon />}
                </span>
              </ColorToolTip>
            </div>
          )}
        </div>

        {isDashboardClicked && (
          <div className="py-[10px]">
            <Grid
              container
              className="flex items-center px-[20px] py-[10px]"
              gap={1}
            >
              {dashboardSummary &&
                dashboardSummary.slice(0, 4).map((item: any) => (
                  <Grid xs={2.9} item key={item.Key}>
                    <Card
                      className={`w-full border shadow-md hover:shadow-xl cursor-pointer`}
                      style={{ borderColor: item.ColorCode }}
                    >
                      <div
                        className="flex p-[20px] items-center"
                        onClick={() => {
                          setClickedCardName(item.Key);
                          setIsSummaryDialogOpen(true);
                        }}
                      >
                        <span
                          style={{ color: item.ColorCode }}
                          className={`border-r border-lightSilver pr-[20px]`}
                        >
                          {statusIconMapping[item.Key]}
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
                dashboardSummary.slice(4, 8).map((item: any) => (
                  <Grid xs={2.9} item key={item.Key}>
                    <Card
                      className={`w-full border shadow-md hover:shadow-xl cursor-pointer`}
                      style={{ borderColor: item.ColorCode }}
                    >
                      <div
                        className="flex p-[20px] items-center"
                        onClick={() => {
                          setClickedCardName(item.Key);
                          setIsSummaryDialogOpen(true);
                        }}
                      >
                        <span
                          style={{ color: item.ColorCode }}
                          className={`border-r border-lightSilver pr-[20px]`}
                        >
                          {statusIconMapping[item.Key]}
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
                dashboardSummary.slice(8, 12).map((item: any) => (
                  <Grid xs={2.9} item key={item.Key}>
                    <Card
                      className={`w-full border shadow-md hover:shadow-xl cursor-pointer`}
                      style={{ borderColor: item.ColorCode }}
                    >
                      <div
                        className="flex p-[20px] items-center"
                        onClick={() => {
                          setClickedCardName(item.Key);
                          setIsSummaryDialogOpen(true);
                        }}
                      >
                        <span
                          style={{ color: item.ColorCode }}
                          className={`border-r border-lightSilver pr-[20px]`}
                        >
                          {statusIconMapping[item.Key]}
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
                  onSelectedProjectIds={[]}
                  onSelectedWorkType={0}
                />
              </Card>
            </section>

            {/* Project Status and Billing Type Charts */}
            <section className="flex gap-[20px] items-center px-[20px] py-[10px]">
              <Card className="w-full h-[344px] border border-lightSilver rounded-lg px-[10px]">
                <Chart_ProjectStatus
                  sendData={handleValueFromProjectStatus}
                  onSelectedProjectIds={[]}
                  onSelectedWorkType={0}
                />
              </Card>

              <Card className="w-full h-[344px] border border-lightSilver rounded-lg px-[10px]">
                <Chart_BillingType
                  sendData={handleValueFromBillingType}
                  onSelectedProjectIds={[]}
                  onSelectedWorkType={0}
                />
              </Card>
            </section>
          </div>
        )}

        {/* Dashboard Summary Dialog & Datatable */}
        {isDashboardClicked && (
          <Dialog_DashboardSummaryList
            onOpen={isSummaryDialogOpen}
            onClose={() => setIsSummaryDialogOpen(false)}
            onSelectedWorkType={0}
            onClickedSummaryTitle={clickedCardName}
          />
        )}

        {/* Task Status Dialog & Datatable */}
        {isDashboardClicked && (
          <Dialog_TaskStatus
            onOpen={isTaskStatusDialogOpen}
            onClose={() => setIsTaskStatusDialogOpen(false)}
            onSelectedWorkType={0}
            onSelectedStatusName={clickedStatusName}
          />
        )}

        {/* Billing Type Dialog & Datatable */}
        {isDashboardClicked && (
          <Dialog_BillingType
            onOpen={isBillingTypeDialogOpen}
            onClose={() => setIsBillingTypeDialogOpen(false)}
            onSelectedWorkType={0}
            onSelectedStatusName={clickedBillingTypeName}
          />
        )}

        {/* Project Status Dialog & Datatable */}
        {isDashboardClicked && (
          <Dialog_ProjectStatus
            onOpen={isProjectStatusDialogOpen}
            onClose={() => setIsProjectStatusDialogOpen(false)}
            onSelectedWorkType={0}
            onSelectedProjectStatus={clickedProjectStatusName}
            onSelectedProjectIds={[]}
          />
        )}

        {isReportClicked && (
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
      </div>
    </Wrapper>
  );
};

export default Page;
