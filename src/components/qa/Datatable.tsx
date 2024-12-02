import React, { useEffect, useState } from "react";
import OverLay from "../common/OverLay";
import ReportLoader from "../common/ReportLoader";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TablePagination,
  ThemeProvider,
} from "@mui/material";
import {
  generateCommonBodyRender,
  generateCustomFormatDate,
  generateCustomHeaderName,
  generatePriorityWithColor,
  generateStatusWithColor,
  handleChangeRowsPerPageWithFilter,
  handlePageChangeWithFilter,
} from "@/utils/datatable/CommonFunction";
import MUIDataTable from "mui-datatables";
import { ColorToolTip, getMuiTheme } from "@/utils/datatable/CommonStyle";
import { worklogs_Options } from "@/utils/datatable/TableOptions";
import { callAPI } from "@/utils/API/callAPI";
import {
  FilterQAPageTask,
  QAListTask,
  ResponseTask,
} from "@/utils/Types/qaTypes";
import { generateCustomColumn } from "@/utils/datatable/ColsGenerateFunctions";
import { toHoursAndMinutes } from "@/utils/timerFunctions";
import PlayButton from "@/assets/icons/worklogs/PlayButton";
import PlayPause from "@/assets/icons/worklogs/PlayPause";
import PauseButton from "@/assets/icons/worklogs/PauseButton";
import StopButton from "@/assets/icons/worklogs/StopButton";
import RestartButton from "@/assets/icons/worklogs/RestartButton";
import QAActionBar from "./actionBar/QAActionBar";

interface InitialFilter {
  PageNo: number;
  PageSize: number;
  SortColumn: string;
  IsDesc: boolean;
  GlobalSearch: string;
  ClientId: number | null;
  TypeOfWork: number | null;
  ProjectId: number | null;
  StatusId: number | null;
  DateFilter: string | null;
}

const pageNo = 1;
const pageSize = 10;

const initialFilter: InitialFilter = {
  PageNo: pageNo,
  PageSize: pageSize,
  SortColumn: "",
  IsDesc: true,
  GlobalSearch: "",
  ClientId: null,
  TypeOfWork: null,
  ProjectId: null,
  StatusId: null,
  DateFilter: null,
};

