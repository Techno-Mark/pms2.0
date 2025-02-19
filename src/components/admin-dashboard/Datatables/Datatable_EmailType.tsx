import React, { useEffect, useState } from "react";
import MUIDataTable from "mui-datatables";
import { ThemeProvider } from "@mui/material/styles";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { dashboard_Options } from "@/utils/datatable/TableOptions";
import { adminDashboardEmailTypeCols } from "@/utils/datatable/columns/AdminDatatableColumns";
import { callAPI } from "@/utils/API/callAPI";
import { DashboardInitialFilter } from "@/utils/Types/dashboardTypes";
import ReportLoader from "@/components/common/ReportLoader";

interface EmailTypeProps {
  currentFilterData: DashboardInitialFilter;
  onCurrentSelectedEmailType: number;
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

const Datatable_EmailType = ({
  currentFilterData,
  onCurrentSelectedEmailType,
}: EmailTypeProps) => {
  const [data, setData] = useState<any[]>([]);

  const getEmailTypeData = async () => {
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
      Type: onCurrentSelectedEmailType,
    };
    const url = `${process.env.emailbox_api_url}/dashboard/GetEmailTypeDetailsForDashboard`;
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
      onCurrentSelectedEmailType > -2 && (await getEmailTypeData());
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [currentFilterData, onCurrentSelectedEmailType]);

  return (
    <div>
      <ThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          data={data}
          columns={adminDashboardEmailTypeCols}
          title={undefined}
          options={{ ...dashboard_Options, tableBodyHeight: "55vh" }}
          data-tableid="taskStatusInfo_Datatable"
        />
      </ThemeProvider>
    </div>
  );
};

export default Datatable_EmailType;
