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
import { adminDashboardProjectStatusCols } from "@/utils/datatable/columns/AdminDatatableColumns";
import { callAPI } from "@/utils/API/callAPI";
import {
  DashboardInitialFilter,
  ListDashboard,
  ResponseDashboardProjectSummary,
} from "@/utils/Types/dashboardTypes";

interface ProjectStatusProps {
  currentFilterData: DashboardInitialFilter;
  onSelectedProjectStatus: number;
  onSelectedProjectIds: number[];
  onCurrSelectedProjectStatus: number;
}

const Datatable_ProjectStatus: React.FC<ProjectStatusProps> = ({
  currentFilterData,
  onSelectedProjectStatus,
  onCurrSelectedProjectStatus,
}) => {
  const [data, setData] = useState<ListDashboard[] | []>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableDataCount, setTableDataCount] = useState(0);

  const getProjectStatusData = async () => {
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
      ProjectId: null,
      Key: onCurrSelectedProjectStatus
        ? onCurrSelectedProjectStatus
        : onSelectedProjectStatus,
    };
    const url = `${process.env.report_api_url}/dashboard/projectstatuslist`;
    const successCallback = (
      ResponseData: ResponseDashboardProjectSummary,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        setData(ResponseData.ProjectStatusList);
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
      if (onCurrSelectedProjectStatus > 0 || onSelectedProjectStatus > 0) {
        await getProjectStatusData();
      }
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [
    currentFilterData,
    onSelectedProjectStatus,
    onCurrSelectedProjectStatus,
    page,
    rowsPerPage,
  ]);

  return (
    <div>
      <ThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          data={data}
          columns={adminDashboardProjectStatusCols}
          title={undefined}
          options={dashboard_Options}
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

export default Datatable_ProjectStatus;
