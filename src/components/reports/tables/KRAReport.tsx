import ReportLoader from "@/components/common/ReportLoader";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { options } from "@/utils/datatable/TableOptions";
import { TablePagination, ThemeProvider } from "@mui/material";
import MUIDataTable from "mui-datatables";
import React, { useEffect, useState } from "react";
import { FieldsType } from "../types/FieldsType";
import { kra_InitialFilter } from "@/utils/reports/getFilters";
import { reportsKRACols } from "@/utils/datatable/columns/ReportsDatatableColumns";
import { callAPI } from "@/utils/API/callAPI";
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
  Clients: number[] | [];
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

const KRAReport = ({
  filteredData,
  searchValue,
  onHandleExport,
}: ReportProps) => {
  const [kraFields, setKraFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [kraCurrentPage, setKraCurrentPage] = useState<number>(0);
  const [kraRowsPerPage, setKraRowsPerPage] = useState<number>(10);

  const getData = async (arg1: FilteredData) => {
    setKraFields({
      ...kraFields,
      loaded: false,
    });

    const url = `${process.env.report_api_url}/report/kra`;

    const successCallback = (
      ResponseData: Response,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        onHandleExport(ResponseData.List.length > 0);
        setKraFields({
          ...kraFields,
          loaded: true,
          data: ResponseData.List,
          dataCount: ResponseData.TotalCount,
        });
      } else {
        setKraFields({ ...kraFields, data: [], dataCount: 0, loaded: true });
      }
    };

    callAPI(url, arg1, successCallback, "post");
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setKraCurrentPage(newPage);
    if (filteredData !== null) {
      getData({
        ...filteredData,
        PageNo: newPage + 1,
        PageSize: kraRowsPerPage,
      });
    } else {
      getData({
        ...kra_InitialFilter,
        PageNo: newPage + 1,
        PageSize: kraRowsPerPage,
      });
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setKraCurrentPage(0);
    setKraRowsPerPage(parseInt(event.target.value));

    if (filteredData !== null) {
      getData({
        ...filteredData,
        PageNo: 1,
        PageSize: Number(event.target.value),
      });
    } else {
      getData({
        ...kra_InitialFilter,
        PageNo: 1,
        PageSize: Number(event.target.value),
      });
    }
  };

  useEffect(() => {
    if (filteredData !== null) {
      const timer = setTimeout(() => {
        getData({ ...filteredData, GlobalSearch: searchValue });
        setKraCurrentPage(0);
        setKraRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        getData({ ...kra_InitialFilter, GlobalSearch: searchValue });
        setKraCurrentPage(0);
        setKraRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredData, searchValue]);

  return kraFields.loaded ? (
    <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        columns={reportsKRACols}
        data={kraFields.data}
        title={undefined}
        options={{ ...options, tableBodyHeight: "73vh" }}
      />
      <TablePagination
        component="div"
        count={kraFields.dataCount}
        page={kraCurrentPage}
        onPageChange={handleChangePage}
        rowsPerPage={kraRowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </ThemeProvider>
  ) : (
    <ReportLoader />
  );
};

export default KRAReport;
