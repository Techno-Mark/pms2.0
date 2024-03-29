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
import { generateCustomColumn } from "@/utils/datatable/ColsGenerateFunctions";
import { AppliedFilterWorklogsPage } from "@/utils/Types/worklogsTypes";

interface Props {
  onDataFetch: (getData: () => void) => void;
  currentFilterData: AppliedFilterWorklogsPage | [];
  searchValue: string;
  onHandleExport: (arg1: boolean) => void;
  getTotalTime: (e: string | null) => void;
}

interface List {
  StartDate: string | null;
  EndDate: string | null;
  StartTime: string | null;
  EndTime: string | null;
  TotalTime: string | null;
  ClientId: number | null;
  ClientName: string | null;
  ProjectId: number | null;
  ProjectName: string | null;
  WorkItemId: number | null;
  TaskName: string | null;
  ProcessId: number | null;
  ProcessName: string | null;
  SubProcessId: number | null;
  SubProcessName: string | null;
}

interface Interface {
  PageNo: number;
  PageSize: number;
  GlobalSearch: string;
  IsDesc: boolean;
  SortColumn: string;
  ClientId: number | null;
  ProjectId: number | null;
  StartDate: string | null;
  EndDate: string | null;
  IsDownload: boolean;
}

const pageNo = 1;
const pageSize = 10;

const initialFilter = {
  PageNo: pageNo,
  PageSize: pageSize,
  GlobalSearch: "",
  IsDesc: true,
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
  getTotalTime,
}: Props) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [workItemData, setWorkItemData] = useState<List[] | []>([]);
  const [filteredObject, setFilteredOject] = useState<Interface>(initialFilter);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [tableDataCount, setTableDataCount] = useState(0);

  useEffect(() => {
    setFilteredOject({
      ...filteredObject,
      ...currentFilterData,
    });
  }, [currentFilterData]);

  useEffect(() => {
    if (searchValue.trim().length >= 0) {
      setFilteredOject({
        ...filteredObject,
        ...currentFilterData,
        GlobalSearch: searchValue,
        PageNo: pageNo,
        PageSize: pageSize,
      });
      setPage(0);
      setRowsPerPage(10);
    }
  }, [searchValue]);

  const getTimelineList = async () => {
    setLoaded(false);
    const params = filteredObject;
    const url = `${process.env.worklog_api_url}/workitem/timeline/getall`;
    const successCallback = (
      ResponseData: { List: List[]; TotalCount: number; TotalTime: string },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setLoaded(true);
        setWorkItemData(ResponseData.List);
        setTableDataCount(ResponseData.TotalCount);
        onHandleExport(ResponseData.List.length > 0 ? true : false);
        getTotalTime(ResponseData.TotalTime);
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
          customBodyRender: (value: number) => {
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

  const TimelineTaskColumns = columnConfig.map((col: any) => {
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
