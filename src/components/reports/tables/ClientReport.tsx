import ReportLoader from "@/components/common/ReportLoader";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  ThemeProvider,
} from "@mui/material";
import MUIDataTable from "mui-datatables";
import React, { useEffect, useState } from "react";
import { FieldsType } from "../types/FieldsType";
import { client_InitialFilter } from "@/utils/reports/getFilters";
import { callAPI } from "@/utils/API/callAPI";
import { generateCustomColumn } from "@/utils/datatable/columns/ColsGenerateFunctions";
import {
  generateCommonBodyRender,
  generateInitialTimer,
} from "@/utils/datatable/CommonFunction";
import { options } from "@/utils/datatable/TableOptions";

const ClientReport = ({ filteredData, searchValue, onHandleExport }: any) => {
  const [clientFields, setClientFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [clientCurrentPage, setClientCurrentPage] = useState<number>(0);
  const [clientRowsPerPage, setClientRowsPerPage] = useState<number>(10);

  const getData = async (arg1: any) => {
    setClientFields({
      ...clientFields,
      loaded: false,
    });

    const url = `${process.env.report_api_url}/report/project`;

    const successCallback = (data: any, error: any) => {
      if (data !== null && error === false) {
        onHandleExport(data.List.length > 0);
        setClientFields({
          ...clientFields,
          loaded: true,
          // data: data.List,
          data: [],
          dataCount: data.TotalCount,
        });
      } else {
        setClientFields({
          ...clientFields,
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
    setClientCurrentPage(newPage);
    if (filteredData !== null) {
      getData({
        ...filteredData,
        pageNo: newPage + 1,
        pageSize: clientRowsPerPage,
      });
    } else {
      getData({
        ...client_InitialFilter,
        pageNo: newPage + 1,
        pageSize: clientRowsPerPage,
      });
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setClientCurrentPage(0);
    setClientRowsPerPage(parseInt(event.target.value));

    if (filteredData !== null) {
      getData({
        ...filteredData,
        pageNo: 1,
        pageSize: clientRowsPerPage,
      });
    } else {
      getData({
        ...client_InitialFilter,
        pageNo: 1,
        pageSize: event.target.value,
      });
    }
  };

  useEffect(() => {
    if (filteredData !== null) {
      const timer = setTimeout(() => {
        getData({ ...filteredData, GlobalSearch: searchValue });
        setClientCurrentPage(0);
        setClientRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        getData({ ...client_InitialFilter, GlobalSearch: searchValue });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredData, searchValue]);

  const reportsClientColConfig = [
    {
      header: "Clientname",
      label: "Client Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      header: "STDTime",
      label: "STD Time",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      header: "EditHours",
      label: "Edit Hours",
      bodyRenderer: generateInitialTimer,
    },
  ];

  const reportsClientCols: any = reportsClientColConfig.map((col: any) =>
    generateCustomColumn(col.name, col.label, col.bodyRenderer)
  );

  const optionsExpand: any = {
    expandableRows: true,
    renderExpandableRow: (rowData: any, rowMeta: any) => {
      return (
        <React.Fragment>
          <tr>
            <td colSpan={12}>
              <TableContainer component={Paper}>
                <Table style={{ minWidth: "650" }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell className="!pl-[4.5rem] font-semibold">
                        Type Of Work
                      </TableCell>
                      <TableCell className="font-semibold">
                        Billing Type
                      </TableCell>
                      <TableCell className="font-semibold">
                        Contracted Hrs.
                      </TableCell>
                      <TableCell className="font-semibold">
                        Internal Hrs.
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clientFields.data[rowMeta.rowIndex].WorkTypes.length >
                    0 ? (
                      clientFields.data[rowMeta.rowIndex].WorkTypes.map(
                        (i: any, index: any) => (
                          <TableRow key={index}>
                            <TableCell className="!pl-[4.5rem] w-[15rem]">
                              {i.WorkTypeName}
                            </TableCell>
                            <TableCell className="w-[17.5rem]">
                              {i.BillingTypeName}
                            </TableCell>
                            <TableCell className="w-[18.5rem]">
                              {i.ContractHrs}
                            </TableCell>
                            <TableCell className="w-[18.5rem]">
                              {i.InternalHrs}
                            </TableCell>
                          </TableRow>
                        )
                      )
                    ) : (
                      <TableRow className="h-16">
                        <span className="flex items-center justify-start ml-16 pt-5">
                          No data found.
                        </span>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </td>
          </tr>
        </React.Fragment>
      );
    },
    elevation: 0,
    selectableRows: "none",
  };

  return clientFields.loaded ? (
    <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        columns={reportsClientCols}
        data={clientFields.data}
        title={undefined}
        options={{ ...options, tableBodyHeight: "73vh", ...optionsExpand }}
      />
      <TablePagination
        component="div"
        count={clientFields.dataCount}
        page={clientCurrentPage}
        onPageChange={handleChangePage}
        rowsPerPage={clientRowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </ThemeProvider>
  ) : (
    <ReportLoader />
  );
};

export default ClientReport;
