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
import { dashboardOverallProjectSumCols } from "@/utils/datatable/columns/ClientDatatableColumns";
import { callAPI } from "@/utils/API/callAPI";

interface OverallProjectSummaryProps {
  onSelectedWorkType: number;
  onSelectedTaskStatus: string;
  onSelectedProjectIds: number[];
  onCurrselectedtaskStatus: string;
}

const Datatable_OverallProjectSummary: React.FC<OverallProjectSummaryProps> = ({
  onSelectedWorkType,
  onSelectedTaskStatus,
  onSelectedProjectIds,
  onCurrselectedtaskStatus,
}) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableDataCount, setTableDataCount] = useState(0);

  const getOverallProjectSummaryData = () => {
    const params = {
      PageNo: page + 1,
      PageSize: rowsPerPage,
      SortColumn: null,
      IsDesc: true,
      TypeOfWork: onSelectedWorkType === 0 ? null : onSelectedWorkType,
      ProjectIds: onSelectedProjectIds ? onSelectedProjectIds : [],
      Key: onCurrselectedtaskStatus
        ? onCurrselectedtaskStatus
        : onSelectedTaskStatus,
    };
    const url = `${process.env.report_api_url}/clientdashboard/overallprojectcompletionlist`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setData(ResponseData.List);
        setTableDataCount(ResponseData.TotalCount);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    if (onCurrselectedtaskStatus !== "" || onSelectedTaskStatus !== "") {
      getOverallProjectSummaryData();
    }
  }, [
    onSelectedWorkType,
    onSelectedTaskStatus,
    onSelectedProjectIds,
    onCurrselectedtaskStatus,
    page,
    rowsPerPage,
  ]);

  return (
    <div>
      <ThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          data={data}
          columns={dashboardOverallProjectSumCols}
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

export default Datatable_OverallProjectSummary;
