import React, { useEffect, useState } from "react";
import { FieldsType } from "../types/FieldsType";
import MUIDataTable from "mui-datatables";
import { options } from "@/utils/datatable/TableOptions";
import { ThemeProvider } from "@mui/styles";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { TablePagination } from "@mui/material";
import ReportLoader from "@/components/common/ReportLoader";
import { callAPI } from "@/utils/API/callAPI";
import { am_InitialFilter } from "@/utils/reports/getFilters";
import { reportsAMCols } from "@/utils/datatable/columns/ReportsDatatableColumns";
import { ReportProps } from "@/utils/Types/reports";

interface FilteredData {
  PageNo: number;
  PageSize: number;
  sortColumn: string;
  IsDesc: boolean;
  GlobalSearch: string;
  StartDate: string | null;
  EndDate: string | null;
  Users: number[] | [];
  ReportingManagerId: number | null;
  DepartmentIds: number[] | [];
  IsDownload: boolean;
}

interface Response {
  AutoManualReportFilters: any | null;
  List:
    | {
        UserId: number | null;
        UserName: string | null;
        DepartmentId: number | null;
        DepartmentName: string | null;
        RmId: number | null;
        ReportingTo: string | null;
        StdTime: string | null;
        ManualTime: string | null;
        AutoTime: string | null;
        TotalTime: string | null;
      }[]
    | [];
  TotalCount: number;
}

const AutoManualReport = ({
  filteredData,
  searchValue,
  onHandleExport,
}: ReportProps) => {
  const [autoManualFields, setAutoManualFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [autoManualCurrentPage, setAutoManualCurrentPage] = useState<number>(0);
  const [autoManualRowsPerPage, setAutoManualRowsPerPage] =
    useState<number>(10);

  const getData = async (arg1: FilteredData) => {
    setAutoManualFields({
      ...autoManualFields,
      loaded: false,
    });

    const url = `${process.env.report_api_url}/report/automanual`;

    const successCallback = (
      ResponseData: Response,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        onHandleExport(ResponseData.List.length > 0);
        setAutoManualFields({
          ...autoManualFields,
          loaded: true,
          data: ResponseData.List,
          dataCount: ResponseData.TotalCount,
        });
      } else {
        setAutoManualFields({ ...autoManualFields, loaded: true });
      }
    };

    callAPI(url, arg1, successCallback, "post");
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setAutoManualCurrentPage(newPage);
    if (filteredData !== null) {
      getData({
        ...filteredData,
        GlobalSearch: searchValue,
        PageNo: newPage + 1,
        PageSize: autoManualRowsPerPage,
      });
    } else {
      getData({
        ...am_InitialFilter,
        GlobalSearch: searchValue,
        PageNo: newPage + 1,
        PageSize: autoManualRowsPerPage,
      });
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAutoManualCurrentPage(0);
    setAutoManualRowsPerPage(parseInt(event.target.value));

    if (filteredData !== null) {
      getData({
        ...filteredData,
        GlobalSearch: searchValue,
        PageNo: 1,
        PageSize: Number(event.target.value),
      });
    } else {
      getData({
        ...am_InitialFilter,
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
        setAutoManualCurrentPage(0);
        setAutoManualRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        getData({ ...am_InitialFilter, GlobalSearch: searchValue });
        setAutoManualCurrentPage(0);
        setAutoManualRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredData, searchValue]);

  return autoManualFields.loaded ? (
    <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        columns={reportsAMCols}
        data={autoManualFields.data}
        title={undefined}
        options={{ ...options, tableBodyHeight: "73vh" }}
      />
      <TablePagination
        component="div"
        count={autoManualFields.dataCount}
        page={autoManualCurrentPage}
        onPageChange={handleChangePage}
        rowsPerPage={autoManualRowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </ThemeProvider>
  ) : (
    <ReportLoader />
  );
};

export default AutoManualReport;
