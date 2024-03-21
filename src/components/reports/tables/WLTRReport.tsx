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
  generateCommonBodyRenderNullCheck,
  generateInitialTimer,
} from "@/utils/datatable/CommonFunction";
import { generateCustomColumnSortFalse } from "@/utils/datatable/ColsGenerateFunctions";
import { options } from "@/utils/datatable/TableOptions";
import { ReportProps } from "@/utils/Types/reports";

interface FilteredData {
  PageNo: number;
  PageSize: number;
  GlobalSearch: string;
  SortColumn: string;
  IsDesc: boolean;
  IsDownload: boolean;
  StartDate: string | null;
  EndDate: string | null;
  Clients: number[] | [];
}

interface ClientProject {
  ProjectId: number;
  ProjectName: string;
  ClientId: number;
  TotalHours: string;
  ApprovedHours: string;
  RejectedHours: string;
  FTE: string | number;
}

interface Response {
  List:
    | {
        ClientId: number;
        ClientName: string;
        ContractHrs: string;
        TotalHours: string;
        ApprovedHours: string;
        RejectedHours: string;
        FTE: string | number;
        ClientProjectData: ClientProject[];
      }[]
    | [];
  TotalCount: number;
}

const WLTRReport = ({
  filteredData,
  searchValue,
  onHandleExport,
}: ReportProps) => {
  const [wltrFields, setWltrFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [wltrCurrentPage, setWltrCurrentPage] = useState<number>(0);
  const [wltrRowsPerPage, setWltrRowsPerPage] = useState<number>(10);

  const getData = async (arg1: FilteredData) => {
    setWltrFields({
      ...wltrFields,
      loaded: false,
    });

    const url = `${process.env.report_api_url}/report/wltr`;

    const successCallback = (
      ResponseData: Response,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        onHandleExport(ResponseData.List.length > 0);
        setWltrFields({
          ...wltrFields,
          loaded: true,
          data: ResponseData.List,
          dataCount: ResponseData.TotalCount,
        });
      } else {
        setWltrFields({ ...wltrFields, data: [], dataCount: 0, loaded: true });
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
        PageNo: newPage + 1,
        PageSize: wltrRowsPerPage,
      });
    } else {
      getData({
        ...wltr_InitialFilter,
        PageNo: newPage + 1,
        PageSize: wltrRowsPerPage,
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
        PageNo: 1,
        PageSize: Number(event.target.value),
      });
    } else {
      getData({
        ...wltr_InitialFilter,
        PageNo: 1,
        PageSize: Number(event.target.value),
      });
    }
  };

  useEffect(() => {
    if (filteredData !== null) {
      const timer = setTimeout(() => {
        getData({ ...filteredData, GlobalSearch: searchValue });
        setWltrCurrentPage(0);
        setWltrRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        getData({ ...wltr_InitialFilter, GlobalSearch: searchValue });
        setWltrCurrentPage(0);
        setWltrRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredData, searchValue]);

  const reportsWLTRColConfig = [
    {
      header: "ClientName",
      label: "Client Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      header: "ContractHrs",
      label: "Contracted Hours",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      header: "TotalHours",
      label: "Total Hours",
      bodyRenderer: generateInitialTimer,
    },
    {
      header: "ApprovedHours",
      label: "Approved Hours",
      bodyRenderer: generateInitialTimer,
    },
    {
      header: "RejectedHours",
      label: "Rejected Hours",
      bodyRenderer: generateInitialTimer,
    },
    {
      header: "FTE",
      label: "FTE",
      bodyRenderer: generateCommonBodyRenderNullCheck,
    },
  ];

  const reportsWLTRCols = reportsWLTRColConfig.map((col: any) =>
    generateCustomColumnSortFalse(col.header, col.label, col.bodyRenderer)
  );

  const optionsExpand = {
    expandableRows: true,
    renderExpandableRow: (rowData: null, rowMeta: any) => {
      return (
        <React.Fragment>
          <tr>
            <td colSpan={12}>
              <TableContainer component={Paper}>
                <Table style={{ minWidth: "650" }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell className="!pl-[4.5rem] font-semibold">
                        Project name
                      </TableCell>
                      <TableCell className="font-semibold">
                        Total hours
                      </TableCell>
                      <TableCell className="font-semibold">
                        Approved Hours
                      </TableCell>
                      <TableCell className="font-semibold">
                        Rejected Hours
                      </TableCell>
                      <TableCell className="font-semibold">FTE</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {wltrFields.data[rowMeta.rowIndex].ClientProjectData
                      .length > 0 ? (
                      wltrFields.data[rowMeta.rowIndex].ClientProjectData.map(
                        (i: ClientProject, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="!pl-[4.5rem] w-[20rem]">
                              {i.ProjectName === null ? (
                                "-"
                              ) : (
                                <a
                                  target="_blank"
                                  href={`${process.env.redirectURLWLTR}${i.ProjectId}`}
                                  className="text-[#0592C6] cursor-pointer"
                                >
                                  {i.ProjectName}
                                </a>
                              )}
                            </TableCell>
                            <TableCell className="w-[17.5rem]">
                              {i.TotalHours === null
                                ? "00:00:00"
                                : i.TotalHours}
                            </TableCell>
                            <TableCell className="w-[18.5rem]">
                              {i.ApprovedHours === null
                                ? "00:00:00"
                                : i.ApprovedHours}
                            </TableCell>
                            <TableCell className="w-[18.5rem]">
                              {i.RejectedHours === null
                                ? "00:00:00"
                                : i.RejectedHours}
                            </TableCell>
                            <TableCell className="w-[13.5rem]">
                              {i.FTE === null ? "-" : i.FTE}
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
