import React, { useEffect, useState } from "react";
import MUIDataTable from "mui-datatables";
import { ThemeProvider } from "@mui/material/styles";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import TablePagination from "@mui/material/TablePagination";
import PlayButton from "@/assets/icons/worklogs/PlayButton";
import { toHoursAndMinutes } from "@/utils/timerFunctions";
import PlayPause from "@/assets/icons/worklogs/PlayPause";
import PauseButton from "@/assets/icons/worklogs/PauseButton";
import StopButton from "@/assets/icons/worklogs/StopButton";
import RestartButton from "@/assets/icons/worklogs/RestartButton";
import ClockIcon from "@/assets/icons/ClockIcon";
import {
  generateCustomHeaderName,
  generateCommonBodyRender,
  generateCustomFormatDate,
  generatePriorityWithColor,
  generateStatusWithColor,
  generateParentProcessBodyRender,
  handlePageChangeWithFilter,
  handleChangeRowsPerPageWithFilter,
} from "@/utils/datatable/CommonFunction";
import { approvals_Dt_Options } from "@/utils/datatable/TableOptions";
import { ColorToolTip, getMuiTheme } from "@/utils/datatable/CommonStyle";
import ApprovalsActionBar from "./actionBar/ApprovalsActionBar";
import { generateCustomColumn } from "@/utils/datatable/columns/ColsGenerateFunctions";
import ReportLoader from "../common/ReportLoader";
import OverLay from "../common/OverLay";
import { callAPI } from "@/utils/API/callAPI";

const pageNo = 1;
const pageSize = 10;

const initialFilter = {
  PageNo: pageNo,
  PageSize: pageSize,
  sortColumn: "",
  isDesc: true,
  globalSearch: "",
  userId: null,
  ClientId: null,
  projectId: null,
  startDate: null,
  endDate: null,
  dueDate: null,
  StatusId: null,
  ProcessId: null,
};

