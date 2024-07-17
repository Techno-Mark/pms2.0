import React, { useEffect, useState } from "react";
import ReportLoader from "../../common/ReportLoader";
import {
  generateCommonBodyRender,
  generateCustomHeaderName,
  handleChangeRowsPerPageWithFilter,
  handlePageChangeWithFilter,
} from "@/utils/datatable/CommonFunction";
import { Popover, TablePagination, ThemeProvider } from "@mui/material";
import MUIDataTable from "mui-datatables";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { worklogs_Options } from "@/utils/datatable/TableOptions";
import { callAPI } from "@/utils/API/callAPI";
import { generateCustomColumn } from "@/utils/datatable/ColsGenerateFunctions";
import { AppliedFilterHalfDayPage } from "@/utils/Types/worklogsTypes";
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import CloseIcon from "@/assets/icons/reports/CloseIcon";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { options } from "@/utils/datatable/TableOptions";

interface Props {
  onDataFetch: (getData: () => void) => void;
  currentFilterData: AppliedFilterHalfDayPage;
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
  ReceivedFrom: string | null;
  ReceivedTo: string | null;
  IsDownload: boolean;
}

interface InsideList {
  WorkitemId: number;
  TaskName: string;
  StartDate: string;
  EndDate: string;
  StartTime: string;
  EndTime: string;
  TotalTime: string;
  IsManual: boolean;
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
  ReceivedFrom: null,
  ReceivedTo: null,
  IsDownload: false,
};

const TimelineDatatable = ({
  onDataFetch,
  currentFilterData,
  searchValue,
  onHandleExport,
  getTotalTime,
}: Props) => {
  const workloadAnchorElFilter: HTMLButtonElement | null = null;
  const openWorkloadFilter = Boolean(workloadAnchorElFilter);
  const workloadIdFilter = openWorkloadFilter ? "simple-popover" : undefined;
  const [loaded, setLoaded] = useState<boolean>(false);
  const [workItemData, setWorkItemData] = useState<List[] | []>([]);
  const [filteredObject, setFilteredOject] = useState<Interface>(initialFilter);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [tableDataCount, setTableDataCount] = useState(0);
  const [loadingInside, setLoadingInside] = useState<boolean>(false);
  const [isWorkloadExpanded, setIsWorkloadExpanded] = useState<boolean>(false);
  const [clickedWorkloadRowId, setClickedWorkloadRowId] = useState<number>(-1);
  const [listInsideData, setListInsideData] = useState<InsideList[]>([]);

  const getListInside = async () => {
    setLoadingInside(false);
    const params = {
      WorkItemId: clickedWorkloadRowId,
      StartDate:
        currentFilterData?.StartDate !== undefined
          ? currentFilterData.StartDate
          : null,
      EndDate:
        currentFilterData?.EndDate !== undefined
          ? currentFilterData.EndDate
          : null,
    };

    const url = `${process.env.worklog_api_url}/workitem/timeline/gettimelinebreakdown`;
    const successCallback = (
      ResponseData: InsideList[] | [],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        setLoadingInside(true);
        setListInsideData(ResponseData);
      } else {
        setLoadingInside(true);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const fetchData = async () => {
      await getListInside();
    };
    isWorkloadExpanded && fetchData();
  }, [isWorkloadExpanded, currentFilterData]);

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
      label: "",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "WorkItemId",
      label: "Task ID",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "StartDate",
      label: "Received Date",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "EndDate",
      label: "Due Date",
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
    } else if (column.label === "") {
      return {
        name: "WorkItemId",
        options: {
          filter: true,
          viewColumns: false,
          sort: true,
          customHeadLabelRender: () => generateCustomHeaderName(""),
          customBodyRender: (value: number) => {
            return (
              <span
                className="flex flex-col cursor-pointer"
                onClick={() => {
                  setIsWorkloadExpanded(true);
                  setClickedWorkloadRowId(value);
                }}
              >
                <ArrowDropDownIcon />
              </span>
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

  const TimelineTaskColumns = columnConfig.map((col: any) => {
    return generateConditionalColumn(col, 9);
  });

  const generateAutoManualBodyRender = (value: boolean) => {
    return <div className="ml-2">{value ? "Manual" : "Auto"}</div>;
  };

  const expandableColumns: any[] = [
    {
      name: "StartDate",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Start Date"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "EndDate",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("End Date"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "StartTime",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Start Time"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "EndTime",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("End Time"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "TotalTime",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Total Time"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "IsManual",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Manual / Auto"),
        customBodyRender: (value: boolean) => {
          return generateAutoManualBodyRender(value);
        },
      },
    },
  ];

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

          {loadingInside ? (
            <Popover
              id={workloadIdFilter}
              open={isWorkloadExpanded}
              anchorEl={workloadAnchorElFilter}
              TransitionComponent={DialogTransition}
              onClose={() => {
                setIsWorkloadExpanded(false);
                setClickedWorkloadRowId(-1);
                setListInsideData([]);
                setLoadingInside(false);
              }}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
            >
              <div className="px-5 w-full flex items-center justify-between">
                <div className="my-5 flex items-center">
                  <div className="mr-[10px]">
                    <label className="text-sm font-normal font-proxima text-slatyGrey capitalize mr-[5px]">
                      Task Name:
                    </label>
                    <label className="text-sm font-bold font-proxima capitalize">
                      {listInsideData[0]?.TaskName.length > 0
                        ? listInsideData[0]?.TaskName
                        : "-"}
                    </label>
                  </div>
                </div>
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setIsWorkloadExpanded(false);
                    setClickedWorkloadRowId(-1);
                    setListInsideData([]);
                    setLoadingInside(false);
                  }}
                >
                  <CloseIcon />
                </div>
              </div>
              <MUIDataTable
                title={undefined}
                columns={expandableColumns}
                data={listInsideData}
                options={{ ...options, tableBodyHeight: "450px" }}
              />
            </Popover>
          ) : (
            <ReportLoader />
          )}
        </ThemeProvider>
      ) : (
        <ReportLoader />
      )}
    </>
  );
};

export default TimelineDatatable;
