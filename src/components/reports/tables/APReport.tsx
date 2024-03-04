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

const APReport = ({ filteredData, searchValue, onHandleExport }: any) => {
  const [apFields, setApFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [apCurrentPage, setApCurrentPage] = useState<number>(0);
  const [apRowsPerPage, setApRowsPerPage] = useState<number>(10);

  const getData = async (arg1: any) => {
    setApFields({
      ...apFields,
      loaded: false,
    });

    const url = `${process.env.report_api_url}/report/actualplanned`;

    const successCallback = (data: any, error: any) => {
      if (data !== null && error === false) {
        onHandleExport(data.List.length > 0);
        setApFields({
          ...apFields,
          loaded: true,
          data: data.List,
          dataCount: data.TotalCount,
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
        pageNo: newPage + 1,
        pageSize: apRowsPerPage,
      });
    } else {
      getData({
        ...ap_InitialFilter,
        pageNo: newPage + 1,
        pageSize: apRowsPerPage,
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
        pageNo: 1,
        pageSize: apRowsPerPage,
      });
    } else {
      getData({
        ...ap_InitialFilter,
        pageNo: 1,
        pageSize: event.target.value,
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
