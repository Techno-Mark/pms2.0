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
import { adminDashboardTasksSubmittedAssignedCols } from "@/utils/datatable/columns/AdminDatatableColumns";
import { callAPI } from "@/utils/API/callAPI";
import {
  DashboardInitialFilter,
  ListDashboard,
} from "@/utils/Types/dashboardTypes";
import OverLay from "@/components/common/OverLay";

interface Props {
  currentFilterData: DashboardInitialFilter;
  status: number;
  onSelectedData: { department: number; type: string };
  onSearchValue: string;
  isClose: boolean;
  onOpen: boolean;
  onHandleExport: (canExport: boolean) => void;
}

const Datatable_TasksSubmittedAssigned = ({
  currentFilterData,
  status,
  onSelectedData,
  onSearchValue,
  isClose,
  onOpen,
  onHandleExport,
}: Props) => {
  const [data, setData] = useState<ListDashboard[] | []>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableDataCount, setTableDataCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isClose && setPage(0);
    isClose && setRowsPerPage(10);
    isClose && setLoading(true);
  }, [isClose]);

  const getTaskStatusData = async (value: string) => {
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
      DepartmentIds: [onSelectedData.department],
      AssigneeIds: currentFilterData.AssigneeIds,
      ReviewerIds: currentFilterData.ReviewerIds,
      StartDate: currentFilterData.StartDate,
      EndDate: currentFilterData.EndDate,
      GlobalSearch: value,
      Key: status,
      IsDownload: false,
    };
    const url = `${process.env.report_api_url}/dashboard/taskassignedvssubmitlist`;
    const successCallback = (
      ResponseData: {
        TotalCount: number;
        TaskSubmittedVsAssignedListFilters: null;
        TaskSubmittedVsAssignedList: ListDashboard[] | [];
      },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        setData(ResponseData.TaskSubmittedVsAssignedList);
        setTableDataCount(ResponseData.TotalCount);
        onHandleExport(
          ResponseData.TaskSubmittedVsAssignedList.length > 0 ? true : false
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
  }, [onSelectedData, status]);

  useEffect(() => {
    const fetchData = async () => {
      if (onSearchValue.trim().length > 0) {
        setPage(0);
        setRowsPerPage(10);
        await getTaskStatusData(onSearchValue);
      } else {
        await getTaskStatusData("");
      }
    };
    const timer = setTimeout(() => {
      status !== null && onOpen && fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [
    onSearchValue,
    status,
    currentFilterData,
    page,
    rowsPerPage,
    onOpen,
  ]);

  return (
    <div>
      {loading && <OverLay />}
      <ThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          data={data}
          columns={adminDashboardTasksSubmittedAssignedCols}
          title={undefined}
          options={{ ...dashboard_Options, tableBodyHeight: "55vh" }}
          data-tableid="tasksSubmittedAssignedInfo_Datatable"
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

export default Datatable_TasksSubmittedAssigned;
