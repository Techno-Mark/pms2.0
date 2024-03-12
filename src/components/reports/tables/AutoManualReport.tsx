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

const AutoManualReport = ({
  filteredData,
  searchValue,
  onHandleExport,
}: any) => {
  const [autoManualFields, setAutoManualFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [autoManualCurrentPage, setAutoManualCurrentPage] = useState<number>(0);
  const [autoManualRowsPerPage, setAutoManualRowsPerPage] =
    useState<number>(10);

  const getData = async (arg1: any) => {
    setAutoManualFields({
      ...autoManualFields,
      loaded: false,
    });

    const url = `${process.env.report_api_url}/report/automanual`;

    const successCallback = (data: any, error: any) => {
      if (data !== null && error === false) {
        onHandleExport(data.List.length > 0);
        setAutoManualFields({
          ...autoManualFields,
          loaded: true,
          data: data.List,
          dataCount: data.TotalCount,
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
        pageNo: newPage + 1,
        pageSize: autoManualRowsPerPage,
      });
    } else {
      getData({
        ...am_InitialFilter,
        pageNo: newPage + 1,
        pageSize: autoManualRowsPerPage,
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
        pageNo: 1,
        pageSize: event.target.value,
      });
    } else {
      getData({
        ...am_InitialFilter,
        pageNo: 1,
        pageSize: event.target.value,
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
