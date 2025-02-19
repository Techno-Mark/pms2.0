import React, { useEffect, useState } from "react";
import { FieldsType } from "../types/FieldsType";
import ReportLoader from "@/components/common/ReportLoader";
import { TablePagination, ThemeProvider } from "@mui/material";
import MUIDataTable from "mui-datatables";
import { options } from "@/utils/datatable/TableOptions";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { reportsEmailTypeCols } from "@/utils/datatable/columns/ReportsDatatableColumns";
import { emailType_InitialFilter } from "@/utils/reports/getFilters";
import { callAPI } from "@/utils/API/callAPI";
import { ReportProps } from "@/utils/Types/reports";

interface FilteredData {
  PageNo: number;
  PageSize: number;
  SortColumn: string;
  IsDesc: boolean;
  GlobalSearch: string;
  IsDownload: boolean;
  ClientId: number | null;
  DepartmentId: number | null;
  EmailType: number | null;
  Tags: string[] | null;
  TicketStatus: number | null;
  SlaStatus: number | null;
  ReportingManagerId: number | null;
  ReceivedFrom: string | null;
  ReceivedTo: string | null;
  DueFrom: string | null;
  DueTo: string | null;
  OpenFrom: string | null;
  OpenTo: string | null;
}

interface Response {
  List:
    | {
        TicketId: number;
        SubjectName: string;
        ClientName: string | null;
        DepartmentNames: string | null;
        EmailType: string | null;
        STD_SLA_Time: string | null;
        ActualTime: string | null;
        Tags: number[] | null;
        TagList: string | null;
        TicketStatus: number;
        TicketStatusName: string;
        SLAStatus: string | null;
        ReceivedOn: string | null;
        OpenedTime: string | null;
        DueOn: string | null;
        AssignedToName: string | null;
        ReportingManagerName: string | null;
      }[]
    | [];
  TotalCount: number;
}

const EmailTypeReport = ({
  filteredData,
  searchValue,
  onHandleExport,
}: ReportProps) => {
  const [emailTypeFields, setEmailTypeFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [emailTypeCurrentPage, setEmailTypeCurrentPage] = useState<number>(0);
  const [emailTypeRowsPerPage, setEmailTypeRowsPerPage] = useState<number>(10);

  const getData = async (arg1: FilteredData) => {
    setEmailTypeFields({
      ...emailTypeFields,
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
        setEmailTypeFields({
          ...emailTypeFields,
          loaded: true,
          data: ResponseData.List,
          dataCount: ResponseData.TotalCount,
        });
      } else {
        setEmailTypeFields({
          ...emailTypeFields,
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
    setEmailTypeCurrentPage(newPage);
    if (filteredData !== null) {
      getData({
        ...filteredData,
        GlobalSearch: searchValue,
        PageNo: newPage + 1,
        PageSize: emailTypeRowsPerPage,
      });
    } else {
      getData({
        ...emailType_InitialFilter,
        GlobalSearch: searchValue,
        PageNo: newPage + 1,
        PageSize: emailTypeRowsPerPage,
      });
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEmailTypeCurrentPage(0);
    setEmailTypeRowsPerPage(parseInt(event.target.value));

    if (filteredData !== null) {
      getData({
        ...filteredData,
        GlobalSearch: searchValue,
        PageNo: 1,
        PageSize: Number(event.target.value),
      });
    } else {
      getData({
        ...emailType_InitialFilter,
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
        setEmailTypeCurrentPage(0);
        setEmailTypeRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        getData({ ...emailType_InitialFilter, GlobalSearch: searchValue });
        setEmailTypeCurrentPage(0);
        setEmailTypeRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredData, searchValue]);

  return emailTypeFields.loaded ? (
    <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        columns={reportsEmailTypeCols}
        data={emailTypeFields.data}
        title={undefined}
        options={{ ...options, tableBodyHeight: "73vh" }}
      />
      <TablePagination
        component="div"
        count={emailTypeFields.dataCount}
        page={emailTypeCurrentPage}
        onPageChange={handleChangePage}
        rowsPerPage={emailTypeRowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </ThemeProvider>
  ) : (
    <ReportLoader />
  );
};

export default EmailTypeReport;
