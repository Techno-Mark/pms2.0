import React, { useEffect, useState } from "react";
import MUIDataTable from "mui-datatables";
import { ThemeProvider } from "@mui/material/styles";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { dashboard_Options } from "@/utils/datatable/TableOptions";
import { adminDashboardEmailTypeCols } from "@/utils/datatable/columns/AdminDatatableColumns";
import { callAPI } from "@/utils/API/callAPI";
import {
  DashboardInitialFilter,
  ListDashboard,
  ResponseDashboardErrorlog,
} from "@/utils/Types/dashboardTypes";

interface ErrorlogProps {
  currentFilterData: DashboardInitialFilter;
  onSelectedSLA: number;
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

const Datatable_SLA = ({ currentFilterData, onSelectedSLA }: ErrorlogProps) => {
  const [data, setData] = useState<List[] | []>([]);

  const getErrorlogStatusData = async () => {
    const params = {
      ClientId:
        !!currentFilterData.Clients && currentFilterData.Clients.length > 0
          ? currentFilterData.Clients
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
      Type: onSelectedSLA,
    };
    const url = `${process.env.emailbox_api_url}/dashboard/GetSLATypeDetailsForDashboard`;
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
      if (onSelectedSLA >= 0) {
        await getErrorlogStatusData();
      }
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [currentFilterData, onSelectedSLA]);

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

export default Datatable_SLA;
