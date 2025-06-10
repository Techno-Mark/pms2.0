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
import { adminDashboardBillableNonBillableCols } from "@/utils/datatable/columns/AdminDatatableColumns";
import { callAPI } from "@/utils/API/callAPI";
import {
  DashboardInitialFilter,
  ListDashboard,
} from "@/utils/Types/dashboardTypes";
import OverLay from "@/components/common/OverLay";

interface Props {
  currentFilterData: DashboardInitialFilter;
  onSelectedData: { department: number; type: string };
  billableNonBillable: number | null;
  productiveNonProductive: number | null;
  onSearchValue: string;
  isClose: boolean;
  onOpen: boolean;
  onHandleExport: (canExport: boolean) => void;
}

const Datatable_BillableNonBillable = ({
  currentFilterData,
  onSelectedData,
  billableNonBillable,
  productiveNonProductive,
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
      IsDownload: false,
      IsBillable:
        billableNonBillable === 2
          ? false
          : billableNonBillable === 1
          ? true
          : null,
      IsProductive:
        productiveNonProductive === 2
          ? false
          : productiveNonProductive === 1
          ? true
          : null,
    };
    const url = `${process.env.report_api_url}/dashboard/billableproductivelist`;
    const successCallback = (
      ResponseData: {
        TotalCount: number;
        BillableProductiveListFilters: null;
        BillableProductiveList: ListDashboard[] | [];
      },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        setData(ResponseData.BillableProductiveList);
        setTableDataCount(ResponseData.TotalCount);
        onHandleExport(
          ResponseData.BillableProductiveList.length > 0 ? true : false
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
  }, [onSelectedData, billableNonBillable, productiveNonProductive]);

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
  }, [
    onSearchValue,
    currentFilterData,
    onSelectedData,
    billableNonBillable,
    productiveNonProductive,
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
          columns={adminDashboardBillableNonBillableCols}
          title={undefined}
          options={{
            ...dashboard_Options,
            tableBodyHeight: "55vh",
          }}
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

export default Datatable_BillableNonBillable;
