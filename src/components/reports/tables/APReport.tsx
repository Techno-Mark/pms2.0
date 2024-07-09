import React, { useEffect, useState } from "react";
import { FieldsType } from "../types/FieldsType";
import ReportLoader from "@/components/common/ReportLoader";
import { TablePagination, ThemeProvider } from "@mui/material";
import MUIDataTable from "mui-datatables";
import { options } from "@/utils/datatable/TableOptions";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { ap_InitialFilter } from "@/utils/reports/getFilters";
import { callAPI } from "@/utils/API/callAPI";
import { ReportProps } from "@/utils/Types/reports";
import {
  generateCommonBodyRender,
  generateCommonBodyRenderPercentage,
  generateCustomHeaderName,
  generateDateWithoutTime,
  generateInitialTimer,
  generateStatusWithColor,
} from "@/utils/datatable/CommonFunction";
import { generateCustomColumn } from "@/utils/datatable/ColsGenerateFunctions";

interface FilteredData {
  PageNo: number;
  PageSize: number;
  sortColumn: string;
  IsDesc: boolean;
  GlobalSearch: string;
  StartDate: string | null;
  EndDate: string | null;
  Users: number[] | null;
  Clients: number[] | null;
  ReportingManagers: number[] | null;
  DepartmentIds: number[] | null;
  IsDownload: boolean;
}

interface Response {
  ActualPlannedReportFilters: any | null;
  List:
    | {
        ClientName: string;
        ProjectName: string | null;
        TaskDate: string;
        WorkItemId: number;
        TaskName: string;
        Description: string | null;
        ProcessId: number | null;
        ProcessName: string | null;
        SubProcessId: number | null;
        SubProcessName: string | null;
        AssignedToId: number | null;
        AssignedTo: string | null;
        ReportingToId: number | null;
        ReportingTo: string | null;
        TaskManagerId: number | null;
        TaskManager: string | null;
        Quantity: string | null;
        StdTime: string | null;
        Comment: string | null;
        TotalTime: string | null;
        AutoTime: string | null;
        ManualTime: string | null;
        Difference: number | null;
        DepartmentId: number | null;
        DepartmentName: string | null;
        PreparorTotalTime: string | null;
        PreparorAutoTime: string | null;
        PreparorManualTime: string | null;
        ReviewerTotalTime: string | null;
        ReviewerAutoTime: string | null;
        ReviewerManualTime: string | null;
        ReviewerStatusId: number | null;
        ReviewerStatusName: string | null;
        ReviewerStatusColorCode: string | null;
      }[]
    | [];
  TotalCount: number;
}

const APReport = ({
  filteredData,
  searchValue,
  onHandleExport,
}: ReportProps) => {
  const [apFields, setApFields] = useState<FieldsType>({
    loaded: false,
    data: [],
    dataCount: 0,
  });
  const [apCurrentPage, setApCurrentPage] = useState<number>(0);
  const [apRowsPerPage, setApRowsPerPage] = useState<number>(10);

  const getData = async (arg1: FilteredData) => {
    setApFields({
      ...apFields,
      loaded: false,
    });

    const url = `${process.env.report_api_url}/report/actualplanned`;

    const successCallback = (
      ResponseData: Response,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        onHandleExport(ResponseData.List.length > 0);
        setApFields({
          ...apFields,
          loaded: true,
          data: ResponseData.List,
          dataCount: ResponseData.TotalCount,
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
        GlobalSearch: searchValue,
        PageNo: newPage + 1,
        PageSize: apRowsPerPage,
      });
    } else {
      getData({
        ...ap_InitialFilter,
        GlobalSearch: searchValue,
        PageNo: newPage + 1,
        PageSize: apRowsPerPage,
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
        GlobalSearch: searchValue,
        PageNo: 1,
        PageSize: Number(event.target.value),
      });
    } else {
      getData({
        ...ap_InitialFilter,
        GlobalSearch: searchValue,
        PageNo: 1,
        PageSize: Number(event.target.value),
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
        setApCurrentPage(0);
        setApRowsPerPage(10);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredData, searchValue]);

  const reportsAPColConfig = [
    {
      name: "WorkItemId",
      label: "Task ID",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ClientName",
      label: "Client Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ProjectName",
      label: "Project Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ProcessName",
      label: "Process",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "SubProcessName",
      label: "Sub-Process",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ReviewerStatusName",
      label: "Reviewer Status",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "DepartmentName",
      label: "Department",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "TaskDate",
      label: "Created On",
      bodyRenderer: generateDateWithoutTime,
    },
    {
      name: "Description",
      label: "Description",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "AssignedTo",
      label: "Assign To",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ReportingTo",
      label: "Reporting To",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "Quantity",
      label: "QTY",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "StdTime",
      label: "STD Time",
      bodyRenderer: generateInitialTimer,
    },
    {
      name: "PreparorAutoTime",
      label: "Preparor Auto Time",
      bodyRenderer: generateInitialTimer,
    },
    {
      name: "PreparorManualTime",
      label: "Preparor Manual Time",
      bodyRenderer: generateInitialTimer,
    },
    {
      name: "PreparorTotalTime",
      label: "Preparor Total Time",
      bodyRenderer: generateInitialTimer,
    },
    {
      name: "ReviewerAutoTime",
      label: "Reviewer Auto Time",
      bodyRenderer: generateInitialTimer,
    },
    {
      name: "ReviewerManualTime",
      label: "Reviewer Manual Time",
      bodyRenderer: generateInitialTimer,
    },
    {
      name: "ReviewerTotalTime",
      label: "Reviewer Total Time",
      bodyRenderer: generateInitialTimer,
    },
    {
      name: "TotalTime",
      label: "Total Time",
      bodyRenderer: generateInitialTimer,
    },
    {
      name: "Difference",
      label: "Difference (%)",
      bodyRenderer: generateCommonBodyRenderPercentage,
    },
    {
      name: "Comment",
      label: "Reviewer's Note",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ReviewerStatusColorCode",
      options: {
        filter: false,
        sort: false,
        display: false,
        viewColumns: false,
      },
    },
  ];

  const generateConditionalColumn = (column: {
    name: string;
    label: string;
    bodyRenderer: (arg0: any) => any;
  }) => {
    if (column.name === "ReviewerStatusColorCode") {
      return {
        name: "ReviewerStatusColorCode",
        options: {
          display: false,
          viewColumns: false,
        },
      };
    } else if (column.name === "ReviewerStatusName") {
      return {
        name: "ReviewerStatusName",
        options: {
          filter: true,
          sort: true,
          viewColumns: false,
          customHeadLabelRender: () =>
            generateCustomHeaderName("Reviewer Status"),
          customBodyRender: (value: string, tableMeta: any) => {
            const statusColorCode =
              tableMeta.rowData[tableMeta.rowData.length - 1];

            return (
              <div>
                {value === null || value === "" || value === "0" ? (
                  "-"
                ) : (
                  <div className="inline-block mr-1">
                    <div
                      className="w-[10px] h-[10px] rounded-full inline-block mr-2"
                      style={{ backgroundColor: statusColorCode }}
                    ></div>
                    {value}
                  </div>
                )}
              </div>
            );
          },
        },
      };
    } else {
      return generateCustomColumn(
        column.name,
        column.label,
        column.bodyRenderer
      );
    }
  };

  const reportsAPCols = reportsAPColConfig.map((col: any) =>
    generateConditionalColumn(col)
  );

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
