import React, { useEffect, useState } from "react";
import { FieldsType } from "../types/FieldsType";
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
import ReportLoader from "@/components/common/ReportLoader";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import MUIDataTable from "mui-datatables";
import { callAPI } from "@/utils/API/callAPI";
import { wltr_InitialFilter } from "@/utils/reports/getFilters";
import {
  generateCommonBodyRender,
  generateInitialTimer,
} from "@/utils/datatable/CommonFunction";
import { generateCustomColumn } from "@/utils/datatable/columns/ColsGenerateFunctions";
import { options } from "@/utils/datatable/TableOptions";

const WLTRReport = ({ filteredData, searchValue, onHandleExport }: any) => {
  const [wltrFields, setWltrFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [wltrCurrentPage, setWltrCurrentPage] = useState<number>(0);
  const [wltrRowsPerPage, setWltrRowsPerPage] = useState<number>(10);

  const getData = async (arg1: any) => {
    setWltrFields({
      ...wltrFields,
      loaded: false,
    });

    const url = `${process.env.report_api_url}/report/project`;

    const successCallback = (data: any, error: any) => {
      if (data !== null && error === false) {
        onHandleExport(data.List.length > 0);
        setWltrFields({
          ...wltrFields,
          loaded: true,
          // data: data.List,
          data: [],
          dataCount: data.TotalCount,
        });
      } else {
        setWltrFields({ ...wltrFields, loaded: true });
      }
    };

    callAPI(url, arg1, successCallback, "post");
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setWltrCurrentPage(newPage);
    if (filteredData !== null) {
      getData({
        ...filteredData,
        pageNo: newPage + 1,
        pageSize: wltrRowsPerPage,
      });
    } else {
      getData({
        ...wltr_InitialFilter,
        pageNo: newPage + 1,
        pageSize: wltrRowsPerPage,
      });
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setWltrCurrentPage(0);
    setWltrRowsPerPage(parseInt(event.target.value));

    if (filteredData !== null) {
      getData({
        ...filteredData,
        pageNo: 1,
        pageSize: wltrRowsPerPage,
      });
    } else {
      getData({
        ...wltr_InitialFilter,
        pageNo: 1,
        pageSize: event.target.value,
      });
    }
  };

  useEffect(() => {
    if (filteredData !== null) {
      const timer = setTimeout(() => {
        getData({ ...filteredData, globalSearch: searchValue });
        setWltrCurrentPage(0);
        setWltrRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        getData({ ...wltr_InitialFilter, globalSearch: searchValue });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredData, searchValue]);

  const reportsWLTRColConfig = [
    {
      header: "Clientname",
      label: "Client Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      header: "ContractedHours",
      label: "Contracted Hours",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      header: "TotalHours",
      label: "Total Hours",
      bodyRenderer: generateInitialTimer,
    },
    {
      header: "STDTime",
      label: "STD Time",
      bodyRenderer: generateInitialTimer,
    },
    {
      header: "ApprovedHours",
      label: "Approved Hours",
      bodyRenderer: generateInitialTimer,
    },
    {
      header: "FTE",
      label: "FTE",
      bodyRenderer: generateInitialTimer,
    },
    {
      header: "TotalTime",
      label: "Total Time",
      bodyRenderer: generateInitialTimer,
    },
  ];

  const reportsWLTRCols: any = reportsWLTRColConfig.map((col: any) =>
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
                    {wltrFields.data[rowMeta.rowIndex].WorkTypes.length > 0 ? (
                      wltrFields.data[rowMeta.rowIndex].WorkTypes.map(
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

  return wltrFields.loaded ? (
    <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        columns={reportsWLTRCols}
        data={wltrFields.data}
        title={undefined}
        options={{ ...options, ...optionsExpand }}
      />
      <TablePagination
        component="div"
        count={wltrFields.dataCount}
        page={wltrCurrentPage}
        onPageChange={handleChangePage}
        rowsPerPage={wltrRowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </ThemeProvider>
  ) : (
    <ReportLoader />
  );
};

export default WLTRReport;
