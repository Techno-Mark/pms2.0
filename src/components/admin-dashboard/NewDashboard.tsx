import { callAPI } from "@/utils/API/callAPI";
import { DashboardInitialFilter } from "@/utils/Types/dashboardTypes";
import { Card } from "@mui/material";
import React, { useEffect, useState } from "react";
import Chart_TasksSubmittedVsAssigned from "./charts/Chart_TasksSubmittedVsAssigned";
import Chart_BillableNonBillable from "./charts/Chart_BillableNonBillable";
import Chart_PeakProductivityHours from "./charts/Chart_PeakProductivityHours";
import ReportLoader from "../common/ReportLoader";
import Chart_LoggedVsWorking from "./charts/Chart_LoggedVsWorking";
import Chart_SLATATAchivement from "./charts/Chart_SLATATAchivement";
import Chart_ReworkTrend from "./charts/Chart_ReworkTrend";
import Chart_ManualVsAuto from "./charts/Chart_ManualVsAuto";
import Dialog_TasksSubmittedAssigned from "./dialog/Dialog_TasksSubmittedAssigned";
import Dialog_ReworkTrend from "./dialog/Dialog_ReworkTrend";
import Dialog_AutoManual from "./dialog/Dialog_AutoManual";
import Dialog_PeakPoductive from "./dialog/Dialog_PeakPoductive";
import Dialog_BillableNonBillable from "./dialog/Dialog_BillableNonBillable";
import Dialog_SLATATAchivement from "./dialog/Dialog_SLATATAchivement";
import Dialog_LoggedWorking from "./dialog/Dialog_LoggedWorking";

