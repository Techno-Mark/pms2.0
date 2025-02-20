import React, { useEffect, useState } from "react";
import MUIDataTable from "mui-datatables";
import { ThemeProvider } from "@mui/material/styles";
import TablePagination from "@mui/material/TablePagination";
import {
  handleChangePage,
  handleChangeRowsPerPage,
} from "@/utils/datatable/CommonFunction";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { dashboard_Options } from "@/utils/datatable/TableOptions";
import { adminDashboardErrorlogCols } from "@/utils/datatable/columns/AdminDatatableColumns";
import { callAPI } from "@/utils/API/callAPI";
import {
  DashboardInitialFilter,
  ListDashboard,
  ResponseDashboardErrorlog,
} from "@/utils/Types/dashboardTypes";

interface ErrorlogProps {
  currentFilterData: DashboardInitialFilter;
  onSelectedErrorlog: number;
  onSelectedProjectIds: number[];
  onCurrSelectedProjectStatus: number;
  errorlogImportStatus: number;
  onOpen: boolean;
  isClose: boolean;
}

const Datatable_Errorlog = ({
  currentFilterData,
  onSelectedErrorlog,
  onCurrSelectedProjectStatus,
  errorlogImportStatus,
  onOpen,
  isClose,
}: ErrorlogProps) => {
  const [data, setData] = useState<ListDashboard[] | []>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableDataCount, setTableDataCount] = useState(0);

  useEffect(() => {
    (isClose || onOpen) && setPage(0);
    (isClose || onOpen) && setRowsPerPage(10);
  }, [onOpen, isClose]);

  const getErrorlogStatusData = async () => {
    const workTypeIdFromLocalStorage =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("workTypeId")
        : 3;
    const params = {
      PageNo: page + 1,
      PageSize: rowsPerPage,
      SortColumn: null,
      IsDesc: true,
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
      ProjectId: null,
      Key: onCurrSelectedProjectStatus
        ? onCurrSelectedProjectStatus
        : onSelectedErrorlog,
      IsImported:
        errorlogImportStatus > 0
          ? errorlogImportStatus == 2
            ? 0
            : errorlogImportStatus
          : null,
    };
    const url = `${process.env.report_api_url}/dashboard/errorloglist`;
    const successCallback = (
      ResponseData: ResponseDashboardErrorlog,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        setData(ResponseData.ErrorlogList);
        setTableDataCount(ResponseData.TotalCount);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    setPage(0);
  }, [onCurrSelectedProjectStatus]);

  useEffect(() => {
    const fetchData = async () => {
      if (!!onCurrSelectedProjectStatus || !!onSelectedErrorlog) {
        await getErrorlogStatusData();
      }
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [
    currentFilterData,
    onSelectedErrorlog,
    onCurrSelectedProjectStatus,
    errorlogImportStatus,
    page,
    rowsPerPage,
  ]);

  return (
    <div>
      <ThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          data={data}
          columns={adminDashboardErrorlogCols}
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

export default Datatable_Errorlog;
