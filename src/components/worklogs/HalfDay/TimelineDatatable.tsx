import React, { useEffect, useState } from "react";
import ReportLoader from "../../common/ReportLoader";
import {
  generateCommonBodyRender,
  generateCustomHeaderName,
  handleChangeRowsPerPageWithFilter,
  handlePageChangeWithFilter,
} from "@/utils/datatable/CommonFunction";
import { TablePagination, ThemeProvider } from "@mui/material";
import MUIDataTable from "mui-datatables";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { worklogs_Options } from "@/utils/datatable/TableOptions";
import { callAPI } from "@/utils/API/callAPI";
import { generateCustomColumn } from "@/utils/datatable/columns/ColsGenerateFunctions";

const pageNo = 1;
const pageSize = 10;

const initialFilter = {
  PageNo: pageNo,
  PageSize: pageSize,
  GlobalSearch: "",
  IsDesc: false,
  SortColumn: "",
  ClientId: null,
  ProjectId: null,
  StartDate: null,
  EndDate: null,
  IsDownload: false,
};

const TimelineDatatable = ({
  onDataFetch,
  currentFilterData,
  searchValue,
  onHandleExport,
  onChangeLoader,
}: any) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [workItemData, setWorkItemData] = useState<any | any[]>([]);
  const [filteredObject, setFilteredOject] = useState<any>(initialFilter);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [tableDataCount, setTableDataCount] = useState(0);

  useEffect(() => {
    setFilteredOject({
      ...filteredObject,
      ...currentFilterData,
      GlobalSearch: searchValue,
    });
  }, [currentFilterData, searchValue]);

  const getTimelineList = async () => {
    const params = filteredObject;
    const url = `${process.env.worklog_api_url}/workitem/timeline/getall`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setLoaded(true);
        setWorkItemData(ResponseData.List);
        setTableDataCount(ResponseData.TotalCount);
        onHandleExport(ResponseData.List.length > 0 ? true : false);
        onChangeLoader(ResponseData.TotalTime);
      } else {
        setLoaded(true);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const fetchData = async () => {
      await getTimelineList();
      onDataFetch(() => fetchData());
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [filteredObject]);

  useEffect(() => {
    onHandleExport(workItemData.length > 0 ? true : false);
  }, [workItemData]);

  const columnConfig = [
    {
      name: "WorkItemId",
      label: "Task ID",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "StartDate",
      label: "Start Date",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "EndDate",
      label: "End Date",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "StartTime",
      label: "Start Time",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "EndTime",
      label: "End Time",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "TotalTime",
      label: "Total Time",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ClientName",
      label: "Client",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ProjectName",
      label: "Project",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "TaskName",
      label: "Task",
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
  ];

  const generateConditionalColumn = (
    column: {
      name: string;
      label: string;
      bodyRenderer: (arg0: any) => any;
    },
    rowDataIndex: number
  ) => {
    if (column.label === "WorkitemId") {
      return {
        name: "WorkitemId",
        options: {
          filter: true,
          viewColumns: false,
          sort: false,
          customHeadLabelRender: () => generateCustomHeaderName("Task ID"),
          customBodyRender: (value: any, tableMeta: any) => {
            return generateCommonBodyRender(value);
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

  const TimelineTaskColumns: any = columnConfig.map((col: any) => {
    return generateConditionalColumn(col, 9);
  });

  return (
    <>
      {loaded ? (
        <ThemeProvider theme={getMuiTheme()}>
          <MUIDataTable
            data={workItemData}
            columns={TimelineTaskColumns}
            title={undefined}
            options={{
              ...worklogs_Options,
              selectableRows: "none",
              textLabels: {
                body: {
                  noMatch: (
                    <div className="flex items-start">
                      <span>Currently there is no record found.</span>
                    </div>
                  ),
                  toolTip: "",
                },
              },
            }}
            data-tableid="unassignee_Datatable"
          />
          <TablePagination
            component="div"
            count={tableDataCount}
            page={page}
            onPageChange={(
              event: React.MouseEvent<HTMLButtonElement> | null,
              newPage: number
            ) => {
              handlePageChangeWithFilter(newPage, setPage, setFilteredOject);
            }}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(
              event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => {
              handleChangeRowsPerPageWithFilter(
                event,
                setRowsPerPage,
                setPage,
                setFilteredOject
              );
            }}
          />
        </ThemeProvider>
      ) : (
        <ReportLoader />
      )}
    </>
  );
};

export default TimelineDatatable;