const Datatable = ({
  onEdit,
  onDrawerOpen,
  onDrawerClose,
  onDataFetch,
  onCurrentFilterId,
  currentFilterData,
  onHandleExport,
  searchValue,
  onErrorLog,
  onChangeLoader,
  onChangePreperorLoader,
}: any) => {
  const [isLoadingQADatatable, setIsLoadingQADatatable] = useState(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [selectedRowsCount, setSelectedRowsCount] = useState<number>(0);
  const [selectedRows, setSelectedRows] = useState<number[] | []>([]);
  const [qaItemData, setQaItemData] = useState<QAListTask[] | []>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<number[] | []>([]);
  const [selectedRowSubmissionIds, setSelectedRowSubmissionIds] = useState<
    number[] | []
  >([]);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [selectedRowSubmissionId, setSelectedRowSubmissionId] = useState<
    number | null
  >(null);
  const [filteredObject, setFilteredOject] =
    useState<InitialFilter>(initialFilter);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [tableDataCount, setTableDataCount] = useState(0);
  const [workitemId, setWorkitemId] = useState<number>(-1);
  const [submissionId, setSubmissionId] = useState<number>(-1);
  const [workitemTimeId, setWorkitemTimeId] = useState<any>(-1);
  const [stopTimerDialog, setStopTimerDialog] = useState<boolean>(false);

  const handleRowSelect = (
    currentRowsSelected: { index: number; dataIndex: number }[] | [],
    allRowsSelected: { index: number; dataIndex: number }[] | [],
    rowsSelected: number[] | []
  ) => {
    const selectedData: QAListTask[] | [] = allRowsSelected.map(
      (row: { index: number; dataIndex: number }) => qaItemData[row.dataIndex]
    );
    setSelectedRowsCount(rowsSelected?.length);

    setSelectedRows(rowsSelected);

    const selectedWorkItemIds =
      selectedData.length > 0
        ? selectedData.map((selectedRow: QAListTask) => selectedRow?.TaskId)
        : [];
    setSelectedRowIds(selectedWorkItemIds);

    const selectedSubmissionIds =
      selectedData.length > 0
        ? selectedData.map(
            (selectedRow: QAListTask) => selectedRow?.SubmissionId
          )
        : [];
    setSelectedRowSubmissionIds(selectedSubmissionIds);

    const lastSelectedWorkItemId =
      selectedData.length > 0
        ? selectedData[selectedData.length - 1]?.TaskId
        : null;
    setSelectedRowId(lastSelectedWorkItemId);

    const lastSelectedSubmissionId =
      selectedData.length > 0
        ? selectedData[selectedData.length - 1]?.SubmissionId
        : null;
    setSelectedRowSubmissionId(lastSelectedSubmissionId);
  };

  const handleClearSelection = () => {
    setSelectedRowsCount(0);
    setSelectedRows([]);
  };

  useEffect(() => {
    handleClearSelection();
  }, [onDrawerClose]);

  useEffect(() => {
    setWorkitemId(
      qaItemData.filter(
        (data: QAListTask) => data.TimelogId !== null && data.TimelogId > 0
      ).length > 0
        ? qaItemData.filter(
            (data: QAListTask) => data.TimelogId !== null && data.TimelogId > 0
          )[0].TaskId
        : -1
    );
    setSubmissionId(
      qaItemData.filter(
        (data: QAListTask) => data.TimelogId !== null && data.TimelogId > 0
      ).length > 0
        ? qaItemData.filter(
            (data: QAListTask) => data.TimelogId !== null && data.TimelogId > 0
          )[0].SubmissionId
        : -1
    );
    setWorkitemTimeId(
      qaItemData.filter(
        (data: QAListTask) => data.TimelogId !== null && data.TimelogId > 0
      ).length > 0
        ? qaItemData
            .map((data: any) =>
              typeof data.TimelogId !== null && data.TimelogId > 0
                ? data.TimelogId
                : false
            )
            .filter((j: number | boolean) => j !== false)[0]
        : -1
    );
  }, [qaItemData]);

  const handleTimer = async (
    state: number,
    selectedRowId: number,
    workitemTimeId: number,
    submissionId: number
  ) => {
    setIsLoadingQADatatable(true);
    const params = {
      timeId: workitemTimeId && workitemTimeId > 0 ? workitemTimeId : 0,
      workitemId: selectedRowId,
      state: state,
      submissionId: submissionId,
    };
    const url = `${process.env.worklog_api_url}/workitem/quality/saveworkitemqatimestamp`;
    const successCallback = (
      ResponseData: number,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setWorkitemTimeId((prev: number) =>
          ResponseData !== prev ? ResponseData : -1
        );
        setWorkitemId((prev) => (selectedRowId !== prev ? selectedRowId : -1));
        setSubmissionId((prev) => (submissionId !== prev ? submissionId : -1));
        getQaItemList();
        setIsLoadingQADatatable(false);
      } else {
        setIsLoadingQADatatable(false);
        getQaItemList();
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleSync = async (selectedRowId: number, IsDelete?: boolean) => {
    setIsLoadingQADatatable(true);
    const params = {
      workitemId: selectedRowId,
    };
    const url = `${process.env.worklog_api_url}/workitem/quality/getqaworkitemsync`;
    const successCallback = (
      ResponseData: { SyncTime: number },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        // if (ResponseData !== null) {
        // setQaItemData((prev: QAListTask[] | []) =>
        //   prev.map((data: QAListTask) => {
        //     if (data.TaskId === selectedRowId) {
        //       return {
        //         ...data,
        //         Timer: ResponseData?.SyncTime,
        //       };
        //     } else {
        //       return data;
        //     }
        //   })
        // );
        IsDelete && setStopTimerDialog(true);
        setIsLoadingQADatatable(false);
        // } else {
        //   IsDelete && setStopTimerDialog(false);
        //   IsDelete && handleTimer(3, -1, 0, -1);
        //   setWorkitemId(-1);
        //   setSubmissionId(-1);
        getQaItemList();
        //   setIsLoadingQADatatable(false);
        // }
      } else {
        getQaItemList();
        setIsLoadingQADatatable(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const getFilterList = async (filterId: number) => {
    if (filterId === 0) {
      setFilteredOject(initialFilter);
    } else {
      const params = {
        type: 22,
      };
      const url = `${process.env.worklog_api_url}/filter/getfilterlist`;
      const successCallback = (
        ResponseData: FilterQAPageTask[] | [],
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          const filteredData = ResponseData.filter(
            (filter: FilterQAPageTask) => filter.FilterId === filterId
          );

          if (filteredData.length > 0) {
            const appliedFilterData = filteredData[0].AppliedFilter;
            setFilteredOject({
              ...filteredObject,
              ClientId:
                appliedFilterData.ClientId === 0 ||
                appliedFilterData.ClientId === null
                  ? null
                  : appliedFilterData.ClientId,
              TypeOfWork:
                appliedFilterData.TypeOfWork === 0 ||
                appliedFilterData.TypeOfWork === null
                  ? null
                  : appliedFilterData.TypeOfWork,
              ProjectId:
                appliedFilterData.ProjectId === 0 ||
                appliedFilterData.ProjectId === null
                  ? null
                  : appliedFilterData.ProjectId,
              StatusId:
                appliedFilterData.StatusId === 0 ||
                appliedFilterData.StatusId === null
                  ? null
                  : appliedFilterData.StatusId,
              DateFilter:
                appliedFilterData.DateFilter === "" ||
                appliedFilterData.DateFilter === null
                  ? null
                  : appliedFilterData.DateFilter,
            });
          }
        }
      };
      callAPI(url, params, successCallback, "POST");
    }
  };

  const getQaItemList = async () => {
    setLoaded(false);
    const params = filteredObject;
    const url = `${process.env.worklog_api_url}/workitem/quality/getuserlist`;
    const successCallback = (
      ResponseData: ResponseTask,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        const totalTime = ResponseData.TotalTime || "00:00:00";
        onChangeLoader(totalTime);
        const reviewerTotalTime = ResponseData.PreparorTotalTime || "00:00:00";
        onChangePreperorLoader(reviewerTotalTime);
        onHandleExport(ResponseData.List.length > 0 ? true : false);
        setLoaded(true);
        setQaItemData(ResponseData.List);
        setTableDataCount(ResponseData.TotalCount);
      } else {
        setLoaded(true);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    getFilterList(onCurrentFilterId);
  }, [onCurrentFilterId]);

  useEffect(() => {
    if (searchValue.trim().length > 0) {
      setFilteredOject({
        ...filteredObject,
        ...currentFilterData,
        GlobalSearch: searchValue,
        PageNo: pageNo,
        PageSize: pageSize,
      });
      setPage(0);
      setRowsPerPage(pageSize);
    } else {
      setFilteredOject({
        ...filteredObject,
        ...currentFilterData,
        GlobalSearch: searchValue,
      });
    }
  }, [currentFilterData, searchValue]);

  useEffect(() => {
    const fetchData = async () => {
      await getQaItemList();
      onDataFetch(() => fetchData());
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [onCurrentFilterId, filteredObject, currentFilterData, searchValue]);

  useEffect(() => {
    onHandleExport(qaItemData.length > 0 ? true : false);
  }, [qaItemData]);

  const columnConfig = [
    {
      name: "TaskId",
      label: "Task ID",
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
    {
      name: "QATimer",
      label: "Timer",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "PriorityName",
      label: "Priority",
      bodyRenderer: generatePriorityWithColor,
    },
    {
      name: "QAStatucColorCode",
      options: {
        filter: false,
        sort: false,
        display: false,
        viewColumns: false,
      },
    },
    {
      name: "QAStatusName",
      label: "Status",
      bodyRenderer: (value: string, tableMeta: any) =>
        generateStatusWithColor(value, tableMeta.rowData[8]),
    },
    {
      name: "AssignedTo",
      label: "Assignee",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ReviewerName",
      label: "Reviewer",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "EstimateTime",
      label: "Est. Time",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "Quantity",
      label: "Qty.",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "StdTime",
      label: "Std. Time",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "PreparerTime",
      label: "Preparation Time",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ReviewerTime",
      label: "Reviewer Time",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "TotalTime",
      label: "Total Time",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "StartDate",
      label: "Start Date",
      bodyRenderer: generateCustomFormatDate,
    },
    {
      name: "EndDate",
      label: "End Date",
      bodyRenderer: generateCustomFormatDate,
    },
    {
      name: "Description",
      label: "Description",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "State",
      options: {
        display: false,
        viewColumns: false,
      },
    },
    {
      name: "SubmissionId",
      options: {
        display: false,
        viewColumns: false,
      },
    },
  ];

  const generateCustomeTaskIdwithErrorLogs = (
    bodyValue1: number,
    bodyValue2: number
  ) => {
    return (
      <div className="text-[#0592C6]">
        <span
          onClick={() => onEdit(bodyValue1, bodyValue2)}
          className="cursor-pointer"
        >
          {bodyValue1 === null ? "-" : bodyValue1}
        </span>
      </div>
    );
  };

  const generateConditionalColumn = (column: {
    name: string;
    label: string;
    bodyRenderer: (arg0: any) => any;
  }) => {
    if (column.name === "QATimer") {
      return {
        name: "QATimer",
        options: {
          filter: true,
          sort: true,
          viewColumns: false,
          customHeadLabelRender: () => generateCustomHeaderName("Timer"),
          customBodyRender: (value: number, tableMeta: any) => {
            return (
              <div className="w-40 h-7 flex items-center">
                <ColorToolTip
                  title={`Estimated Time: ${tableMeta.rowData[14]}`}
                  placement="top"
                  arrow
                >
                  <span
                    className={`w-16 text-center text-ellipsis overflow-hidden ${
                      tableMeta.rowData[tableMeta.rowData.length - 2] === 3
                        ? "text-secondary"
                        : ""
                    }`}
                  >
                    {value}
                  </span>
                </ColorToolTip>
                {tableMeta.rowData[tableMeta.rowData.length - 2] === 0 ? (
                  <ColorToolTip title="Start" placement="top" arrow>
                    <span
                      className="cursor-pointer"
                      onClick={() => {
                        handleTimer(
                          1,
                          tableMeta.rowData[0],
                          0,
                          tableMeta.rowData[tableMeta.rowData.length - 1]
                        );
                        handleClearSelection();
                      }}
                    >
                      <PlayButton />
                    </span>
                  </ColorToolTip>
                ) : (
                  tableMeta.rowData[tableMeta.rowData.length - 2] === 2 && (
                    <ColorToolTip title="Resume" placement="top" arrow>
                      <span
                        className="cursor-pointer"
                        onClick={() => {
                          handleTimer(
                            1,
                            tableMeta.rowData[0],
                            0,
                            tableMeta.rowData[tableMeta.rowData.length - 1]
                          );
                          handleClearSelection();
                        }}
                      >
                        <PlayPause />
                      </span>
                    </ColorToolTip>
                  )
                )}
                {tableMeta.rowData[tableMeta.rowData.length - 2] === 1 && (
                  <div className="flex">
                    <ColorToolTip title="Pause" placement="top" arrow>
                      <span
                        className="cursor-pointer"
                        onClick={() => {
                          handleTimer(
                            2,
                            tableMeta.rowData[0],
                            workitemTimeId,
                            tableMeta.rowData[tableMeta.rowData.length - 1]
                          );
                          handleClearSelection();
                        }}
                      >
                        <PauseButton />
                      </span>
                    </ColorToolTip>
                    <ColorToolTip title="Stop" placement="top" arrow>
                      <span
                        className="cursor-pointer mt-[2px]"
                        onClick={() => {
                          handleSync(
                            tableMeta.rowData[tableMeta.rowData.length - 1],
                            true
                          );
                          setWorkitemId(tableMeta.rowData[0]);
                          setSubmissionId(
                            tableMeta.rowData[tableMeta.rowData.length - 1]
                          );
                          handleClearSelection();
                        }}
                      >
                        <StopButton />
                      </span>
                    </ColorToolTip>
                    <ColorToolTip title="Sync" placement="top" arrow>
                      <span
                        className="cursor-pointer"
                        onClick={() => {
                          handleSync(
                            tableMeta.rowData[tableMeta.rowData.length - 1]
                          );
                          handleClearSelection();
                        }}
                      >
                        <RestartButton />
                      </span>
                    </ColorToolTip>
                  </div>
                )}
              </div>
            );
          },
        },
      };
    } else if (column.label === "Task ID") {
      return {
        name: "TaskId",
        options: {
          filter: true,
          viewColumns: false,
          sort: true,
          customHeadLabelRender: () => generateCustomHeaderName("Task ID"),
          customBodyRender: (value: number, tableMeta: any) => {
            return generateCustomeTaskIdwithErrorLogs(
              value,
              tableMeta.rowData[tableMeta.rowData.length - 1]
            );
          },
        },
      };
    } else if (column.name === "QAStatucColorCode") {
      return {
        name: "QAStatucColorCode",
        options: {
          filter: false,
          sort: false,
          display: false,
          viewColumns: false,
        },
      };
    } else if (column.name === "QAStatusName") {
      return {
        name: "QAStatusName",
        options: {
          filter: true,
          sort: true,
          viewColumns: false,
          customHeadLabelRender: () => generateCustomHeaderName("Status"),
          customBodyRender: (value: string, tableMeta: any) => {
            const statusColorCode = tableMeta.rowData[8];

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
    } else if (column.name === "SubmissionId") {
      return {
        name: "SubmissionId",
        options: {
          display: false,
          viewColumns: false,
        },
      };
    } else if (column.name === "State") {
      return {
        name: "State",
        options: {
          display: false,
          viewColumns: false,
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

  const qaColumns = columnConfig.map((col: any) => {
    return generateConditionalColumn(col);
  });

  const propsForActionBar = {
    selectedRowsCount,
    selectedRows,
    selectedRowIds,
    selectedRowSubmissionIds,
    selectedRowId,
    selectedRowSubmissionId,
    onEdit,
    getQaItemList,
    onErrorLog,
    handleClearSelection,
  };

  return (
    <div>
      {loaded ? (
        <ThemeProvider theme={getMuiTheme()}>
          <MUIDataTable
            data={qaItemData}
            columns={qaColumns}
            title={undefined}
            options={{
              ...worklogs_Options,
              tableBodyHeight: "73vh",
              //   viewColumns: true,
              selectAllRows: selectedRowsCount === 0,
              rowsSelected: selectedRows,
              textLabels: {
                body: {
                  noMatch: (
                    <div className="flex items-start">
                      <span>Currently there is no record.</span>
                    </div>
                  ),
                  toolTip: "",
                },
              },
              onRowSelectionChange: (
                currentRowsSelected:
                  | { index: number; dataIndex: number }[]
                  | [],
                allRowsSelected: { index: number; dataIndex: number }[] | [],
                rowsSelected: number[] | []
              ) =>
                handleRowSelect(
                  currentRowsSelected,
                  allRowsSelected,
                  rowsSelected
                ),
            }}
            data-tableid="Datatable"
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
              handleClearSelection();
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
              handleClearSelection();
            }}
          />
        </ThemeProvider>
      ) : (
        <ReportLoader />
      )}

      {/* Timer Stop Dialog */}
      <Dialog open={stopTimerDialog}>
        <DialogTitle sx={{ fontSize: 18, paddingRight: 16, paddingBottom: 1 }}>
          Stop task
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <div className="w-full flex items-center justify-between border-t border-gray-500 py-2 mb-5 mr-8">
              Are you sure you want to stop task?
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="error"
            variant="outlined"
            onClick={() => {
              setStopTimerDialog(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            className="!bg-secondary"
            autoFocus
            onClick={() => {
              setStopTimerDialog(false);
              handleTimer(3, workitemId, workitemTimeId, submissionId);
            }}
          >
            Yes, Stop
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Bar */}
      <QAActionBar
        {...propsForActionBar}
        getOverLay={(e: boolean) => setIsLoadingQADatatable(e)}
      />
      {isLoadingQADatatable ? <OverLay /> : ""}
    </div>
  );
};

export default Datatable;
