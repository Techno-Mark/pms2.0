import React, { useEffect, useState } from "react";
import MUIDataTable from "mui-datatables";
import { ThemeProvider } from "@mui/material/styles";
import TablePagination from "@mui/material/TablePagination";
import {
  handleChangePage,
  handleChangeRowsPerPage,
} from "@/utils/datatable/CommonFunction";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { dashboardOnHoldAndOverdueCols } from "@/utils/datatable/columns/ClientDatatableColumns";
import { callAPI } from "@/utils/API/callAPI";
interface OverdueProps {
  onSelectedProjectIds: number[];
  onSelectedWorkType: number;
}

const Datatable_Overdue: React.FC<OverdueProps> = ({
  onSelectedProjectIds,
  onSelectedWorkType,
}) => {
  const [data, setData] = useState<any | any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableDataCount, setTableDataCount] = useState(0);

  const [options, setOptions] = useState<any>({
    filterType: "checkbox",
    responsive: "standard",
    viewColumns: false,
    filter: false,
    print: false,
    download: false,
    search: false,
    pagination: false,
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
            <span>Currently there is no record</span>
          </div>
        ),
        toolTip: "",
      },
    },
  });

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      let tableBodyHeight = "86vh";

      if (screenWidth > 1440) {
        tableBodyHeight = "77vh";
      } else if (screenWidth > 1280) {
        tableBodyHeight = "86vh";
      }

      setOptions((prevOptions: any) => ({
        ...prevOptions,
        tableBodyHeight,
      }));
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getData = () => {
    const params = {
      PageNo: page + 1,
      PageSize: rowsPerPage,
      SortColumn: null,
      IsDesc: true,
      projectIds: onSelectedProjectIds,
      typeOfWork: onSelectedWorkType === 0 ? null : onSelectedWorkType,
      onHold: false,
    };
    const url = `${process.env.report_api_url}/clientdashboard/tasklistbyproject`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setData(ResponseData.List);
        setTableDataCount(ResponseData.TotalCount);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    getData();
  }, [onSelectedProjectIds, onSelectedWorkType, page, rowsPerPage]);

  return (
    <div>
      <ThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          data={data}
          columns={dashboardOnHoldAndOverdueCols}
          title={undefined}
          options={options}
          data-tableid="dashboard_Overdue_Datatable"
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

export default Datatable_Overdue;
