import React, { useEffect, useState } from "react";
import ReportLoader from "../common/ReportLoader";
import { Card, Grid } from "@mui/material";
import Chart_EmailType from "./charts/Chart_EmailType";
import Chart_SLA from "./charts/Chart_SLA";
import Chart_Status from "./charts/Chart_Status";
import Chart_EmailPriority from "./charts/Chart_EmailPriority";
import { callAPI } from "@/utils/API/callAPI";
import { DashboardInitialFilter } from "@/utils/Types/dashboardTypes";
import { generateEmailboxStatusColor } from "@/utils/datatable/CommonFunction";
import PlaylistAddCheckOutlinedIcon from "@mui/icons-material/PlaylistAddCheckOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import InPreparation from "@/assets/icons/dashboard_Admin/InPreparation";
import InReview from "@/assets/icons/dashboard_Admin/InReview";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import Withdraw_Outlined from "@/assets/icons/dashboard_Admin/Withdraw_Outlined";
import RestorePageOutlinedIcon from "@mui/icons-material/RestorePageOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Dialog_EmailType from "./dialog/Dialog_EmailType";
import Dialog_SLA from "./dialog/Dialog_SLA";
import Dialog_Status from "./dialog/Dialog_Status";
import Dialog_Priority from "./dialog/Dialog_Priority";

const statusIconMappingForEmailbox: { [key: number | string]: JSX.Element } = {
  Total: <PlaylistAddCheckOutlinedIcon />,
  Unprocessed: <PendingActionsOutlinedIcon />,
  Inbox: <InPreparation />,
  Approval: <InReview />,
  Draft: <PauseCircleOutlineOutlinedIcon />,
  Junk: <Withdraw_Outlined />,
  Sent: <RestorePageOutlinedIcon />,
  Failed: <ErrorOutlineIcon />,
};

const EmailTicketCharts = ({
  emailboxLoading,
  setEmailboxLoading,
  activeTab,
  dashboardActiveTab,
  currentFilterData,
}: {
  emailboxLoading: boolean;
  setEmailboxLoading: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab: number;
  dashboardActiveTab: number;
  currentFilterData: DashboardInitialFilter;
}) => {
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
  const [isEmailTypeDialogOpen, setIsEmailTypeDialogOpen] =
    useState<boolean>(false);
  const [isSLADialogOpen, setIsSLADialogOpen] = useState<boolean>(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState<boolean>(false);
  const [isPriorityDialogOpen, setIsPriorityDialogOpen] =
    useState<boolean>(false);
  const [clickedSLA, setClickedSLA] = useState<number>(0);
  const [clickedStatus, setClickedStatus] = useState<number>(0);
  const [clickedPriority, setClickedPriority] = useState<number>(0);
  const [clickedEmailType, setClickedEmailType] = useState<string>("");

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
      activeTab === 1 && dashboardActiveTab == 2 && (await getSummary());
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [currentFilterData, dashboardActiveTab]);

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

  return (
    <>
      {emailboxLoading ? (
        <ReportLoader />
      ) : (
        <div className="py-[10px]">
          {dashboardEmailboxSummary &&
            [...Array(Math.ceil(dashboardEmailboxSummary.length / 4))].map(
              (_, rowIndex) => (
                <Grid
                  container
                  key={rowIndex}
                  className="flex items-center px-[20px] py-[10px]"
                  gap={1}
                >
                  {dashboardEmailboxSummary
                    .slice(rowIndex * 4, rowIndex * 4 + 4)
                    .map((item: { TabName: string; Count: number }, index) => (
                      <Grid xs={2.9} item key={index}>
                        <Card
                          className="w-full border shadow-md hover:shadow-xl"
                          style={{
                            borderColor: generateEmailboxStatusColor(
                              item.TabName
                            ),
                          }}
                        >
                          <div className="flex p-[20px] items-center">
                            <span
                              style={{
                                color: generateEmailboxStatusColor(
                                  item.TabName
                                ),
                              }}
                              className="border-r border-lightSilver pr-[20px]"
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
              )
            )}

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
      <Dialog_EmailType
        onOpen={isEmailTypeDialogOpen}
        onClose={() => {
          setIsEmailTypeDialogOpen(false);
          setClickedEmailType("");
        }}
        currentFilterData={currentFilterData}
        onSelectedStatusName={clickedEmailType}
      />
      <Dialog_SLA
        onOpen={isSLADialogOpen}
        onClose={() => {
          setIsSLADialogOpen(false);
          setClickedSLA(0);
        }}
        currentFilterData={currentFilterData}
        onSelectedSLA={clickedSLA}
      />
      <Dialog_Status
        onOpen={isStatusDialogOpen}
        onClose={() => {
          setIsStatusDialogOpen(false);
          setClickedStatus(0);
        }}
        currentFilterData={currentFilterData}
        onSelectedStatus={clickedStatus}
      />
      <Dialog_Priority
        onOpen={isPriorityDialogOpen}
        onClose={() => {
          setIsPriorityDialogOpen(false);
          setClickedPriority(0);
        }}
        currentFilterData={currentFilterData}
        onSelectedPriority={clickedPriority}
      />
    </>
  );
};

export default EmailTicketCharts;
