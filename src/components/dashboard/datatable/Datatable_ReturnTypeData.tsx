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
import { dashboardPriorityReturnTaskInfoCols } from "@/utils/datatable/columns/ClientDatatableColumns";
import { callAPI } from "@/utils/API/callAPI";
import { ListClientDashboard } from "@/utils/Types/dashboardTypes";

interface ReturnTypeDataProps {
  onSelectedProjectIds: number[];
  onSelectedReturnTypeValue: number;
  onCurrSelectedReturnType: string | number;
  onSelectedWorkType: number;
  onSelectedDepartment: number;
  onOpen: boolean;
}

const Datatable_ReturnTypeData = ({
  onSelectedProjectIds,
  onSelectedReturnTypeValue,
  onCurrSelectedReturnType,
  onSelectedWorkType,
  onSelectedDepartment,
  onOpen,
}: ReturnTypeDataProps) => {
  const [data, setData] = useState<ListClientDashboard[] | []>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableDataCount, setTableDataCount] = useState(0);

  useEffect(() => {
    onOpen && setPage(0);
    onOpen && setRowsPerPage(10);
  }, [onOpen]);

  useEffect(() => {
    const getData = async () => {
      const params = {
        PageNo: page + 1,
        PageSize: rowsPerPage,
        SortColumn: null,
        IsDesc: true,
        projectIds: onSelectedProjectIds,
        typeOfWork: onSelectedWorkType === 0 ? null : onSelectedWorkType,
        DepartmentId: onSelectedDepartment === 0 ? null : onSelectedDepartment,
        priorityId: null,
        statusId: null,
        ReturnTypeId: onCurrSelectedReturnType
          ? onCurrSelectedReturnType
          : onSelectedReturnTypeValue,
      };
      const url = `${process.env.report_api_url}/clientdashboard/taskstatusandprioritylist`;
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

    const fetchData = async () => {
      getData();
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [
    onSelectedProjectIds,
    onSelectedReturnTypeValue,
    onCurrSelectedReturnType,
    onSelectedWorkType,
    onSelectedDepartment,
    page,
    rowsPerPage,
  ]);

  return (
    <div>
      <ThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          data={data}
          columns={dashboardPriorityReturnTaskInfoCols}
          title={undefined}
          options={{ ...dashboard_Options, tableBodyHeight: "55vh" }}
          data-tableid="priorityInfo_Datatable"
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

export default Datatable_ReturnTypeData;
