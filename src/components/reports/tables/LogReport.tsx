import MUIDataTable from "mui-datatables";
import { useEffect, useState } from "react";
import { callAPI } from "@/utils/API/callAPI";
import { FieldsType } from "../types/FieldsType";
import { options } from "@/utils/datatable/TableOptions";
import ReportLoader from "@/components/common/ReportLoader";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { TablePagination, ThemeProvider } from "@mui/material";
import { logReport_InitialFilter } from "@/utils/reports/getFilters";
import { reportsLogCols } from "@/utils/datatable/columns/ReportsDatatableColumns";

const LogReport = ({ filteredData, searchValue, onHandleExport }: any) => {
  const [logReportFields, setLogReportFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [logReportCurrentPage, setLogReportCurrentPage] = useState<number>(0);
  const [logReportRowsPerPage, setLogReportRowsPerPage] = useState<number>(10);

  const getData = async (arg1: any) => {
    setLogReportFields({
      ...logReportFields,
      loaded: false,
    });
    const url = `${process.env.report_api_url}/report/auditlog`;

    const successCallback = (data: any, error: any) => {
      if (data !== null && error === false) {
        onHandleExport(data.List.length > 0);
        setLogReportFields({
          ...logReportFields,
          loaded: true,
          data: data.List,
          dataCount: data.TotalCount,
        });
      } else {
        setLogReportFields({ ...logReportFields, loaded: true });
      }
    };

    callAPI(url, arg1, successCallback, "post");
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setLogReportCurrentPage(newPage);
    if (filteredData !== null) {
      getData({
        ...filteredData,
        PageNo: newPage + 1,
        PageSize: logReportRowsPerPage,
      });
    } else {
      getData({
        ...logReport_InitialFilter,
        PageNo: newPage + 1,
        PageSize: logReportRowsPerPage,
      });
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setLogReportCurrentPage(0);
    setLogReportRowsPerPage(parseInt(event.target.value));

    if (filteredData !== null) {
      getData({
        ...filteredData,
        PageNo: 1,
        PageSize: event.target.value,
      });
    } else {
      getData({
        ...logReport_InitialFilter,
        PageNo: 1,
        PageSize: event.target.value,
      });
    }
  };

  useEffect(() => {
    if (filteredData !== null) {
      const timer = setTimeout(() => {
        getData({ ...filteredData, GlobalSearch: searchValue });
        setLogReportCurrentPage(0);
        setLogReportRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        getData({ ...logReport_InitialFilter, GlobalSearch: searchValue });
        setLogReportCurrentPage(0);
        setLogReportRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredData, searchValue]);

  const columns: any = [];

  return logReportFields.loaded ? (
    <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        columns={reportsLogCols}
        data={logReportFields.data}
        title={undefined}
        options={{ ...options, tableBodyHeight: "73vh" }}
      />
      <TablePagination
        component="div"
        count={logReportFields.dataCount}
        page={logReportCurrentPage}
        onPageChange={handleChangePage}
        rowsPerPage={logReportRowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </ThemeProvider>
  ) : (
    <ReportLoader />
  );
};

export default LogReport;
