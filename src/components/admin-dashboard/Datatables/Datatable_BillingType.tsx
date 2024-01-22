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

interface BillingTypeProps {
  onSelectedWorkType: number;
  onSelectedStatusName: string;
  onCurrentSelectedBillingType: any;
  onSearchValue: string;
}

const Datatable_BillingType: React.FC<BillingTypeProps> = ({
  onSelectedWorkType,
  onSelectedStatusName,
  onCurrentSelectedBillingType,
  onSearchValue,
}) => {
  const [data, setData] = useState<any | any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableDataCount, setTableDataCount] = useState(0);

  const getBillingTypeData = async (value: any) => {
    const params = {
      PageNo: page + 1,
      PageSize: rowsPerPage,
      SortColumn: null,
      IsDesc: true,
      WorkTypeId: onSelectedWorkType === 0 ? null : onSelectedWorkType,
      GlobalSearch: value,
      BillingTypeId:
        onCurrentSelectedBillingType === 0
          ? null
          : onCurrentSelectedBillingType,
    };
    const url = `${process.env.report_api_url}/dashboard/billingstatuslist`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        setData(ResponseData.List);
        setTableDataCount(ResponseData.TotalCount);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    setPage(0);
  }, [onCurrentSelectedBillingType]);

  useEffect(() => {
    if (onSearchValue.length >= 3) {
      getBillingTypeData(onSearchValue);
    } else {
      getBillingTypeData("");
    }
  }, [
    onSelectedWorkType,
    onSelectedStatusName,
    onCurrentSelectedBillingType,
    onSearchValue,
    page,
    rowsPerPage,
  ]);

  return (
    <div>
      <ThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          data={data}
          columns={adminDashboardBillingTypeCols}
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

export default Datatable_BillingType;