const Datatable = ({
  activeTab,
  onEdit,
  onDataFetch,
  currentFilterData,
  onFilterOpen,
  onCloseDrawer,
  onComment,
  onErrorLog,
  onManualTime,
  onHandleExport,
  searchValue,
  onChangeLoader,
}: any) => {
  const [isLoadingApprovalsDatatable, setIsLoadingApprovalsDatatable] =
    useState(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [selectedRowsCount, setSelectedRowsCount] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const [selectedWorkItemIds, setSelectedWorkItemIds] = useState<
    number[] | any
  >([]);
  const [workitemId, setWorkitemId] = useState(0);
  const [id, setId] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [tableDataCount, setTableDataCount] = useState(0);
  const [isRunning, setRunning] = useState<number>(-1);
  const [workitemTimeId, setWorkitemTimeId] = useState<number>(-1);
  const [submissionId, setSubmissionId] = useState<number>(-1);
  const [stopReviewTimer, setStopReviewTimer] = useState<boolean>(false);
  const [filteredObject, setFilteredOject] = useState<any>(initialFilter);
  const [reviewList, setReviewList] = useState<any>([]);
  const [selectedRowStatusId, setSelectedRowStatusId] = useState<
    any | number[]
  >([]);
  const [selectedRowClientId, setSelectedRowClientId] = useState<
    any | number[]
  >([]);
  const [selectedRowWorkTypeId, setSelectedRowWorkTypeId] = useState<
    any | number[]
  >([]);

  const getInitialPagePerRows = () => {
    setRowsPerPage(10);
  };

  useEffect(() => {
    onHandleExport(reviewList.length > 0 ? true : false);
  }, [reviewList]);

  useEffect(() => {
    if (onCloseDrawer === false || !onCloseDrawer) {
      handleClearSelection();
    }
  }, [onCloseDrawer]);

  const getReviewList = () => {
    setLoaded(true);
    const params = {
      ...filteredObject,
      dueDate: activeTab === 1 ? null : filteredObject.dueDate,
      startDate: activeTab === 1 ? null : filteredObject.startDate,
      endDate: activeTab === 1 ? null : filteredObject.endDate,
    };
    const url = `${process.env.worklog_api_url}/workitem/approval/${
      activeTab === 1 ? "GetReviewList" : "GetAllWorkitemForReviewer"
    }
    `;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        onChangeLoader(ResponseData.TotalTime);
        onHandleExport(ResponseData.List > 0 ? true : false);
        setLoaded(true);
        setReviewList(ResponseData.List);
        setTableDataCount(ResponseData.TotalCount);
      } else {
        setLoaded(true);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleRowSelect = (
    currentRowsSelected: any,
    allRowsSelected: any,
    rowsSelected: any
  ) => {
    const selectedData = allRowsSelected.map(
      (row: any) => reviewList[row.dataIndex]
    );

    setSelectedRowsCount(rowsSelected.length);
    setSelectedRows(rowsSelected);

    // adding all selected Ids in an array
    const selectedWorkItemIds: any =
      selectedData.length > 0
        ? selectedData.map((selectedRow: any) => selectedRow?.WorkitemId)
        : [];

    setSelectedWorkItemIds(selectedWorkItemIds);

    // adding selected workItem Id
    const workitem =
      selectedData.length > 0
        ? selectedData[selectedData.length - 1]?.WorkitemId
        : null;
    setWorkitemId(workitem);

    // adding selected workItem Id
    const Id =
      selectedData.length > 0
        ? selectedData[selectedData.length - 1]?.SubmissionId
        : null;
    setId(Id);

    // adding all selected Ids in an array
    const selectedSubmissionIds =
      selectedData.length > 0
        ? selectedData?.map((selectedRow: any) => selectedRow?.SubmissionId)
        : [];

    setSelectedRowIds(selectedSubmissionIds);

    // adding all selected row's Client Ids in an array
    const selectedWorkItemClientIds =
      selectedData.length > 0
        ? selectedData?.map((selectedRow: any) => selectedRow?.ClientId)
        : [];

    setSelectedRowClientId(selectedWorkItemClientIds);

    // adding all selected row's WorkType Ids in an array
    const selectedWorkItemWorkTypeIds =
      selectedData.length > 0
        ? selectedData?.map((selectedRow: any) => selectedRow?.WorkTypeId)
        : [];

    setSelectedRowWorkTypeId(selectedWorkItemWorkTypeIds);

    // adding all selected row's status Ids in an array
    const selectedWorkItemStatusIds =
      selectedData.length > 0
        ? selectedData?.map((selectedRow: any) => selectedRow?.StatusId)
        : [];

    setSelectedRowStatusId(selectedWorkItemStatusIds);

    if (allRowsSelected) {
      setIsPopupOpen(true);
    } else {
      setIsPopupOpen(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedRowsCount(0);
    setSelectedRows([]);
    setIsPopupOpen(false);
  };

  useEffect(() => {
    handleClearSelection();
    setPage(0);
    setRowsPerPage(10);
  }, [activeTab]);

  useEffect(() => {
    if (onFilterOpen || onFilterOpen === true) {
      handleClearSelection();
    }
  }, [onFilterOpen]);

  const settingSelectedId = () => {
    onEdit(workitemId, id);
    onErrorLog(true, workitemId);
    handleClearSelection();
  };

  const handleReviewerManualTime = (id1: any, id2: any) => {
    onEdit(id1, id2, 2);
    onManualTime(true, id1);
    handleClearSelection();
  };

  function formatTime(seconds: any) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  const handleReviewTimer = async (
    state: number,
    workitemId: number,
    submissionId: number,
    workitemTimeId?: number
  ) => {
    setIsLoadingApprovalsDatatable(true);
    const params = {
      state: state,
      workitemId: workitemId,
      submissionId: submissionId,
      timeId: workitemTimeId && workitemTimeId > 0 ? workitemTimeId : 0,
    };
    const url = `${process.env.worklog_api_url}/workitem/approval/saveworkitemreviewertimestamp`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        setWorkitemTimeId((prev) =>
          ResponseData !== prev ? ResponseData : -1
        );
        setRunning((prev) => (workitemId !== prev ? workitemId : -1));
        getReviewList();
        setIsLoadingApprovalsDatatable(false);
      } else {
        setIsLoadingApprovalsDatatable(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleReviewSync = async (submissionId: number) => {
    setIsLoadingApprovalsDatatable(true);
    const params = {
      submissionId: submissionId,
    };
    const url = `${process.env.worklog_api_url}/workitem/approval/getreviewerworkitemsync`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        setReviewList((prev: any) =>
          prev.map((data: any) => {
            if (data.SubmissionId === submissionId) {
              return new Object({
                ...data,
                Timer: ResponseData.SyncTime,
              });
            } else {
              return data;
            }
          })
        );
        setIsLoadingApprovalsDatatable(false);
      } else {
        setIsLoadingApprovalsDatatable(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    setRunning(
      reviewList.filter(
        (data: any) => data.TimelogId > 0 || data.TimelogId !== null
      ).length > 0
        ? reviewList.filter(
            (data: any) => data.TimelogId > 0 || data.TimelogId !== null
          )[0].WorkitemId
        : -1
    );
    setWorkitemTimeId(
      reviewList.filter(
        (data: any) => data.TimelogId > 0 || data.TimelogId !== null
      ).length > 0
        ? reviewList.filter(
            (data: any) => data.TimelogId > 0 || data.TimelogId !== null
          )[0].TimelogId
        : -1
    );
    setSubmissionId(
      reviewList.filter(
        (data: any) => data.TimelogId > 0 || data.TimelogId !== null
      ).length > 0
        ? reviewList.filter(
            (data: any) => data.TimelogId > 0 || data.TimelogId !== null
          )[0].SubmissionId
        : -1
    );
  }, [reviewList]);

  useEffect(() => {
    setFilteredOject({
      ...filteredObject,
      ...currentFilterData,
      globalSearch: searchValue,
    });
  }, [currentFilterData, searchValue, activeTab]);

  useEffect(() => {
    const fetchData = async () => {
      await getReviewList();
      onDataFetch(() => fetchData());
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [currentFilterData, searchValue, activeTab, filteredObject]);

  const generateManualTimeBodyRender = (bodyValue: any) => {
    return <div>{bodyValue ? formatTime(bodyValue) : "00:00:00"}</div>;
  };

  const generateIsManualBodyRender = (bodyValue: any) => {
    return <div>{bodyValue === true ? "Yes" : "No"}</div>;
  };

  const columnConfig = [
    {
      name: "WorkitemId",
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
      name: "ParentProcess",
      label: "Process",
      bodyRenderer: generateParentProcessBodyRender,
    },
    {
      name: "SubProcess",
      label: "Sub-Process",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "Timer",
      label: "Review Timer",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "AssignedName",
      label: "Assigned To",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "PriorityName",
      label: "Priority",
      bodyRenderer: generatePriorityWithColor,
    },
    {
      name: "ColorCode",
      options: {
        filter: false,
        sort: false,
        display: false,
        viewColumns: false,
      },
    },
    {
      name: "StatusName",
      label: "Status",
      bodyRenderer: (value: any, tableMeta: any) =>
        generateStatusWithColor(value, tableMeta.rowData[9]),
    },
    {
      name: "EstimateTime",
      label: "Est. Hours",
      bodyRenderer: generateManualTimeBodyRender,
    },
    {
      name: "Quantity",
      label: "Qty.",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "Est*Qty",
      label: "Std. Time",
      bodyRenderer: (value: any, tableMeta: any) => {
        return <span>{tableMeta.rowData.toString()}</span>;
      },
    },
    {
      name: "PreparorTime",
      label: "Preparation Time",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ReviewerTime",
      label: "Reviewer Time",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ActualTime",
      label: "Actual Time",
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
      name: "EmpolyeeName",
      label: "Employee",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "Role",
      label: "Designation",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "EmployeeManualTime",
      label: "Edited Time",
      bodyRenderer: generateManualTimeBodyRender,
    },
    // {
    //   name: "EmployeeIsManual",
    //   label: "Is Manual",
    //   bodyRenderer: generateIsManualBodyRender,
    // },
    {
      name: "ManagerName",
      label: "Manager",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ReviewerId",
      options: {
        display: false,
      },
    },
    {
      name: "ReviewerIsManual",
      options: {
        display: false,
      },
    },
    {
      name: "SubmissionId",
      options: {
        display: false,
      },
    },
    {
      name: "State",
      options: {
        display: false,
      },
    },
    {
      name: "WorkitemId",
      options: {
        display: false,
      },
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
    if (column.name === "Timer") {
      return {
        name: "Timer",
        options: {
          filter: true,
          sort: true,
          customHeadLabelRender: () => generateCustomHeaderName("Review Timer"),
          customBodyRender: (value: any, tableMeta: any) => {
            const timerValue =
              value === 0 ? "00:00:00" : toHoursAndMinutes(value);

            return (
              <div className="w-44 h-7 flex items-center">
                <ColorToolTip
                  title={`Estimated Time: ${toHoursAndMinutes(
                    tableMeta.rowData[11] * tableMeta.rowData[12]
                  )}`}
                  placement="top"
                  arrow
                >
                  <span
                    className={`w-16 text-center text-ellipsis overflow-hidden ${
                      tableMeta.rowData[tableMeta.rowData.length - 2] === 3
                        ? "text-primary"
                        : ""
                    }`}
                  >
                    {timerValue}
                  </span>
                </ColorToolTip>
                {reviewList[tableMeta.rowIndex].ReviewerId ==
                  localStorage.getItem("UserId") &&
                  reviewList.length > 0 &&
                  (reviewList[tableMeta.rowIndex].StatusId === 56 ||
                    reviewList[tableMeta.rowIndex].StatusId === 58 ||
                    reviewList[tableMeta.rowIndex].StatusId === 59 ||
                    reviewList[tableMeta.rowIndex].StatusId === 6 ||
                    reviewList[tableMeta.rowIndex].StatusId === 54) &&
                  reviewList[tableMeta.rowIndex].IsFinalSubmited &&
                  tableMeta.rowData[tableMeta.rowData.length - 2] !== 3 &&
                  tableMeta.rowData[tableMeta.rowData.length - 1] !==
                    isRunning &&
                  (tableMeta.rowData[tableMeta.rowData.length - 2] === 0 ? (
                    <ColorToolTip title="Start" placement="top" arrow>
                      <span
                        className="cursor-pointer"
                        onClick={() =>
                          handleReviewTimer(
                            1,
                            tableMeta.rowData[tableMeta.rowData.length - 1],
                            tableMeta.rowData[tableMeta.rowData.length - 3],
                            0
                          )
                        }
                      >
                        <PlayButton />
                      </span>
                    </ColorToolTip>
                  ) : (
                    tableMeta.rowData[tableMeta.rowData.length - 2] === 2 && (
                      <ColorToolTip title="Resume" placement="top" arrow>
                        <span
                          className="cursor-pointer"
                          onClick={() =>
                            handleReviewTimer(
                              1,
                              tableMeta.rowData[tableMeta.rowData.length - 1],
                              tableMeta.rowData[tableMeta.rowData.length - 3],
                              0
                            )
                          }
                        >
                          <PlayPause />
                        </span>
                      </ColorToolTip>
                    )
                  ))}
                {reviewList[tableMeta.rowIndex].ReviewerId ==
                  localStorage.getItem("UserId") &&
                  (tableMeta.rowData[tableMeta.rowData.length - 2] === 1 ||
                    tableMeta.rowData[tableMeta.rowData.length - 1] ===
                      isRunning) && (
                    <div className="flex">
                      <ColorToolTip title="Pause" placement="top" arrow>
                        <span
                          className="cursor-pointer"
                          onClick={() => {
                            setRunning(
                              tableMeta.rowData[tableMeta.rowData.length - 1]
                            );
                            handleReviewTimer(
                              2,
                              tableMeta.rowData[tableMeta.rowData.length - 1],
                              tableMeta.rowData[tableMeta.rowData.length - 3],
                              workitemTimeId
                            );
                          }}
                        >
                          <PauseButton />
                        </span>
                      </ColorToolTip>
                      <ColorToolTip title="Stop" placement="top" arrow>
                        <span
                          className="cursor-pointer mt-[2px]"
                          onClick={() => setStopReviewTimer(true)}
                        >
                          <StopButton />
                        </span>
                      </ColorToolTip>
                      <ColorToolTip title="Sync" placement="top" arrow>
                        <span
                          className="cursor-pointer"
                          onClick={() =>
                            handleReviewSync(
                              tableMeta.rowData[tableMeta.rowData.length - 3]
                            )
                          }
                        >
                          <RestartButton />
                        </span>
                      </ColorToolTip>
                    </div>
                  )}
                {(reviewList[tableMeta.rowIndex].StatusId === 56 ||
                  reviewList[tableMeta.rowIndex].StatusId === 58 ||
                  reviewList[tableMeta.rowIndex].StatusId === 59 ||
                  reviewList[tableMeta.rowIndex].StatusId === 6 ||
                  reviewList[tableMeta.rowIndex].StatusId === 54) &&
                  reviewList[tableMeta.rowIndex].ReviewerId ==
                    localStorage.getItem("UserId") &&
                  tableMeta.rowData[tableMeta.rowData.length - 4] !== false && (
                    <ColorToolTip
                      title="Reviewer Manual Time"
                      placement="top"
                      arrow
                    >
                      <span
                        className="ml-2 cursor-pointer"
                        onClick={() =>
                          handleReviewerManualTime(
                            tableMeta.rowData[tableMeta.rowData.length - 1],
                            tableMeta.rowData[tableMeta.rowData.length - 3]
                          )
                        }
                      >
                        <ClockIcon />
                      </span>
                    </ColorToolTip>
                  )}
              </div>
            );
          },
        },
      };
    } else if (column.label === "Task ID") {
      return {
        name: "WorkitemId",
        options: {
          filter: true,
          viewColumns: false,
          sort: true,
          customHeadLabelRender: () => generateCustomHeaderName("Task ID"),
          customBodyRender: (value: any, tableMeta: any) => {
            return generateCommonBodyRender(value);
          },
        },
      };
    } else if (column.name === "ColorCode") {
      return {
        name: "ColorCode",
        options: {
          filter: false,
          sort: false,
          display: false,
          viewColumns: false,
        },
      };
    } else if (column.name === "StatusName") {
      return {
        name: "StatusName",
        options: {
          filter: true,
          sort: true,
          viewColumns: false,
          customHeadLabelRender: () => generateCustomHeaderName("Status"),
          customBodyRender: (value: any, tableMeta: any) => {
            const statusColorCode = tableMeta.rowData[9];

            return (
              <div>
                {value === null ||
                value === "" ||
                value === 0 ||
                value === "0" ? (
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
    } else if (column.name === "Est*Qty") {
      return {
        name: "Est*Qty",
        options: {
          filter: true,
          sort: true,
          viewColumns: false,
          customHeadLabelRender: () => generateCustomHeaderName("Std. Time"),
          customBodyRender: (value: any, tableMeta: any) => {
            return (
              <span>
                {toHoursAndMinutes(
                  tableMeta.rowData[11] * tableMeta.rowData[12]
                )}
              </span>
            );
          },
        },
      };
    } else if (column.name === "ReviewerId") {
      return {
        name: "ReviewerId",
        options: {
          display: false,
        },
      };
    } else if (column.name === "ReviewerIsManual") {
      return {
        name: "ReviewerIsManual",
        options: {
          display: false,
        },
      };
    } else if (column.name === "SubmissionId") {
      return {
        name: "SubmissionId",
        options: {
          display: false,
        },
      };
    } else if (column.name === "State") {
      return {
        name: "State",
        options: {
          display: false,
        },
      };
    } else if (column.name === "WorkitemId") {
      return {
        name: "WorkitemId",
        options: {
          display: false,
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

  const approvalColumns: any = columnConfig.map((col: any) => {
    return generateConditionalColumn(col, 9);
  });

  const propsForActionBar = {
    selectedRowsCount,
    selectedRows,
    selectedRowStatusId,
    selectedRowIds,
    selectedWorkItemIds,
    selectedRowClientId,
    selectedRowWorkTypeId,
    settingSelectedId,
    id,
    workitemId,
    onEdit,
    onComment,
    reviewList,
    getReviewList,
    getInitialPagePerRows,
    handleClearSelection,
  };

  return (
    <div>
      {loaded ? (
        <ThemeProvider theme={getMuiTheme()}>
          <MUIDataTable
            data={reviewList}
            columns={approvalColumns}
            title={undefined}
            data-tableid="approval_Datatable"
            options={{
              ...approvals_Dt_Options,
              onRowSelectionChange: (
                currentRowsSelected: any,
                allRowsSelected: any,
                rowsSelected: any
              ) =>
                handleRowSelect(
                  currentRowsSelected,
                  allRowsSelected,
                  rowsSelected
                ),
              selectAllRows: isPopupOpen && selectedRowsCount === 0,
              rowsSelected: selectedRows,
            }}
          />
          <TablePagination
            className="mt-[10px]"
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

      <Dialog open={stopReviewTimer}>
        <div className="p-2">
          <DialogTitle
            sx={{ fontSize: 18, paddingRight: 16, paddingBottom: 1 }}
          >
            Stop Task
          </DialogTitle>
          <hr className="mx-5" />
          <DialogContent>
            <DialogContentText>
              <div className="mr-20 mb-8">Are you sure you want to stop?</div>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              color="error"
              variant="outlined"
              onClick={() => {
                setStopReviewTimer(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              className="!bg-secondary"
              autoFocus
              onClick={() => {
                handleReviewTimer(3, isRunning, submissionId, workitemTimeId);
                setStopReviewTimer(false);
              }}
            >
              Yes, Stop
            </Button>
          </DialogActions>
        </div>
      </Dialog>

      {/* Approval's Action Bar */}
      <ApprovalsActionBar
        {...propsForActionBar}
        getOverLay={(e: any) => setIsLoadingApprovalsDatatable(e)}
      />
      {isLoadingApprovalsDatatable ? <OverLay /> : ""}
    </div>
  );
};

export default Datatable;
