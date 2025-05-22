import { callAPI } from "@/utils/API/callAPI";
import {
  DashboardInitialFilter,
  ListProjectStatusSequence,
} from "@/utils/Types/dashboardTypes";
import { KeyValueColorCodeSequence } from "@/utils/Types/types";
import { Card, Grid } from "@mui/material";
import React, { useEffect, useState } from "react";
import Chart_BillingType from "@/components/admin-dashboard/charts/Chart_BillingType";
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
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Chart_Errorlog from "./charts/Chart_Errorlog";
import Dialog_DashboardSummaryList from "./dialog/Dialog_DashboardSummaryList";
import Dialog_TaskStatus from "./dialog/Dialog_TaskStatus";
import Dialog_BillingType from "./dialog/Dialog_BillingType";
import Dialog_ProjectStatus from "./dialog/Dialog_ProjectStatus";
import Dialog_Errorlog from "./dialog/Dialog_Errorlog";
import Chart_TaskStatus from "./charts/Chart_TaskStatus";
import ReportLoader from "../common/ReportLoader";

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

interface ProjectResponse {
  List: ListProjectStatusSequence[] | [];
  TotalCount: number;
}

interface BillingList {
  Percentage: number;
  Key: string;
  Value: number;
}

interface BillingResponse {
  List: BillingList[] | [];
  TotalCount: number;
}

interface ErrorlogResponse {
  List: ListProjectStatusSequence[] | [];
  TotalCount: number;
}

