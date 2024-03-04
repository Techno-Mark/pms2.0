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

const KRAReport = ({ filteredData, searchValue, onHandleExport }: any) => {
  const [kraFields, setKraFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [kraCurrentPage, setKraCurrentPage] = useState<number>(0);
  const [kraRowsPerPage, setKraRowsPerPage] = useState<number>(10);

  const getData = async (arg1: any) => {
    setKraFields({
      ...kraFields,
      loaded: false,
    });

    const url = `${process.env.report_api_url}/report/project`;

    const successCallback = (data: any, error: any) => {
      if (data !== null && error === false) {
        onHandleExport(data.List.length > 0);
        setKraFields({
          ...kraFields,
          loaded: true,
          // data: data.List,
          data: [],
          dataCount: data.TotalCount,
        });
      } else {
        setKraFields({ ...kraFields, loaded: true });
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
        pageNo: newPage + 1,
        pageSize: kraRowsPerPage,
      });
    } else {
      getData({
        ...kra_InitialFilter,
        pageNo: newPage + 1,
        pageSize: kraRowsPerPage,
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
        pageNo: 1,
        pageSize: kraRowsPerPage,
      });
    } else {
      getData({
        ...kra_InitialFilter,
        pageNo: 1,
        pageSize: event.target.value,
      });
    }
  };

  useEffect(() => {
    if (filteredData !== null) {
      const timer = setTimeout(() => {
        getData({ ...filteredData, globalSearch: searchValue });
        setKraCurrentPage(0);
        setKraRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        getData({ ...kra_InitialFilter, globalSearch: searchValue });
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
