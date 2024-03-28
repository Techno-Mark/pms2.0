import MUIDataTable from "mui-datatables";
import { useEffect, useState } from "react";
import { callAPI } from "@/utils/API/callAPI";
import { FieldsType } from "../types/FieldsType";
import { options } from "@/utils/datatable/TableOptions";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import ReportLoader from "@/components/common/ReportLoader";
import { TablePagination, ThemeProvider } from "@mui/material";
import { rating_InitialFilter } from "@/utils/reports/getFilters";
import { reportsRatingCols } from "@/utils/datatable/columns/ReportsDatatableColumns";
import { ReportProps } from "@/utils/Types/reports";

interface FilteredData {
  pageNo: number;
  pageSize: number;
  GlobalSearch: string;
  SortColumn: string;
  IsDesc: boolean;
  Projects: number[] | [];
  ReturnTypeId: number | null;
  Ratings: string | null;
  Clients: number[] | [];
  DepartmentId: number | null;
  StartDate: string | null;
  EndDate: string | null;
}

interface Response {
  List:
    | {
        WorkItemId: number;
        TaskName: string;
        ClientId: number;
        ClientName: string;
        ProjectId: number;
        ProjectName: string;
        ProcessId: number;
        ProcessName: string;
        Ratings: string;
        RatingBy: string;
        RatingOn: string;
        UserId: string;
        AssignedTo: string;
        TypeOfReturn: number | null;
        ReturnTypes: string | null;
        HoursLogged: string | null;
        DateSubmitted: string | null;
        Comments: string | null;
      }[]
    | [];
  TotalCount: number;
}

const RatingReport = ({
  filteredData,
  searchValue,
  onHandleExport,
}: ReportProps) => {
  const [ratingReportFields, setRatingReportFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [ratingCurrentPage, setRatingCurrentPage] = useState<number>(0);
  const [ratingRowsPerPage, setRatingRowsPerPage] = useState<number>(10);

  const getData = async (arg1: FilteredData) => {
    setRatingReportFields({
      ...ratingReportFields,
      loaded: false,
    });
    const url = `${process.env.report_api_url}/report/admin/rating`;

    const successCallback = (
      ResponseData: Response,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        onHandleExport(ResponseData.List.length > 0);
        setRatingReportFields({
          ...ratingReportFields,
          loaded: true,
          data: ResponseData.List,
          dataCount: ResponseData.TotalCount,
        });
      } else {
        setRatingReportFields({ ...ratingReportFields, loaded: true });
      }
    };

    callAPI(url, arg1, successCallback, "post");
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setRatingCurrentPage(newPage);
    if (filteredData !== null) {
      getData({
        ...filteredData,
        pageNo: newPage + 1,
        pageSize: ratingRowsPerPage,
      });
    } else {
      getData({
        ...rating_InitialFilter,
        pageNo: newPage + 1,
        pageSize: ratingRowsPerPage,
      });
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRatingCurrentPage(0);
    setRatingRowsPerPage(parseInt(event.target.value));

    if (filteredData !== null) {
      getData({
        ...filteredData,
        pageNo: 1,
        pageSize: event.target.value,
      });
    } else {
      getData({
        ...rating_InitialFilter,
        pageNo: 1,
        pageSize: event.target.value,
      });
    }
  };

  useEffect(() => {
    if (filteredData !== null) {
      const timer = setTimeout(() => {
        getData({ ...filteredData, GlobalSearch: searchValue });
        setRatingCurrentPage(0);
        setRatingRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        getData({ ...rating_InitialFilter, GlobalSearch: searchValue });
        setRatingCurrentPage(0);
        setRatingRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredData, searchValue]);

  return ratingReportFields.loaded ? (
    <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        title={undefined}
        columns={reportsRatingCols}
        data={ratingReportFields.data}
        options={{ ...options, tableBodyHeight: "73vh" }}
      />
      <TablePagination
        component="div"
        count={ratingReportFields.dataCount}
        page={ratingCurrentPage}
        onPageChange={handleChangePage}
        rowsPerPage={ratingRowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </ThemeProvider>
  ) : (
    <ReportLoader />
  );
};

export default RatingReport;