const NewDashboard = ({
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
  const [taskLoading, setTaskLoading] = useState<boolean>(true);
  const [taskSubmittedAssignedData, setTaskSubmittedAssignedData] = useState<
    any[]
  >([]);
  const [taskSubmittedAssigned, setTaskSubmittedAssigned] = useState<{
    department: number;
    type: string;
  }>({ department: 0, type: "" });
  const [reworkLoading, setReworkLoading] = useState<boolean>(true);
  const [reworkData, setReworkData] = useState<any>([]);
  const [reworkTrend, setReworkTrend] = useState<number>(0);
  const [autoManualLoading, setAutoManualLoading] = useState<boolean>(true);
  const [autoManualTimeData, setAutoManualTimeData] = useState<any[]>([]);
  const [autoManual, setAutoManual] = useState<{
    department: number;
    type: number;
  }>({ department: 0, type: 0 });
  const [peakProductiveLoading, setPeakProductiveLoading] = useState(true);
  const [peakProductiveData, setPeckProductiveData] = useState<any>([]);
  const [peakPoductive, setPeakPoductive] = useState<number>(0);
  const [billableLoading, setBillableLoading] = useState(true);
  const [billableProductiveData, setBillableProductiveData] = useState<any>([]);
  const [billableNonBillable, setBillableNonBillable] = useState<{
    department: number;
    type: string;
  }>({ department: 0, type: "" });
  const [loggedWorkingLoading, setLoggedWorkingLoading] = useState(true);
  const [totalLoggedWorkingTimeData, setTotalLoggedWorkingTimeData] =
    useState<any>([]);
  const [loggedWorking, setLoggedWorking] = useState<{
    department: number;
    type: number;
  }>({ department: 0, type: 0 });
  const [slaLoading, setSlaLoading] = useState(true);
  const [slaTATAchivementData, setSLATATAchivementData] = useState<any>([]);
  const [slaTATAchivement, setSLATATAchivement] = useState<{
    department: number;
    type: number;
  }>({ department: 0, type: 0 });

  const getCommonData = async (
    type: number,
    setState: (data: any) => void,
    setLoading: (data: any) => void
  ) => {
    setLoading(true);
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
      GraphType: type,
    };
    const url = `${process.env.report_api_url}/dashboard/commongraphcount`;
    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        setState(ResponseData.data);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    if (activeTab === 1 && dashboardActiveTab === 3) {
      setLoading(true);
      setTaskSubmittedAssignedData([]);
      setReworkData([]);
      setAutoManualTimeData([]);
      setPeckProductiveData([]);
      setBillableProductiveData([]);
      setTotalLoggedWorkingTimeData([]);
      setSLATATAchivementData([]);

      const timer = setTimeout(() => {
        const fetchData = async () => {
          try {
            await Promise.all([
              getCommonData(1, setTaskSubmittedAssignedData, setTaskLoading),
              getCommonData(2, setReworkData, setReworkLoading),
              getCommonData(3, setAutoManualTimeData, setAutoManualLoading),
              getCommonData(4, setPeckProductiveData, setPeakProductiveLoading),
              getCommonData(5, setBillableProductiveData, setBillableLoading),
              getCommonData(
                6,
                setTotalLoggedWorkingTimeData,
                setLoggedWorkingLoading
              ),
              getCommonData(7, setSLATATAchivementData, setSlaLoading),
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

  const charts = [
    {
      Component: Chart_TasksSubmittedVsAssigned,
      loading: taskLoading,
      data: taskSubmittedAssignedData,
      sendData: (department: number, type: string) => {
        setIsDialogOpen("tasksSubmittedAssigned");
        setTaskSubmittedAssigned({ department, type });
      },
    },
    {
      Component: Chart_ReworkTrend,
      loading: reworkLoading,
      data: reworkData,
      sendData: (department: number) => {
        setIsDialogOpen("reworkTrend");
        setReworkTrend(department);
      },
    },
    {
      Component: Chart_ManualVsAuto,
      loading: autoManualLoading,
      data: autoManualTimeData,
      sendData: (department: number, type: number) => {
        setIsDialogOpen("autoManual");
        setAutoManual({ department, type });
      },
    },
    {
      Component: Chart_PeakProductivityHours,
      loading: peakProductiveLoading,
      data: peakProductiveData,
      sendData: (time: number) => {
        setIsDialogOpen("peakProductive");
        setPeakPoductive(time);
      },
    },
    {
      Component: Chart_BillableNonBillable,
      loading: billableLoading,
      data: billableProductiveData,
      sendData: (department: number, type: string) => {
        setIsDialogOpen("billableNonBillable");
        setBillableNonBillable({ department, type });
      },
    },
    {
      Component: Chart_LoggedVsWorking,
      loading: loggedWorkingLoading,
      data: totalLoggedWorkingTimeData,
      sendData: (department: number, type: number) => {
        setIsDialogOpen("loggedWorking");
        setLoggedWorking({ department, type });
      },
    },
    {
      Component: Chart_SLATATAchivement,
      loading: slaLoading,
      data: slaTATAchivementData,
      sendData: (department: number, type: number) => {
        setIsDialogOpen("slaTATAchivement");
        setSLATATAchivement({ department, type });
      },
    },
  ];

  return (
    <>
      {/* {loading ? (
        <ReportLoader />
      ) : ( */}
        <div className="py-[10px]">
          {charts.map(({ Component, data, sendData }, index) => (
            <section
              className="flex gap-[20px] items-center px-[20px] py-[10px]"
              key={index}
            >
              <Card className="w-full h-full border border-lightSilver rounded-lg px-[10px]">
                <Component
                  loading={loading}
                  data={data}
                  sendData={sendData as any}
                />
              </Card>
            </section>
          ))}
        </div>
      {/* )} */}

      <Dialog_TasksSubmittedAssigned
        onOpen={isDialogOpen === "tasksSubmittedAssigned"}
        onClose={() => setIsDialogOpen("")}
        currentFilterData={currentFilterData}
        onSelectedData={taskSubmittedAssigned}
      />

      <Dialog_ReworkTrend
        onOpen={isDialogOpen === "reworkTrend"}
        onClose={() => setIsDialogOpen("")}
        currentFilterData={currentFilterData}
        onSelectedData={reworkTrend}
      />

      <Dialog_AutoManual
        onOpen={isDialogOpen === "autoManual"}
        onClose={() => setIsDialogOpen("")}
        currentFilterData={currentFilterData}
        onSelectedData={autoManual}
      />

      <Dialog_PeakPoductive
        onOpen={isDialogOpen === "peakProductive"}
        onClose={() => setIsDialogOpen("")}
        currentFilterData={currentFilterData}
        onSelectedData={peakPoductive}
      />

      <Dialog_BillableNonBillable
        onOpen={isDialogOpen === "billableNonBillable"}
        onClose={() => setIsDialogOpen("")}
        currentFilterData={currentFilterData}
        onSelectedData={billableNonBillable}
      />

      <Dialog_LoggedWorking
        onOpen={isDialogOpen === "loggedWorking"}
        onClose={() => setIsDialogOpen("")}
        currentFilterData={currentFilterData}
        onSelectedData={loggedWorking}
      />

      <Dialog_SLATATAchivement
        onOpen={isDialogOpen === "slaTATAchivement"}
        onClose={() => setIsDialogOpen("")}
        currentFilterData={currentFilterData}
        onSelectedData={slaTATAchivement}
      />
    </>
  );
};

export default NewDashboard;
