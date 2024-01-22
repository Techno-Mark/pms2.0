import { ThemeProvider } from "@emotion/react";
import MUIDataTable from "mui-datatables";
import React, { useEffect, useState } from "react";
import TablePagination from "@mui/material/TablePagination";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { callAPI } from "@/utils/API/callAPI";
import { report_Options } from "@/utils/datatable/TableOptions";
import { reportDatatatbleRatingCols } from "@/utils/datatable/columns/ReportsDatatableColumns";
import ReportLoader from "../common/ReportLoader";

const Data = new Date();

const pageNoReportRating = 1;
const pageSizeReportRating = 10;

const initialReportRatingFilter = {
  PageNo: pageNoReportRating,
  PageSize: pageSizeReportRating,
  GlobalSearch: "",
  SortColumn: "",
  IsDesc: false,
  Projects: [],
  ReturnTypeId: null,
  TypeofReturnId: null,
  Ratings: null,
  Users: [],
  DepartmentId: null,
  DateSubmitted: null,
  StartDate: new Date(Data.getFullYear(), Data.getMonth(), 1),
  EndDate: Data,
};

const Datatable_Rating = ({
  currentFilterData,
  onSearchData,
  onHandleExport,
}: any) => {
  const [allReportRatingFields, setAllReportRatingFields] = useState<any>({
    loaded: true,
    ratingData: [],
    page: 0,
    rowsPerPage: pageSizeReportRating,
    tableDataCount: 0,
  });
  const [filteredObjectReportRating, setFilteredOjectReportRating] =
    useState<any>(initialReportRatingFilter);

  const handleChangePageReportRating = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setAllReportRatingFields({
      ...allReportRatingFields,
      page: newPage,
    });
    setFilteredOjectReportRating({
      ...filteredObjectReportRating,
      PageNo: newPage + 1,
    });
  };

  const handleChangeRowsPerPageReportRating = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFilteredOjectReportRating({
      ...filteredObjectReportRating,
      PageNo: 1,
      PageSize: event.target.value,
    });
  };

  const getReportRatingList = async () => {
    setAllReportRatingFields({
      ...allReportRatingFields,
      loaded: false,
    });
    const params = filteredObjectReportRating;
    const url = `${process.env.report_api_url}/report/client/rating`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        onHandleExport(ResponseData.List.length > 0);
        setAllReportRatingFields({
          ...allReportRatingFields,
          loaded: true,
          ratingData: ResponseData.List,
          tableDataCount: ResponseData.TotalCount,
        });
      } else {
        setAllReportRatingFields({
          ...allReportRatingFields,
          loaded: true,
        });
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    setFilteredOjectReportRating({
      ...filteredObjectReportRating,
      ...currentFilterData,
    });
  }, [currentFilterData]);

  useEffect(() => {
    if (onSearchData) {
      setAllReportRatingFields({
        ...allReportRatingFields,
        ratingData: onSearchData,
      });
    } else {
      const timer = setTimeout(() => {
        getReportRatingList();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [onSearchData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      getReportRatingList();
    }, 500);
    return () => clearTimeout(timer);
  }, [filteredObjectReportRating]);

  return allReportRatingFields.loaded ? (
    <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        data={allReportRatingFields.ratingData}
        columns={reportDatatatbleRatingCols}
        title={undefined}
        options={{
          ...report_Options,
        }}
        data-tableid="rating_Datatable"
      />
      <TablePagination
        component="div"
        count={allReportRatingFields.tableDataCount}
        page={allReportRatingFields.page}
        onPageChange={handleChangePageReportRating}
        rowsPerPage={allReportRatingFields.rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPageReportRating}
      />
    </ThemeProvider>
  ) : (
    <ReportLoader />
  );
};

export default Datatable_Rating;
