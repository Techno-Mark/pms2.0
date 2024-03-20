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
import { ListClientDashboard } from "@/utils/Types/dashboardTypes";

interface SummaryListProps {
  onSelectedProjectIds: number[];
  onSelectedWorkType: number;
  onSelectedSummaryStatus: string;
  onCurrSelectedSummaryStatus: string;
}

const Datatable_SummaryList: React.FC<SummaryListProps> = ({
  onSelectedProjectIds,
  onSelectedWorkType,
  onSelectedSummaryStatus,
  onCurrSelectedSummaryStatus,
}) => {
  const [data, setData] = useState<ListClientDashboard[] | []>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableDataCount, setTableDataCount] = useState(0);

  const getSummaryData = () => {
    const params = {
      PageNo: page + 1,
      PageSize: rowsPerPage,
      SortColumn: null,
      IsDesc: true,
      TypeOfWork: onSelectedWorkType === 0 ? null : onSelectedWorkType,
      ProjectIds: onSelectedProjectIds ? onSelectedProjectIds : [],
      Key: onCurrSelectedSummaryStatus
        ? onCurrSelectedSummaryStatus
        : onSelectedSummaryStatus,
    };
    const url = `${process.env.report_api_url}/clientdashboard/summarylist`;
    const successCallback = (
      ResponseData: { List: ListClientDashboard[] | []; TotalCount: number },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setData(ResponseData.List);
        setTableDataCount(ResponseData.TotalCount);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const fetchData = async () => {
      if (onSelectedSummaryStatus !== "") {
        getSummaryData();
      }
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [
    onSelectedWorkType,
    onSelectedSummaryStatus,
    onSelectedProjectIds,
    onCurrSelectedSummaryStatus,
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

export default Datatable_SummaryList;
