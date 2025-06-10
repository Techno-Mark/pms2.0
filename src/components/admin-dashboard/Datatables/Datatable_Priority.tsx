import React, { useEffect, useState } from "react";
import MUIDataTable from "mui-datatables";
import { ThemeProvider } from "@mui/material/styles";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { dashboard_Options } from "@/utils/datatable/TableOptions";
import { adminDashboardEmailTypeCols } from "@/utils/datatable/columns/AdminDatatableColumns";
import { callAPI } from "@/utils/API/callAPI";
import { DashboardInitialFilter } from "@/utils/Types/dashboardTypes";
import { TablePagination } from "@mui/material";
import {
  handleChangePage,
  handleChangeRowsPerPage,
} from "@/utils/datatable/CommonFunction";
import OverLay from "@/components/common/OverLay";

interface ErrorlogProps {
  currentFilterData: DashboardInitialFilter;
  onSelectedPriority: number | null;
  isClose: boolean;
  onHandleExport: (canExport: boolean) => void;
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
  isClose,
  onHandleExport,
}: ErrorlogProps) => {
  const [data, setData] = useState<List[] | []>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableDataCount, setTableDataCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isClose && setPage(0);
    isClose && setRowsPerPage(10);
    isClose && setLoading(true);
  }, [isClose]);

  const getErrorlogPriorityData = async () => {
    setLoading(true);
    const params = {
      PageNo: page + 1,
      PageSize: rowsPerPage,
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
      ResponseData: { List: List[]; TotalCount: number },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        setData(ResponseData.List);
        setTableDataCount(ResponseData.TotalCount);
        onHandleExport(ResponseData.List.length > 0 ? true : false);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    setPage(0);
  }, [onSelectedPriority]);

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
  }, [currentFilterData, onSelectedPriority, page, rowsPerPage]);

  return (
    <div>
      {loading && <OverLay />}
      <ThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          data={data}
          columns={adminDashboardEmailTypeCols}
          title={undefined}
          options={{ ...dashboard_Options, tableBodyHeight: "55vh" }}
          data-tableid="ProjectStatusList_Datatable"
        />
        <TablePagination
          component="div"
          count={tableDataCount}
          page={page}
          onPageChange={(event: any, newPage) => {
            handleChangePage(event, newPage, setPage);
          }}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(
            event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          ) => {
            handleChangeRowsPerPage(event, setRowsPerPage, setPage);
          }}
        />
      </ThemeProvider>
    </div>
  );
};

export default Datatable_Priority;
