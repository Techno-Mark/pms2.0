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
import OverLay from "@/components/common/OverLay";

interface ProjectStatusProps {
  currentFilterData: DashboardInitialFilter;
  onSelectedProjectStatus: number;
  onCurrSelectedProjectStatus: number;
  onOpen: boolean;
  isClose: boolean;
  onHandleExport: (canExport: boolean) => void;
}

const Datatable_ProjectStatus = ({
  currentFilterData,
  onSelectedProjectStatus,
  onCurrSelectedProjectStatus,
  onOpen,
  isClose,
  onHandleExport,
}: ProjectStatusProps) => {
  const [data, setData] = useState<ListDashboard[] | []>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableDataCount, setTableDataCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (isClose || onOpen) && setPage(0);
    (isClose || onOpen) && setRowsPerPage(10);
    isClose && setLoading(true);
  }, [onOpen, isClose]);

  const getProjectStatusData = async () => {
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
      {loading && <OverLay />}
      <ThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          data={data}
          columns={adminDashboardProjectStatusCols}
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

export default Datatable_ProjectStatus;
