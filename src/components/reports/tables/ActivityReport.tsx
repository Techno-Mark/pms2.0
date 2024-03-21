import React, { useEffect, useState } from "react";
import { FieldsType } from "../types/FieldsType";
import ReportLoader from "@/components/common/ReportLoader";
import MUIDataTable from "mui-datatables";
import { TablePagination, ThemeProvider } from "@mui/material";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { callAPI } from "@/utils/API/callAPI";
import { activity_InitialFilter } from "@/utils/reports/getFilters";
import { reportsActivityCols } from "@/utils/datatable/columns/ReportsDatatableColumns";
import { options } from "@/utils/datatable/TableOptions";
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
  DepartmentIds: number[] | [];
  IsDownload: boolean;
}

interface Response {
  ActivityReportFilters: any | null;
  List:
    | {
        UserId: number;
        UserName: string;
        TotalProductive: string;
        TotalHours: string;
        TotalBillable: string;
        TotalNonBillable: string;
        TotalNonProductive: string;
        DepartmentId: number;
        DepartmentName: string;
      }[]
    | [];
  TotalCount: number;
}

const ActivityReport = ({
  filteredData,
  searchValue,
  onHandleExport,
}: ReportProps) => {
  const [activityFields, setActivityFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [activityCurrentPage, setActivityCurrentPage] = useState<number>(0);
  const [activityRowsPerPage, setActivityRowsPerPage] = useState<number>(10);

  const getData = async (arg1: FilteredData) => {
    setActivityFields({
      ...activityFields,
      loaded: false,
    });

    const url = `${process.env.report_api_url}/report/activity`;

    const successCallback = (
      ResponseData: Response,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        onHandleExport(ResponseData.List.length > 0);
        setActivityFields({
          ...activityFields,
          loaded: true,
          data: ResponseData.List,
          dataCount: ResponseData.TotalCount,
        });
      } else {
        setActivityFields({
          ...activityFields,
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
    setActivityCurrentPage(newPage);
    if (filteredData !== null) {
      getData({
        ...filteredData,
        PageNo: newPage + 1,
        PageSize: activityRowsPerPage,
      });
    } else {
      getData({
        ...activity_InitialFilter,
        PageNo: newPage + 1,
        PageSize: activityRowsPerPage,
      });
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setActivityCurrentPage(0);
    setActivityRowsPerPage(parseInt(event.target.value));

    if (filteredData !== null) {
      getData({
        ...filteredData,
        PageNo: 1,
        PageSize: Number(event.target.value),
      });
    } else {
      getData({
        ...activity_InitialFilter,
        PageNo: 1,
        PageSize: Number(event.target.value),
      });
    }
  };

  useEffect(() => {
    if (filteredData !== null) {
      const timer = setTimeout(() => {
        getData({ ...filteredData, GlobalSearch: searchValue });
        setActivityCurrentPage(0);
        setActivityRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        getData({ ...activity_InitialFilter, GlobalSearch: searchValue });
        setActivityCurrentPage(0);
        setActivityRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredData, searchValue]);

  return activityFields.loaded ? (
    <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        columns={reportsActivityCols}
        data={activityFields.data}
        title={undefined}
        options={{ ...options, tableBodyHeight: "73vh" }}
      />
      <TablePagination
        component="div"
        count={activityFields.dataCount}
        page={activityCurrentPage}
        onPageChange={handleChangePage}
        rowsPerPage={activityRowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </ThemeProvider>
  ) : (
    <ReportLoader />
  );
};

export default ActivityReport;
