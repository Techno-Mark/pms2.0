import React, { useEffect, useState } from "react";
import { FieldsType } from "../types/FieldsType";
import ReportLoader from "@/components/common/ReportLoader";
import { TablePagination, ThemeProvider } from "@mui/material";
import MUIDataTable from "mui-datatables";
import { options } from "@/utils/datatable/TableOptions";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { reportsErrorLogCols } from "@/utils/datatable/columns/ReportsDatatableColumns";
import { errorLog_InitialFilter } from "@/utils/reports/getFilters";
import { callAPI } from "@/utils/API/callAPI";
import { ReportProps } from "@/utils/Types/reports";

interface FilteredData {
  PageNo: number;
  PageSize: number;
  sortColumn: string;
  IsDesc: boolean;
  GlobalSearch: string;
  ErrorType: number[] | null;
  RootCause: number[] | null;
  Impact: number[] | null;
  NatureOfError: number[] | null;
  Priority: number[] | null;
  Assignee: number[] | null;
  Reviewer: number[] | null;
  ReceivedFrom: string | null;
  ReceivedTo: string | null;
  ResolvedOn: string | null;
  IsDownload: boolean;
}

interface Response {
  ActualPlannedReportFilters: any | null;
  List:
    | {
        TaskId: number;
        TaskName: string | null;
        Description: string | null;
        ClientId: number | null;
        ClientName: string | null;
        ProjectId: number | null;
        ProjectName: string | null;
        DepartmentId: number | null;
        DepartmentName: string | null;
        WorkTypeId: number | null;
        WorkTypeName: string | null;
        ErrorType: number | null;
        RootCause: number | null;
        NatureOfError: number | null;
        Priority: number | null;
        Impact: number | null;
        ErrorCount: number | null;
        ErrorTypeVal: string | null;
        RootCauseVal: string | null;
        NatureOfErrorVal: string | null;
        PriorityVal: string | null;
        ImpactVal: string | null;
        Amount: null;
        DateOfTransaction: null;
        Remark: string | null;
        AssigneeId: number | null;
        AssigneeName: string | null;
        ReviewerId: number | null;
        ReviewerName: string | null;
        ReportingManagerID: number | null;
        ReportingManagerName: string | null;
        SubmitedBy: number | null;
        SubmittedOn: string | null;
        ResolvedBy: string | null;
        ResolvedOn: null;
        PreparorErrorTime: string | null;
        ReveiwerErrorTime: string | null;
        DateOfReview: string | null;
        RootCauseAnalysis: string | null;
        MitigationPlan: string | null;
        ContigencyPlan: string | null;
        VendorName: string | null;
        DocumentNumber: string | null;
        Category: string | null;
        ErrorIdentificationDate: string;
        ResolutionStatus: number;
        ResolutionStatusVal: string;
        IdentifiedBy: string | null;
      }[]
    | [];
  TotalCount: number;
}

const ErrorLogReport = ({
  filteredData,
  searchValue,
  onHandleExport,
}: ReportProps) => {
  const [errorLogFields, setErrorLogFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [errorLogCurrentPage, setErrorLogCurrentPage] = useState<number>(0);
  const [errorLogRowsPerPage, setErrorLogRowsPerPage] = useState<number>(10);

  const getData = async (arg1: FilteredData) => {
    setErrorLogFields({
      ...errorLogFields,
      loaded: false,
    });

    const url = `${process.env.report_api_url}/report/errorlog`;

    const successCallback = (
      ResponseData: Response,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        onHandleExport(ResponseData.List.length > 0);
        setErrorLogFields({
          ...errorLogFields,
          loaded: true,
          data: ResponseData.List,
          dataCount: ResponseData.TotalCount,
        });
      } else {
        setErrorLogFields({
          ...errorLogFields,
          data: [],
          dataCount: 0,
          loaded: true,
        });
      }
    };

    callAPI(url, arg1, successCallback, "post");
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setErrorLogCurrentPage(newPage);
    if (filteredData !== null) {
      getData({
        ...filteredData,
        GlobalSearch: searchValue,
        PageNo: newPage + 1,
        PageSize: errorLogRowsPerPage,
      });
    } else {
      getData({
        ...errorLog_InitialFilter,
        GlobalSearch: searchValue,
        PageNo: newPage + 1,
        PageSize: errorLogRowsPerPage,
      });
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setErrorLogCurrentPage(0);
    setErrorLogRowsPerPage(parseInt(event.target.value));

    if (filteredData !== null) {
      getData({
        ...filteredData,
        GlobalSearch: searchValue,
        PageNo: 1,
        PageSize: Number(event.target.value),
      });
    } else {
      getData({
        ...errorLog_InitialFilter,
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
        setErrorLogCurrentPage(0);
        setErrorLogRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        getData({ ...errorLog_InitialFilter, GlobalSearch: searchValue });
        setErrorLogCurrentPage(0);
        setErrorLogRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredData, searchValue]);

  return errorLogFields.loaded ? (
    <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        columns={reportsErrorLogCols}
        data={errorLogFields.data}
        title={undefined}
        options={{ ...options, tableBodyHeight: "73vh" }}
      />
      <TablePagination
        component="div"
        count={errorLogFields.dataCount}
        page={errorLogCurrentPage}
        onPageChange={handleChangePage}
        rowsPerPage={errorLogRowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </ThemeProvider>
  ) : (
    <ReportLoader />
  );
};

export default ErrorLogReport;
