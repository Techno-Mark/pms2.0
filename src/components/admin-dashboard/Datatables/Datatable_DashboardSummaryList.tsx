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
import { adminDashboardSummaryCols } from "@/utils/datatable/columns/AdminDatatableColumns";
import { callAPI } from "@/utils/API/callAPI";

interface DashboardSummaryListProps {
  onSelectedWorkType: number;
  onClickedSummaryTitle: string;
  onCurrSelectedSummaryTitle: string;
}

const Datatable_DashboardSummaryList: React.FC<DashboardSummaryListProps> = ({
  onSelectedWorkType,
  onClickedSummaryTitle,
  onCurrSelectedSummaryTitle,
}) => {
  const [dashboardSummaryData, setDashboardSummaryData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableDataCount, setTableDataCount] = useState(0);

  const getProjectSummaryData = async () => {
    const params = {
      PageNo: page + 1,
      PageSize: rowsPerPage,
      SortColumn: null,
      IsDesc: true,
      WorkTypeId: onSelectedWorkType === 0 ? null : onSelectedWorkType,
      Key: onCurrSelectedSummaryTitle
        ? onCurrSelectedSummaryTitle
        : onClickedSummaryTitle,
    };
    const url = `${process.env.report_api_url}/dashboard/dashboardsummarylist`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        setDashboardSummaryData(ResponseData.List);
        setTableDataCount(ResponseData.TotalCount);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    setPage(0);
  }, [onCurrSelectedSummaryTitle]);

  useEffect(() => {
    if (onCurrSelectedSummaryTitle !== "" || onClickedSummaryTitle !== "") {
      getProjectSummaryData();
    }
  }, [
    onSelectedWorkType,
    onClickedSummaryTitle,
    onCurrSelectedSummaryTitle,
    page,
    rowsPerPage,
  ]);

  return (
    <div>
      <ThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          data={dashboardSummaryData}
          columns={adminDashboardSummaryCols}
          title={undefined}
          options={dashboard_Options}
          data-tableid="Datatable_DashboardSummaryList"
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

export default Datatable_DashboardSummaryList;
