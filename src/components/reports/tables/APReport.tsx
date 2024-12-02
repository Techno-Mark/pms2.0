import React, { useEffect, useState } from "react";
import { FieldsType } from "../types/FieldsType";
import ReportLoader from "@/components/common/ReportLoader";
import { TablePagination, ThemeProvider } from "@mui/material";
import MUIDataTable from "mui-datatables";
import { options } from "@/utils/datatable/TableOptions";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { reportsAPCols } from "@/utils/datatable/columns/ReportsDatatableColumns";
import { ap_InitialFilter } from "@/utils/reports/getFilters";
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
  Users: number[] | null;
  Clients: number[] | null;
  ReportingManagers: number[] | null;
  DepartmentIds: number[] | null;
  IsDownload: boolean;
}

interface Response {
  ActualPlannedReportFilters: any | null;
  List:
    | {
        ClientName: string;
        ProjectName: string | null;
        TaskDate: string;
        WorkItemId: number;
        TaskName: string;
        Description: string | null;
        ProcessId: number | null;
        ProcessName: string | null;
        SubProcessId: number | null;
        SubProcessName: string | null;
        AssignedToId: number | null;
        AssignedTo: string | null;
        ReportingToId: number | null;
        ReportingTo: string | null;
        TaskManagerId: number | null;
        TaskManager: string | null;
        Quantity: string | null;
        StdTime: string | null;
        Comment: string | null;
        TotalTime: string | null;
        AutoTime: string | null;
        ManualTime: string | null;
        Difference: number | null;
        DepartmentId: number | null;
        DepartmentName: string | null;
        PreparorTotalTime: string | null;
        PreparorAutoTime: string | null;
        PreparorManualTime: string | null;
        ReviewerTotalTime: string | null;
        ReviewerAutoTime: string | null;
        ReviewerManualTime: string | null;
        ReviewerStatusId: number | null;
        ReviewerStatusName: string | null;
        ReviewerStatusColorCode: string | null;
        QATotalTime: string | null;
        QAAutoTime: string | null;
        QAManualTime: string | null;
        QAQuantity: string | null;
      }[]
    | [];
  TotalCount: number;
}

const APReport = ({
  filteredData,
  searchValue,
  onHandleExport,
}: ReportProps) => {
  const [apFields, setApFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [apCurrentPage, setApCurrentPage] = useState<number>(0);
  const [apRowsPerPage, setApRowsPerPage] = useState<number>(10);

  const getData = async (arg1: FilteredData) => {
    setApFields({
      ...apFields,
      loaded: false,
    });

    const url = `${process.env.report_api_url}/report/actualplanned`;

    const successCallback = (
      ResponseData: Response,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        onHandleExport(ResponseData.List.length > 0);
        setApFields({
          ...apFields,
          loaded: true,
          data: ResponseData.List,
          dataCount: ResponseData.TotalCount,
        });
      } else {
        setApFields({ ...apFields, data: [], dataCount: 0, loaded: true });
      }
    };

    callAPI(url, arg1, successCallback, "post");
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setApCurrentPage(newPage);
    if (filteredData !== null) {
      getData({
        ...filteredData,
        GlobalSearch: searchValue,
        PageNo: newPage + 1,
        PageSize: apRowsPerPage,
      });
    } else {
      getData({
        ...ap_InitialFilter,
        GlobalSearch: searchValue,
        PageNo: newPage + 1,
        PageSize: apRowsPerPage,
      });
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setApCurrentPage(0);
    setApRowsPerPage(parseInt(event.target.value));

    if (filteredData !== null) {
      getData({
        ...filteredData,
        GlobalSearch: searchValue,
        PageNo: 1,
        PageSize: Number(event.target.value),
      });
    } else {
      getData({
        ...ap_InitialFilter,
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
        setApCurrentPage(0);
        setApRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        getData({ ...ap_InitialFilter, GlobalSearch: searchValue });
        setApCurrentPage(0);
        setApRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredData, searchValue]);

  return apFields.loaded ? (
    <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        columns={reportsAPCols}
        data={apFields.data}
        title={undefined}
        options={{ ...options, tableBodyHeight: "73vh" }}
      />
      <TablePagination
        component="div"
        count={apFields.dataCount}
        page={apCurrentPage}
        onPageChange={handleChangePage}
        rowsPerPage={apRowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </ThemeProvider>
  ) : (
    <ReportLoader />
  );
};

export default APReport;