const TaskChart = ({
  activeTab,
  dashboardActiveTab,
  currentFilterData,
}: {
  activeTab: number;
  dashboardActiveTab: number;
  currentFilterData: DashboardInitialFilter;
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<string>("");
  const [dashboardSummary, setDashboardSummary] = useState<
    KeyValueColorCodeSequence[] | []
  >([]);
  const [clickedProjectStatusName, setClickedProjectStatusName] =
    useState<number>(0);
  const [clickedErrorlog, setClickedErrorlog] = useState<number>(0);
  const [clickedStatusName, setClickedStatusName] = useState<string>("");
  const [clickedBillingTypeName, setClickedBillingTypeName] =
    useState<string>("");
  const [clickedCardName, setClickedCardName] = useState<number>(0);
  const [projectData, setProjectData] = useState<any[]>([]);
  const [projectTotalCount, setProjectTotalCount] = useState<number>(0);
  const [billingData, setBillingData] = useState<any[]>([]);
  const [billingTotalCount, setBillingTotalCount] = useState<number>(0);
  const [errorlogData, setErrorlogData] = useState<any[]>([]);
  const [allDataLoaded, setAllDataLoaded] = useState({
    1: true,
    2: true,
    3: true,
    4: true,
  });

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
      setAllDataLoaded((prev: any) => ({ ...prev, 1: false }));
    };
    callAPI(url, params, successCallback, "POST");
  };

  const getProjectStatusData = async () => {
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
    const url = `${process.env.report_api_url}/dashboard/projectstatusgraph`;
    const successCallback = (
      ResponseData: ProjectResponse,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        const chartData = ResponseData.List.map(
          (item: ListProjectStatusSequence) => ({
            name: item.Key,
            y: item.Value,
            percentage: item.Percentage,
            ColorCode: item.ColorCode,
            Sequence: item.Sequence,
          })
        );

        setProjectData(chartData);
        setProjectTotalCount(ResponseData.TotalCount);
      }
      setAllDataLoaded((prev: any) => ({ ...prev, 2: false }));
    };
    callAPI(url, params, successCallback, "POST");
  };

  const getBillingTypeData = async () => {
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
    const url = `${process.env.report_api_url}/dashboard/billingstatusgraph`;
    const successCallback = (
      ResponseData: BillingResponse,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        const chartData = ResponseData.List.map((item: BillingList) => ({
          name: item.Key,
          y: item.Value,
          percentage: item.Percentage,
        }));

        setBillingData(chartData);
        setBillingTotalCount(ResponseData.TotalCount);
      }
      setAllDataLoaded((prev: any) => ({ ...prev, 3: false }));
    };
    callAPI(url, params, successCallback, "POST");
  };

  const getErrorlogData = async () => {
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
    const url = `${process.env.report_api_url}/dashboard/errorloggraph`;
    const successCallback = (
      ResponseData: ErrorlogResponse,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        const chartData = ResponseData.List.map(
          (item: ListProjectStatusSequence) => ({
            name: item.Key,
            y: item.Value,
            z: item.Percentage,
            ColorCode: item.ColorCode,
            // Sequence: item.Sequence,
          })
        );

        setErrorlogData(chartData);
      }
      setAllDataLoaded((prev: any) => ({ ...prev, 4: false }));
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    if (activeTab === 1 && dashboardActiveTab === 1) {
      setLoading(true);
      setAllDataLoaded({
        1: true,
        2: true,
        3: true,
        4: true,
      });

      const timer = setTimeout(() => {
        const fetchData = async () => {
          try {
            await Promise.all([
              getProjectSummary(),
              getProjectStatusData(),
              getBillingTypeData(),
              getErrorlogData(),
            ]);
          } catch (error) {
            console.error("Error in one of the API calls:", error);
          } finally {
            setLoading(false);
          }
        };

        fetchData();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentFilterData, dashboardActiveTab]);

  return (
    <>
      {loading &&
      !Object.values(allDataLoaded).every((val) => val === false) ? (
        <ReportLoader />
      ) : (
        <div className="py-[10px]">
          {dashboardSummary &&
            [...Array(Math.ceil(dashboardSummary.length / 4))].map(
              (_, rowIndex) => (
                <Grid
                  container
                  key={rowIndex}
                  className="flex items-center px-[20px] py-[10px]"
                  gap={1}
                >
                  {dashboardSummary
                    .slice(rowIndex * 4, rowIndex * 4 + 4)
                    .map((item: KeyValueColorCodeSequence) => (
                      <Grid xs={2.9} item key={item.Key}>
                        <Card
                          className="w-full border shadow-md hover:shadow-xl cursor-pointer"
                          style={{ borderColor: item.ColorCode }}
                        >
                          <div
                            className="flex p-[20px] items-center"
                            onClick={() => {
                              setClickedCardName(item.Sequence);
                              setIsDialogOpen("summary");
                            }}
                          >
                            <span
                              style={{ color: item.ColorCode }}
                              className="border-r border-lightSilver pr-[20px]"
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
              )
            )}

          <section className="flex gap-[20px] items-center px-[20px] py-[10px]">
            <Card className="w-full border border-lightSilver rounded-lg">
              <Chart_TaskStatus
                sendData={(selectedPointData: string) => {
                  setIsDialogOpen("taskStatus");
                  setClickedStatusName(selectedPointData);
                }}
                currentFilterData={currentFilterData}
              />
            </Card>
          </section>

          <section className="flex gap-[20px] items-center px-[20px] py-[10px]">
            <Card className="w-full h-[344px] border border-lightSilver rounded-lg px-[10px]">
              <Chart_ProjectStatus
                data={projectData}
                totalCount={projectTotalCount}
                sendData={(selectedPointData: number) => {
                  setIsDialogOpen("projectStatus");
                  setClickedProjectStatusName(selectedPointData);
                }}
              />
            </Card>

            <Card className="w-full h-[344px] border border-lightSilver rounded-lg px-[10px]">
              <Chart_BillingType
                data={billingData}
                totalCount={billingTotalCount}
                sendData={(selectedPointData: string) => {
                  setIsDialogOpen("billingType");
                  setClickedBillingTypeName(selectedPointData);
                }}
              />
            </Card>
          </section>

          <section className="flex gap-[20px] items-center px-[20px] py-[10px]">
            <Card className="w-full h-[344px] border border-lightSilver rounded-lg px-[10px]">
              <Chart_Errorlog
                data={errorlogData}
                sendData={(selectedPointData: number) => {
                  setIsDialogOpen("errorlog");
                  setClickedErrorlog(selectedPointData);
                }}
              />
            </Card>
            <div className="w-full h-[344px]"></div>
          </section>
        </div>
      )}

      <Dialog_DashboardSummaryList
        onOpen={isDialogOpen === "summary"}
        onClose={() => setIsDialogOpen("")}
        currentFilterData={currentFilterData}
        onClickedSummaryTitle={clickedCardName}
      />

      <Dialog_TaskStatus
        onOpen={isDialogOpen === "taskStatus"}
        onClose={() => setIsDialogOpen("")}
        currentFilterData={currentFilterData}
        onSelectedStatusName={clickedStatusName}
      />

      <Dialog_BillingType
        onOpen={isDialogOpen === "billingType"}
        onClose={() => setIsDialogOpen("")}
        currentFilterData={currentFilterData}
        onSelectedStatusName={clickedBillingTypeName}
      />

      <Dialog_ProjectStatus
        onOpen={isDialogOpen === "projectStatus"}
        onClose={() => setIsDialogOpen("")}
        currentFilterData={currentFilterData}
        onSelectedProjectStatus={clickedProjectStatusName}
      />

      <Dialog_Errorlog
        onOpen={isDialogOpen === "errorlog"}
        onClose={() => setIsDialogOpen("")}
        currentFilterData={currentFilterData}
        onSelectedErrorlog={clickedErrorlog}
      />
    </>
  );
};

export default TaskChart;
