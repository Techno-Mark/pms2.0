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
import { ReportProps } from "@/utils/Types/reports";

interface FilteredData {
  GlobalSearch: string;
  PageNo: number;
  PageSize: number;
  SortColumn: string | null;
  IsDesc: number | boolean;
  ClientFilter: number[] | [];
  ProjectFilter: number[] | [];
  ProcessFilter: number[] | [];
  UpdatedByFilter: number[] | [];
  StartDate: string | null;
  EndDate: string | null;
}

interface Response {
  AuditlogReportFilters: any | null;
  List:
    | {
        WorkItemId: number;
        WorkItemTaskName: string;
        UpdatedOn: string;
        UpdatedById: number;
        UpdatedBy: string;
        Filed: string;
        NewValue: string | null;
        OldValue: string | null;
      }[]
    | [];
  TotalCount: number;
}

const LogReport = ({
  filteredData,
  searchValue,
  onHandleExport,
}: ReportProps) => {
  const [logReportFields, setLogReportFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [logReportCurrentPage, setLogReportCurrentPage] = useState<number>(0);
  const [logReportRowsPerPage, setLogReportRowsPerPage] = useState<number>(10);

  const getData = async (arg1: FilteredData) => {
    setLogReportFields({
      ...logReportFields,
      loaded: false,
    });
    const url = `${process.env.report_api_url}/report/auditlog`;

    const successCallback = (
      ResponseData: Response,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        onHandleExport(ResponseData.List.length > 0);
        setLogReportFields({
          ...logReportFields,
          loaded: true,
          data: ResponseData.List,
          dataCount: ResponseData.TotalCount,
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
        GlobalSearch: searchValue,
        PageNo: newPage + 1,
        PageSize: logReportRowsPerPage,
      });
    } else {
      getData({
        ...logReport_InitialFilter,
        GlobalSearch: searchValue,
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
        GlobalSearch: searchValue,
        PageNo: 1,
        PageSize: Number(event.target.value),
      });
    } else {
      getData({
        ...logReport_InitialFilter,
        GlobalSearch: searchValue,
        PageNo: 1,
        PageSize: Number(event.target.value),
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
