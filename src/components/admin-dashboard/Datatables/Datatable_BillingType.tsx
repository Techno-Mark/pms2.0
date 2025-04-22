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
import { adminDashboardBillingTypeCols } from "@/utils/datatable/columns/AdminDatatableColumns";
import { callAPI } from "@/utils/API/callAPI";
import { DashboardInitialFilter } from "@/utils/Types/dashboardTypes";
import OverLay from "@/components/common/OverLay";

interface BillingTypeProps {
  currentFilterData: DashboardInitialFilter;
  onCurrentSelectedBillingType: number | null;
  onSearchValue: string;
  isClose: boolean;
}

interface List {
  ClientId: number;
  ClientName: string;
  TypeOfWorkId: number;
  TypeOfWorkName: string;
  BillingTypeId: number;
  BillingTypeName: string;
  Status: boolean;
  ContractedHours: number;
  InternalHours: number;
}

interface Response {
  TotalCount: number;
  DashboardSummaryFilters: null;
  BillingStatusList: List[] | [];
}

const Datatable_BillingType = ({
  currentFilterData,
  onCurrentSelectedBillingType,
  onSearchValue,
  isClose,
}: BillingTypeProps) => {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableDataCount, setTableDataCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isClose && setPage(0);
    isClose && setRowsPerPage(10);
    isClose && setLoading(true);
  }, [isClose]);

  const getBillingTypeData = async (value: string) => {
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
      GlobalSearch: value,
      BillingTypeId:
        onCurrentSelectedBillingType === 0
          ? null
          : onCurrentSelectedBillingType,
    };
    const url = `${process.env.report_api_url}/dashboard/billingstatuslist`;
    const successCallback = (
      ResponseData: Response,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        setData(ResponseData.BillingStatusList);
        setTableDataCount(ResponseData.TotalCount);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    setPage(0);
  }, [onCurrentSelectedBillingType]);

  useEffect(() => {
    const fetchData = async () => {
      if (onSearchValue.trim().length > 0) {
        setPage(0);
        setRowsPerPage(10);
        await getBillingTypeData(onSearchValue);
      } else {
        await getBillingTypeData("");
      }
    };
    const timer = setTimeout(() => {
      onCurrentSelectedBillingType !== null && fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [
    currentFilterData,
    onCurrentSelectedBillingType,
    onSearchValue,
    page,
    rowsPerPage,
  ]);

  return (
    <div>
      {loading && <OverLay />}
      <ThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          data={data}
          columns={adminDashboardBillingTypeCols}
          title={undefined}
          options={{ ...dashboard_Options, tableBodyHeight: "55vh" }}
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

export default Datatable_BillingType;
