import React, { useEffect, useState } from "react";
import MUIDataTable from "mui-datatables";
import { ThemeProvider } from "@mui/material/styles";
import TablePagination from "@mui/material/TablePagination";
import {
  handleChangePage,
  handleChangeRowsPerPage,
} from "@/utils/datatable/CommonFunction";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { dashboardOnHoldCols } from "@/utils/datatable/columns/ClientDatatableColumns";
import { callAPI } from "@/utils/API/callAPI";

interface OnHoldProps {
  onSelectedProjectIds: number[];
  onSelectedWorkType: number;
  onSelectedDepartment: number;
}

interface List {
  WorkitemId: number | null;
  ProjectId: number | null;
  ProjectName: string | null;
  TaskName: string | null;
  CloseMonth: string | number | null;
  StartDate: string | null;
  DueDate: string | null;
  DueFrom: number | null;
}

const Datatable_OnHold = ({
  onSelectedProjectIds,
  onSelectedWorkType,
  onSelectedDepartment,
}: OnHoldProps) => {
  const [data, setData] = useState<List[] | []>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableDataCount, setTableDataCount] = useState(0);

  const options: any = {
    filterType: "checkbox",
    responsive: "standard",
    viewColumns: false,
    pagination: false,
    filter: false,
    print: false,
    download: false,
    search: false,
    selectToolbarPlacement: "none",
    draggableColumns: {
      enabled: true,
      transitionTime: 300,
    },
    selectableRows: "none",
    elevation: 0,
    textLabels: {
      body: {
        noMatch: (
          <div className="flex items-start">
            <span>Currently there is no record.</span>
          </div>
        ),
        toolTip: "",
      },
    },
  };

  const getData = async () => {
    const params = {
      PageNo: page + 1,
      PageSize: rowsPerPage,
      SortColumn: null,
      IsDesc: true,
      projectIds: onSelectedProjectIds,
      typeOfWork: onSelectedWorkType === 0 ? null : onSelectedWorkType,
      DepartmentId: onSelectedDepartment === 0 ? null : onSelectedDepartment,
      onHold: true,
    };
    const url = `${process.env.report_api_url}/clientdashboard/tasklistbyproject`;
    const successCallback = (
      ResponseData: { List: List[] | []; TotalCount: number },
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

  useEffect(() => {
    const fetchData = async () => {
      getData();
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [
    onSelectedProjectIds,
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
          columns={dashboardOnHoldCols}
          title={undefined}
          options={{ ...options, tableBodyHeight: "78vh" }}
          data-tableid="dashboard_OnHold_Datatable"
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

export default Datatable_OnHold;
