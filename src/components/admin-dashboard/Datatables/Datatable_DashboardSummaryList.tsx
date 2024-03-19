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
import {
  DashboardInitialFilter,
  ListDashboard,
  ResponseDashboardProjectSummary,
} from "@/utils/Types/dashboardTypes";

interface DashboardSummaryListProps {
  currentFilterData: DashboardInitialFilter;
  onClickedSummaryTitle: number;
  onCurrSelectedSummaryTitle: number;
}

const Datatable_DashboardSummaryList: React.FC<DashboardSummaryListProps> = ({
  currentFilterData,
  onClickedSummaryTitle,
  onCurrSelectedSummaryTitle,
}) => {
  const [dashboardSummaryData, setDashboardSummaryData] = useState<
    ListDashboard[] | []
  >([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableDataCount, setTableDataCount] = useState(0);

  const getProjectSummaryData = async () => {
    const params = {
      PageNo: page + 1,
      PageSize: rowsPerPage,
      SortColumn: null,
      IsDesc: true,
      Clients: currentFilterData.Clients,
      WorkTypeId:
        currentFilterData.TypeOfWork === null
          ? 0
          : currentFilterData.TypeOfWork,
      StartDate: currentFilterData.StartDate,
      EndDate: currentFilterData.EndDate,
      Key:
        onCurrSelectedSummaryTitle > 0
          ? onCurrSelectedSummaryTitle
          : onClickedSummaryTitle,
    };
    const url = `${process.env.report_api_url}/dashboard/dashboardsummarylist`;
    const successCallback = (
      ResponseData: ResponseDashboardProjectSummary,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        setDashboardSummaryData(ResponseData.ProjectStatusList);
        setTableDataCount(ResponseData.TotalCount);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    setPage(0);
  }, [onCurrSelectedSummaryTitle]);

  useEffect(() => {
    const fetchData = async () => {
      if (onCurrSelectedSummaryTitle > 0 || onClickedSummaryTitle > 0) {
        await getProjectSummaryData();
      }
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [
    currentFilterData,
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
