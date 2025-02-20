import React, { useEffect, useState } from "react";
import MUIDataTable from "mui-datatables";
import { ThemeProvider } from "@mui/material/styles";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { dashboard_Options } from "@/utils/datatable/TableOptions";
import { adminDashboardEmailTypeCols } from "@/utils/datatable/columns/AdminDatatableColumns";
import { callAPI } from "@/utils/API/callAPI";
import { DashboardInitialFilter } from "@/utils/Types/dashboardTypes";

interface ErrorlogProps {
  currentFilterData: DashboardInitialFilter;
  onSelectedPriority: number | null;
}

interface List {
  TicketId: number;
  MessageId: string;
  Subject: string;
  ClientName: string | null;
  Type: string | null;
  StandardSLATime: number;
  ActualTimeTaken: number;
  Status: number;
  StatusName: string;
  Priority: number | null;
  PriorityName: string;
  Tag: string[] | null;
  ReceivedOn: string;
  OpenDate: string | null;
  DueOn: string | null;
  AssignTo: string | null;
  ReportingManager: string | null;
  Department: string | null;
}

const Datatable_Priority = ({
  currentFilterData,
  onSelectedPriority,
}: ErrorlogProps) => {
  const [data, setData] = useState<List[] | []>([]);

  const getErrorlogPriorityData = async () => {
    const params = {
      ClientId:
        !!currentFilterData.Clients && currentFilterData.Clients.length > 0
          ? currentFilterData.Clients
          : null,
      DepartmentId:
        !!currentFilterData.DepartmentIds &&
        currentFilterData.DepartmentIds.length > 0
          ? currentFilterData.DepartmentIds
          : null,
      AssignTo:
        !!currentFilterData.AssigneeIds &&
        currentFilterData.AssigneeIds.length > 0
          ? currentFilterData.AssigneeIds
          : null,
      ReportingManagerId:
        !!currentFilterData.ReviewerIds &&
        currentFilterData.ReviewerIds.length > 0
          ? currentFilterData.ReviewerIds
          : null,
      StartDate: currentFilterData.StartDate,
      EndDate: currentFilterData.EndDate,
      IsDownload: false,
      Type: onSelectedPriority,
    };
    const url = `${process.env.emailbox_api_url}/dashboard/GetPriorityDetailsForDashboard`;
    const successCallback = (
      ResponseData: List[],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        setData(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const fetchData = async () => {
      if (onSelectedPriority !== null) {
        await getErrorlogPriorityData();
      }
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [currentFilterData, onSelectedPriority]);

  return (
    <div>
      <ThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          data={data}
          columns={adminDashboardEmailTypeCols}
          title={undefined}
          options={{ ...dashboard_Options, tableBodyHeight: "55vh" }}
          data-tableid="ProjectStatusList_Datatable"
        />
      </ThemeProvider>
    </div>
  );
};

export default Datatable_Priority;
