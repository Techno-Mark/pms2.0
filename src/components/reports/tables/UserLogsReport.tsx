import MUIDataTable from "mui-datatables";
import { useEffect, useState } from "react";
import { callAPI } from "@/utils/API/callAPI";
import { FieldsType } from "../types/FieldsType";
import { options } from "@/utils/datatable/TableOptions";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import ReportLoader from "@/components/common/ReportLoader";
import { TablePagination, ThemeProvider } from "@mui/material";
import { userLogs_InitialFilter } from "@/utils/reports/getFilters";
import { reportsUserLogsCols } from "@/utils/datatable/columns/ReportsDatatableColumns";
import { ReportProps } from "@/utils/Types/reports";

interface FilteredData {
  pageNo: number;
  pageSize: number;
  sortColumn: string;
  isDesc: boolean;
  globalSearch: string;
  departmentIds: number[] | [];
  isActive: boolean;
  users: any[] | [];
  dateFilter: string | null;
  isLoggedInFilter: boolean | null;
  isDownload: boolean;
}

interface Response {
  UserLogReportFilters: any | null;
  List:
    | {
        LoginTime: string | null;
        LogoutTime: string | null;
        TotalBreakTime: string | null;
        TotalIdleTime: string | null;
        TotalProductiveTime: string | null;
        IsLoggedIn: number | null;
        UserId: number;
        UserName: string;
        DepartmentId: number | null;
        DepartmentName: string | null;
        RoleType: string | null;
        ReportingManagerId: number | null;
        ReportingManager: string | null;
        IsActive: boolean;
        OrganizationId: number;
      }[]
    | [];
  TotalCount: number;
}

const UserLogsReport = ({
  filteredData,
  searchValue,
  onHandleExport,
}: ReportProps) => {
  const [userlogFields, setUserlogFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [userCurrentPage, setUserCurrentPage] = useState<number>(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState<number>(10);

  const getData = async (arg1: FilteredData) => {
    setUserlogFields({
      ...userlogFields,
      loaded: false,
    });
    const url = `${process.env.report_api_url}/report/userLog`;

    const successCallBack = (
      ResponseData: Response,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        onHandleExport(ResponseData.List.length > 0);
        setUserlogFields({
          ...userlogFields,
          loaded: true,
          data: ResponseData.List,
          dataCount: ResponseData.TotalCount,
        });
      } else {
        setUserlogFields({ ...userlogFields, loaded: true });
      }
    };

    callAPI(url, arg1, successCallBack, "post");
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setUserCurrentPage(newPage);
    if (filteredData !== null) {
      getData({
        ...filteredData,
        pageNo: newPage + 1,
        pageSize: userRowsPerPage,
      });
    } else {
      getData({
        ...userLogs_InitialFilter,
        pageNo: newPage + 1,
        pageSize: userRowsPerPage,
      });
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setUserCurrentPage(0);
    setUserRowsPerPage(parseInt(event.target.value));

    if (filteredData !== null) {
      getData({
        ...filteredData,
        pageNo: 1,
        pageSize: event.target.value,
      });
    } else {
      getData({
        ...userLogs_InitialFilter,
        pageNo: 1,
        pageSize: event.target.value,
      });
    }
  };

  useEffect(() => {
    if (filteredData !== null) {
      const timer = setTimeout(() => {
        setUserCurrentPage(0);
        setUserRowsPerPage(10);
        getData({ ...filteredData, globalSearch: searchValue });
      }, 500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        getData({ ...userLogs_InitialFilter, globalSearch: searchValue });
        setUserCurrentPage(0);
        setUserRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredData, searchValue]);

  return userlogFields.loaded ? (
    <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        title={undefined}
        columns={reportsUserLogsCols}
        data={userlogFields.data}
        options={{ ...options, tableBodyHeight: "73vh" }}
      />
      <TablePagination
        component="div"
        count={userlogFields.dataCount}
        page={userCurrentPage}
        onPageChange={handleChangePage}
        rowsPerPage={userRowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </ThemeProvider>
  ) : (
    <ReportLoader />
  );
};

export default UserLogsReport;
