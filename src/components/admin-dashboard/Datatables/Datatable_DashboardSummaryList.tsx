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
import OverLay from "@/components/common/OverLay";

interface DashboardSummaryListProps {
  currentFilterData: DashboardInitialFilter;
  onClickedSummaryTitle: number;
  onCurrSelectedSummaryTitle: number;
  isClose: boolean;
  onHandleExport: (canExport: boolean) => void;
}

const Datatable_DashboardSummaryList = ({
  currentFilterData,
  onClickedSummaryTitle,
  onCurrSelectedSummaryTitle,
  isClose,
  onHandleExport,
}: DashboardSummaryListProps) => {
  const [dashboardSummaryData, setDashboardSummaryData] = useState<
    ListDashboard[] | []
  >([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableDataCount, setTableDataCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isClose && setPage(0);
    isClose && setRowsPerPage(10);
    isClose && setLoading(true);
  }, [isClose]);

  const getProjectSummaryData = async () => {
    setLoading(true);
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
        onHandleExport(
          ResponseData.ProjectStatusList.length > 0 ? true : false
        );
        setLoading(false);
      } else {
        setLoading(false);
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
      {loading && <OverLay />}
      <ThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          data={dashboardSummaryData}
          columns={adminDashboardSummaryCols}
          title={undefined}
          options={{ ...dashboard_Options, tableBodyHeight: "55vh" }}
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
