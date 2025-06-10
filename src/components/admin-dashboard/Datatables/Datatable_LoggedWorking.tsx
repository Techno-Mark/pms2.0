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
import {
  adminDashboardLoggedCols,
  adminDashboardWorkingCols,
} from "@/utils/datatable/columns/AdminDatatableColumns";
import { callAPI } from "@/utils/API/callAPI";
import { DashboardInitialFilter } from "@/utils/Types/dashboardTypes";
import OverLay from "@/components/common/OverLay";

interface Props {
  currentFilterData: DashboardInitialFilter;
  onSelectedData: { department: number; type: number };
  status: number | null;
  onSearchValue: string;
  isClose: boolean;
  onOpen: boolean;
  onHandleExport: (canExport: boolean) => void;
}

const Datatable_LoggedWorking = ({
  currentFilterData,
  onSelectedData,
  status,
  onSearchValue,
  isClose,
  onOpen,
  onHandleExport,
}: Props) => {
  const [fullData, setFullData] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isClose) {
      setPage(0);
      setRowsPerPage(10);
      setLoading(true);
    }
  }, [isClose]);

  const getTaskStatusData = async (value: string) => {
    setLoading(true);
    const workTypeIdFromLocalStorage =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("workTypeId")
        : 3;

    const params = {
      PageNo: 1,
      PageSize: 50000,
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
      IsDownload: false,
      Key: status,
    };

    const url = `${process.env.report_api_url}/dashboard/totalLoggedVSWorkingList`;

    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && !error) {
        const fetchedData =
          status === 1
            ? ResponseData.TotalLoggedList
            : ResponseData.UserWorkItemWithTasks;

        setFullData(fetchedData);
        setLoading(false);

        onHandleExport(fetchedData.length > 0);
      } else {
        setLoading(false);
        setFullData([]);
        onHandleExport(false);
      }
    };

    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    setFullData([]);
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
      onOpen && fetchData();
    }, 500);

    return () => clearTimeout(timer);
  }, [onSearchValue, currentFilterData, onSelectedData, status, onOpen]);

  const paginatedData = fullData.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  return (
    <div>
      {loading && <OverLay />}
      <ThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          data={paginatedData}
          columns={
            status === 1 ? adminDashboardLoggedCols : adminDashboardWorkingCols
          }
          title={undefined}
          options={{
            ...dashboard_Options,
            tableBodyHeight: "55vh",
            search: false,
            filter: false,
            pagination: false,
          }}
          data-tableid="tasksSubmittedAssignedInfo_Datatable"
        />
        <TablePagination
          component="div"
          count={fullData.length}
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

export default Datatable_LoggedWorking;
