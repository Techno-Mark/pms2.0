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
import { adminDashboardTaskStatusCols } from "@/utils/datatable/columns/AdminDatatableColumns";
import { callAPI } from "@/utils/API/callAPI";

interface TaskStatusProps {
  onSelectedWorkType: number;
  onSelectedStatusName: string;
  onCurrSelectedStatus: any;
  onSearchValue: string;
}

const Datatable_TaskStatus: React.FC<TaskStatusProps> = ({
  onSelectedWorkType,
  onSelectedStatusName,
  onCurrSelectedStatus,
  onSearchValue,
}) => {
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableDataCount, setTableDataCount] = useState(0);

  const getTaskStatusData = async (value: any) => {
    const params = {
      PageNo: page + 1,
      PageSize: rowsPerPage,
      SortColumn: null,
      IsDesc: true,
      WorkTypeId: onSelectedWorkType === 0 ? null : onSelectedWorkType,
      GlobalSearch: value,
      StatusId: onCurrSelectedStatus === 0 ? null : onCurrSelectedStatus,
    };
    const url = `${process.env.report_api_url}/dashboard/taskstatuslist`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        setData(ResponseData.List);
        setTableDataCount(ResponseData.TotalCount);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    setPage(0);
  }, [onCurrSelectedStatus]);

  useEffect(() => {
    if (onSearchValue.length >= 3) {
      getTaskStatusData(onSearchValue);
    } else {
      getTaskStatusData("");
    }
  }, [
    onSearchValue,
    onCurrSelectedStatus,
    onSelectedWorkType,
    onSelectedStatusName,
    page,
    rowsPerPage,
  ]);

  return (
    <div>
      <ThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          data={data}
          columns={adminDashboardTaskStatusCols}
          title={undefined}
          options={dashboard_Options}
          data-tableid="taskStatusInfo_Datatable"
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

export default Datatable_TaskStatus;
