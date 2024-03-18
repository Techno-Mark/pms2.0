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
import { generateCustomColumnSortFalse } from "@/utils/datatable/ColsGenerateFunctions";
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

    const url = `${process.env.report_api_url}/report/client`;

    const successCallback = (data: any, error: any) => {
      if (data !== null && error === false) {
        onHandleExport(data.List.length > 0);
        setClientFields({
          ...clientFields,
          loaded: true,
          data: data.List,
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
        pageSize: event.target.value,
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
        setClientCurrentPage(0);
        setClientRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredData, searchValue]);

  const reportsClientColConfig = [
    {
      header: "ClientName",
      label: "Client Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      header: "DepartmentName",
      label: "Department",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      header: "InternalHrs",
      label: "Total Internal Hours",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      header: "ContractHrs",
      label: "Total Contracted Hours",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      header: "STDTime",
      label: "STD Time",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      header: "EditHours",
      label: "Edited Time",
      bodyRenderer: generateInitialTimer,
    },
    {
      header: "TotalTime",
      label: "Total Time",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      header: "DifferenceTime",
      label: "Difference",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      header: "contracteddiff",
      label: "Contracted Difference",
      bodyRenderer: generateCommonBodyRender,
    },
  ];

  const reportsClientCols: any = reportsClientColConfig.map((col: any) =>
    generateCustomColumnSortFalse(col.header, col.label, col.bodyRenderer)
  );

  const optionsExpand: any = {
    expandableRows: true,
    renderExpandableRow: (rowData: any, rowMeta: any) => {
      return (
        <React.Fragment>
          <tr>
            <td colSpan={12}>
              <TableContainer component={Paper} className="whitespace-nowrap">
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
                        Internal Hours
                      </TableCell>
                      <TableCell className="font-semibold">
                        Contracted Hours
                      </TableCell>
                      <TableCell className="font-semibold">STD Time</TableCell>
                      <TableCell className="font-semibold">
                        Edited Time
                      </TableCell>
                      <TableCell className="font-semibold">
                        Total Time
                      </TableCell>
                      <TableCell className="font-semibold">
                        Difference
                      </TableCell>
                      <TableCell className="font-semibold">
                        Contracted Difference
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clientFields.data[rowMeta.rowIndex].ClientWorkTypeData
                      .length > 0 ? (
                      clientFields.data[
                        rowMeta.rowIndex
                      ].ClientWorkTypeData.map((i: any, index: any) => (
                        <TableRow key={index}>
                          <TableCell className="!pl-[4.5rem] w-[15rem]">
                            {i.WorkTypeName}
                          </TableCell>
                          <TableCell className="w-[17.5rem]">
                            {i.BillingTypeName}
                          </TableCell>
                          <TableCell className="w-[18.5rem]">
                            {i.InternalHrs}
                          </TableCell>
                          <TableCell className="w-[18.5rem]">
                            {i.ContractHrs}
                          </TableCell>
                          <TableCell className="w-[18.5rem]">
                            {i.STDTime}
                          </TableCell>
                          <TableCell className="w-[18.5rem]">
                            {i.EditHours}
                          </TableCell>
                          <TableCell className="w-[18.5rem]">
                            {i.TotalTime}
                          </TableCell>
                          <TableCell className="w-[18.5rem]">
                            {i.DifferenceTime}
                          </TableCell>
                          <TableCell className="w-[18.5rem]">
                            {i.contracteddiff}
                          </TableCell>
                        </TableRow>
                      ))
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
