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

const UserLogs = ({ filteredData, searchValue, onHandleExport }: any) => {
  const [userlogFields, setUserlogFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [userCurrentPage, setUserCurrentPage] = useState<number>(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState<number>(10);

  const getData = async (arg1: any) => {
    setUserlogFields({
      ...userlogFields,
      loaded: false,
    });
    const url = `${process.env.report_api_url}/report/userLog`;

    const successCallBack = (data: any, error: any) => {
      if (data !== null && error === false) {
        onHandleExport(data.List.length > 0);
        setUserlogFields({
          ...userlogFields,
          loaded: true,
          data: data.List,
          dataCount: data.TotalCount,
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
    getData({
      ...filteredData,
      pageNo: newPage + 1,
      pageSize: userRowsPerPage,
    });
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setUserCurrentPage(0);
    setUserRowsPerPage(parseInt(event.target.value));

    getData({
      ...filteredData,
      pageNo: 1,
      pageSize: event.target.value,
    });
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
        options={options}
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

export default UserLogs;
