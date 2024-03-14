import MUIDataTable from "mui-datatables";
import { useEffect, useState } from "react";
import { callAPI } from "@/utils/API/callAPI";
import { FieldsType } from "../types/FieldsType";
import { options } from "@/utils/datatable/TableOptions";
import ReportLoader from "@/components/common/ReportLoader";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { TablePagination, ThemeProvider } from "@mui/material";
import { audit_InitialFilter } from "@/utils/reports/getFilters";
import { reportsAuditCols } from "@/utils/datatable/columns/ReportsDatatableColumns";

const AuditReport = ({ filteredData, searchValue, onHandleExport }: any) => {
  const [auditFields, setAuditFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [auditCurrentPage, setAuditCurrentPage] = useState<number>(0);
  const [auditRowsPerPage, setAuditRowsPerPage] = useState<number>(10);

  const getData = async (arg1: any) => {
    setAuditFields({
      ...auditFields,
      loaded: false,
    });
    const url = `${process.env.report_api_url}/report/audit`;

    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        onHandleExport(ResponseData.List.length > 0);
        setAuditFields({
          ...auditFields,
          loaded: true,
          data: ResponseData.List,
          dataCount: ResponseData.TotalCount,
        });
      } else {
        setAuditFields({
          ...auditFields,
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
    setAuditCurrentPage(newPage);
    if (filteredData !== null) {
      getData({
        ...filteredData,
        PageNo: newPage + 1,
        PageSize: auditRowsPerPage,
      });
    } else {
      getData({
        ...audit_InitialFilter,
        PageNo: newPage + 1,
        PageSize: auditRowsPerPage,
      });
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAuditCurrentPage(0);
    setAuditRowsPerPage(parseInt(event.target.value));

    if (filteredData !== null) {
      getData({
        ...filteredData,
        PageNo: 1,
        PageSize: event.target.value,
      });
    } else {
      getData({
        ...audit_InitialFilter,
        PageNo: 1,
        PageSize: event.target.value,
      });
    }
  };

  useEffect(() => {
    if (filteredData !== null) {
      const timer = setTimeout(() => {
        getData({ ...filteredData, GlobalSearch: searchValue });
        setAuditCurrentPage(0);
        setAuditRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        getData({ ...audit_InitialFilter, GlobalSearch: searchValue });
        setAuditCurrentPage(0);
        setAuditRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredData, searchValue]);

  return auditFields.loaded ? (
    <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        title={undefined}
        columns={reportsAuditCols}
        data={auditFields.data}
        options={{ ...options, tableBodyHeight: "73vh" }}
      />
      <TablePagination
        component="div"
        count={auditFields.dataCount}
        page={auditCurrentPage}
        onPageChange={handleChangePage}
        rowsPerPage={auditRowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </ThemeProvider>
  ) : (
    <ReportLoader />
  );
};

export default AuditReport;
