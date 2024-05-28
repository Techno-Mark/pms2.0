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
  Popover,
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
  handlePageChangeWithFilter,
  handleChangeRowsPerPageWithFilter,
} from "@/utils/datatable/CommonFunction";
import { approvals_Dt_Options } from "@/utils/datatable/TableOptions";
import { ColorToolTip, getMuiTheme } from "@/utils/datatable/CommonStyle";
import ApprovalsActionBar from "./actionBar/ApprovalsActionBar";
import { generateCustomColumn } from "@/utils/datatable/ColsGenerateFunctions";
import ReportLoader from "../common/ReportLoader";
import OverLay from "../common/OverLay";
import { callAPI } from "@/utils/API/callAPI";
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import CloseIcon from "@/assets/icons/reports/CloseIcon";
import { DialogTransition } from "@/utils/style/DialogTransition";
import { options } from "@/utils/datatable/TableOptions";
import {
  ApprovalsPopupResponse,
  InitialFilterApprovals,
  List,
} from "@/utils/Types/approvalsTypes";
import { AppliedFilterApprovals } from "@/utils/Types/types";

interface DatatableProps {
  activeTab: number;
  onEdit: (rowId: number, Id: number, iconIndex?: number) => void;
  onDataFetch: (getData: () => void) => void;
  currentFilterData: AppliedFilterApprovals | [];
  onFilterOpen: boolean;
  onCloseDrawer: boolean;
  onComment: (rowData: boolean, selectedId: number) => void;
  onErrorLog: (rowData: boolean, selectedId: number) => void;
  onManualTime: (rowData: boolean, selectedId: number) => void;
  onHandleExport: (arg1: boolean) => void;
  searchValue: string;
  onChangeLoader: (e: string | null) => void;
}

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
  TypeOfWork: null,
  projectId: null,
  startDate: null,
  endDate: null,
  dueDate: null,
  StatusId: null,
  ProcessId: null,
  DateFilter: null,
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
}: DatatableProps) => {
  const workloadAnchorElFilter: HTMLButtonElement | null = null;
  const openWorkloadFilter = Boolean(workloadAnchorElFilter);
  const workloadIdFilter = openWorkloadFilter ? "simple-popover" : undefined;
  const [isLoadingApprovalsDatatable, setIsLoadingApprovalsDatatable] =
    useState(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [loadingInside, setLoadingInside] = useState<boolean>(false);
  const [selectedRowsCount, setSelectedRowsCount] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[] | []>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<number[] | []>([]);
  const [selectedWorkItemIds, setSelectedWorkItemIds] = useState<number[] | []>(
    []
  );
  const [workitemId, setWorkitemId] = useState<number>(0);
  const [id, setId] = useState<number>(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [tableDataCount, setTableDataCount] = useState(0);
  const [isRunning, setRunning] = useState<number>(-1);
  const [workitemTimeId, setWorkitemTimeId] = useState<number>(-1);
  const [submissionId, setSubmissionId] = useState<number>(-1);
  const [stopReviewTimer, setStopReviewTimer] = useState<boolean>(false);
  const [filteredObject, setFilteredOject] =
    useState<InitialFilterApprovals>(initialFilter);
  const [reviewList, setReviewList] = useState<List[] | []>([]);
  const [selectedRowClientId, setSelectedRowClientId] = useState<number[] | []>(
    []
  );
  const [selectedRowWorkTypeId, setSelectedRowWorkTypeId] = useState<
    number[] | []
  >([]);
  const [isWorkloadExpanded, setIsWorkloadExpanded] = useState<boolean>(false);
  const [clickedWorkloadRowId, setClickedWorkloadRowId] = useState<number>(-1);
  const [reviewListInsideData, setReviewListInsideData] = useState<
    ApprovalsPopupResponse[] | []
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

  useEffect(() => {
    handleClearSelection();
    setPage(0);
    setRowsPerPage(10);
  }, [activeTab]);

  const getReviewList = () => {
    setLoaded(false);
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
      ResponseData: {
        reviewerExportFilter: boolean;
        List: List[];
        TotalTime?: string;
        TotalCount: number;
      },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        const totalTime = ResponseData.TotalTime || "00:00:00";
        onChangeLoader(totalTime);
        onHandleExport(ResponseData.List.length > 0 ? true : false);
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
    currentRowsSelected: { index: number; dataIndex: number }[] | [],
    allRowsSelected: { index: number; dataIndex: number }[] | [],
    rowsSelected: number[] | []
  ) => {
    const selectedData = allRowsSelected.map(
      (row: { index: number; dataIndex: number }) => reviewList[row.dataIndex]
    );

    setSelectedRowsCount(rowsSelected.length);
    setSelectedRows(rowsSelected);

    // adding all selected Ids in an array
    const selectedWorkItemIds =
      selectedData.length > 0
        ? selectedData.map((selectedRow: List) => selectedRow?.WorkitemId)
        : [];

    setSelectedWorkItemIds(selectedWorkItemIds);

    // adding selected workItem Id
    const workitem =
      selectedData.length > 0
        ? selectedData[selectedData.length - 1]?.WorkitemId
        : 0;
    setWorkitemId(Number(workitem));

    // adding selected workItem Id
    const Id =
      selectedData.length > 0
        ? selectedData[selectedData.length - 1]?.SubmissionId
        : 0;
    setId(Number(Id));

    // adding all selected Ids in an array
    const selectedSubmissionIds =
      selectedData.length > 0
        ? selectedData?.map((selectedRow: List) => selectedRow?.SubmissionId)
        : [];

    setSelectedRowIds(selectedSubmissionIds);

    // adding all selected row's Client Ids in an array
    const selectedWorkItemClientIds =
      selectedData.length > 0
        ? selectedData?.map((selectedRow: List) => selectedRow?.ClientId)
        : [];

    setSelectedRowClientId(selectedWorkItemClientIds);

    // adding all selected row's WorkType Ids in an array
    const selectedWorkItemWorkTypeIds =
      selectedData.length > 0
        ? selectedData?.map((selectedRow: List) => selectedRow?.WorkTypeId)
        : [];

    setSelectedRowWorkTypeId(selectedWorkItemWorkTypeIds);

    // adding all selected row's status Ids in an array

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
    if (onFilterOpen) {
      handleClearSelection();
    }
  }, [onFilterOpen]);

  const settingSelectedId = () => {
    onEdit(workitemId, id);
    onErrorLog(true, workitemId);
    handleClearSelection();
  };

  const handleReviewerManualTime = (id1: number, id2: number) => {
    onEdit(id1, id2, 2);
    onManualTime(true, id1);
    handleClearSelection();
  };

  function formatTime(seconds: number) {
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
      ResponseData: number,
      error: boolean,
      ResponseStatus: string
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
        getReviewList();
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
      ResponseData: {
        SyncTime: number;
      },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        if (ResponseData !== null) {
          setReviewList((prev: List[] | []) =>
            prev.map((data: List) => {
              if (data.SubmissionId === submissionId) {
                return {
                  ...data,
                  Timer: ResponseData?.SyncTime,
                };
              } else {
                return data;
              }
            })
          );
          setIsLoadingApprovalsDatatable(false);
        } else {
          getReviewList();
          setIsLoadingApprovalsDatatable(false);
        }
      } else {
        getReviewList();
        setIsLoadingApprovalsDatatable(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    setRunning(
      reviewList.filter(
        (data: List) => data.TimelogId !== null && data.TimelogId > 0
      ).length > 0
        ? reviewList
            .map((data: List) =>
              typeof data.TimelogId !== null &&
              data.TimelogId !== null &&
              data.TimelogId > 0
                ? data.WorkitemId
                : false
            )
            .filter((j: number | boolean) => j !== false)[0]
        : -1
    );
    setWorkitemTimeId(
      reviewList.filter(
        (data: List) => data.TimelogId !== null && data.TimelogId > 0
      ).length > 0
        ? reviewList
            .map((data: any) =>
              typeof data.TimelogId !== null && data.TimelogId > 0
                ? data.TimelogId
                : false
            )
            .filter((j: number | boolean) => j !== false)[0]
        : -1
    );
    setSubmissionId(
      reviewList.filter(
        (data: List) => data.TimelogId !== null && data.TimelogId > 0
      ).length > 0
        ? reviewList
            .map((data: any) =>
              typeof data.TimelogId !== null && data.TimelogId > 0
                ? data.SubmissionId
                : false
            )
            .filter((j: number | boolean) => j !== false)[0]
        : -1
    );
  }, [reviewList]);

  useEffect(() => {
    setFilteredOject({
      ...filteredObject,
      ...currentFilterData,
    });
  }, [currentFilterData]);

  useEffect(() => {
    setFilteredOject({
      ...filteredObject,
      ...currentFilterData,
      PageNo: pageNo,
      PageSize: pageSize,
    });
  }, [activeTab]);

  useEffect(() => {
    setFilteredOject({
      ...filteredObject,
      ...currentFilterData,
      globalSearch: searchValue,
      PageNo: pageNo,
      PageSize: pageSize,
    });
    setPage(0);
    setRowsPerPage(10);
  }, [searchValue]);

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

  const getReviewListInside = async () => {
    setLoadingInside(false);
    const params = {
      WorkItemSubmissionId: clickedWorkloadRowId,
      DateFilter: activeTab === 2 ? null : filteredObject.DateFilter,
    };
    const url = `${process.env.worklog_api_url}/workitem/approval/getbreakandidletime`;
    const successCallback = (
      ResponseData: ApprovalsPopupResponse[] | [],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus.toLowerCase() === "success" && error === false) {
        setLoadingInside(true);
        setReviewListInsideData(ResponseData);
      } else {
        setLoadingInside(true);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    const fetchData = async () => {
      await getReviewListInside();
    };
    isWorkloadExpanded && fetchData();
  }, [isWorkloadExpanded]);

  const generateManualTimeBodyRender = (bodyValue: number) => {
    return <div>{bodyValue ? formatTime(bodyValue) : "00:00:00"}</div>;
  };

  const columnConfigReview = [
    {
      name: "SubmissionId",
      label: "",
      bodyRenderer: generateCommonBodyRender,
    },
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
      bodyRenderer: generateCommonBodyRender,
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
      name: "ReviewerName",
      label: "Reviewer Name",
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
      bodyRenderer: (value: string, tableMeta: any) =>
        generateStatusWithColor(value, tableMeta.rowData[11]),
    },
    {
      name: "TaskColorCode",
      options: {
        filter: false,
        sort: false,
        display: false,
        viewColumns: false,
      },
    },
    {
      name: "TaskStatusName",
      label: "Task Status",
      bodyRenderer: (value: string, tableMeta: any) =>
        generateStatusWithColor(value, tableMeta.rowData[13]),
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
      bodyRenderer: (value: null, tableMeta: any) => {
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
      name: "ManagerHours",
      label: "Preparor Edited Time",
      bodyRenderer: generateManualTimeBodyRender,
    },
    {
      name: "ReviewerEditedTimeSec",
      label: "Reviewer Edited Time",
      bodyRenderer: generateManualTimeBodyRender,
    },
    {
      name: "TotalEditedTimeSec",
      label: "Total Time",
      bodyRenderer: generateManualTimeBodyRender,
    },
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

  const columnConfigAllTask = [
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
      bodyRenderer: generateCommonBodyRender,
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
      name: "ReviewerName",
      label: "Reviewer Name",
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
      bodyRenderer: (value: string, tableMeta: any) =>
        generateStatusWithColor(value, tableMeta.rowData[10]),
    },
    {
      name: "TaskColorCode",
      options: {
        filter: false,
        sort: false,
        display: false,
        viewColumns: false,
      },
    },
    {
      name: "TaskStatusName",
      label: "Task Status",
      bodyRenderer: (value: string, tableMeta: any) =>
        generateStatusWithColor(value, tableMeta.rowData[12]),
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
      bodyRenderer: (value: null, tableMeta: any) => {
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
      name: "ReviewDate",
      label: "Review Date",
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
      name: "ManagerHours",
      label: "Preparor Edited Time",
      bodyRenderer: generateManualTimeBodyRender,
    },
    {
      name: "ReviewerEditedTimeSec",
      label: "Reviewer Edited Time",
      bodyRenderer: generateManualTimeBodyRender,
    },
    {
      name: "TotalEditedTimeSec",
      label: "Total Time",
      bodyRenderer: generateManualTimeBodyRender,
    },
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
          customBodyRender: (value: number, tableMeta: any) => {
            const timerValue =
              value === 0 ? "00:00:00" : toHoursAndMinutes(value);

            return (
              <div className="w-44 h-7 flex items-center">
                <ColorToolTip
                  title={`Estimated Time: ${toHoursAndMinutes(
                    tableMeta.rowData[activeTab === 1 ? 15 : 14] *
                      tableMeta.rowData[activeTab === 1 ? 16 : 15]
                  )}`}
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
                    {timerValue}
                  </span>
                </ColorToolTip>
                {reviewList[tableMeta.rowIndex].ReviewerId ==
                  Number(localStorage.getItem("UserId")) &&
                  reviewList.length > 0 &&
                  (reviewList[tableMeta.rowIndex].StatusType ===
                    "InReviewWithClients" ||
                    reviewList[tableMeta.rowIndex].StatusType === "InReview" ||
                    reviewList[tableMeta.rowIndex].StatusType ===
                      "ReworkInReview" ||
                    reviewList[tableMeta.rowIndex].StatusType ===
                      "PartialSubmitted" ||
                    reviewList[tableMeta.rowIndex].StatusType ===
                      "SecondManagerReview" ||
                    reviewList[tableMeta.rowIndex].StatusType === "Submitted" ||
                    reviewList[tableMeta.rowIndex].StatusType ===
                      "ReworkSubmitted") &&
                  (reviewList[tableMeta.rowIndex].StatusType ===
                    "PartialSubmitted" ||
                    reviewList[tableMeta.rowIndex].IsFinalSubmited) &&
                  tableMeta.rowData[tableMeta.rowData.length - 2] !== 3 &&
                  tableMeta.rowData[tableMeta.rowData.length - 1] !==
                    isRunning &&
                  (tableMeta.rowData[tableMeta.rowData.length - 2] === 0 ? (
                    <ColorToolTip title="Start" placement="top" arrow>
                      <span
                        className="cursor-pointer"
                        onClick={() => {
                          handleReviewTimer(
                            1,
                            tableMeta.rowData[tableMeta.rowData.length - 1],
                            tableMeta.rowData[tableMeta.rowData.length - 3],
                            0
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
                            handleReviewTimer(
                              1,
                              tableMeta.rowData[tableMeta.rowData.length - 1],
                              tableMeta.rowData[tableMeta.rowData.length - 3],
                              0
                            );
                            handleClearSelection();
                          }}
                        >
                          <PlayPause />
                        </span>
                      </ColorToolTip>
                    )
                  ))}
                {reviewList[tableMeta.rowIndex].ReviewerId ==
                  Number(localStorage.getItem("UserId")) &&
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
                            handleClearSelection();
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
                          onClick={() => {
                            handleReviewSync(
                              tableMeta.rowData[tableMeta.rowData.length - 3]
                            );
                            handleClearSelection();
                          }}
                        >
                          <RestartButton />
                        </span>
                      </ColorToolTip>
                    </div>
                  )}
                {(reviewList[tableMeta.rowIndex].StatusType ===
                  "InReviewWithClients" ||
                  reviewList[tableMeta.rowIndex].StatusType === "InReview" ||
                  reviewList[tableMeta.rowIndex].StatusType ===
                    "ReworkInReview" ||
                  reviewList[tableMeta.rowIndex].StatusType ===
                    "PartialSubmitted" ||
                  reviewList[tableMeta.rowIndex].StatusType ===
                    "SecondManagerReview" ||
                  reviewList[tableMeta.rowIndex].StatusType === "Submitted" ||
                  reviewList[tableMeta.rowIndex].StatusType ===
                    "ReworkSubmitted") &&
                  reviewList[tableMeta.rowIndex].ReviewerId ==
                    Number(localStorage.getItem("UserId")) &&
                  tableMeta.rowData[tableMeta.rowData.length - 4] !== false && (
                    <ColorToolTip
                      title="Reviewer Manual Time"
                      placement="top"
                      arrow
                    >
                      <span
                        className="ml-2 cursor-pointer"
                        onClick={() => {
                          handleReviewerManualTime(
                            tableMeta.rowData[tableMeta.rowData.length - 1],
                            tableMeta.rowData[tableMeta.rowData.length - 3]
                          );
                          handleClearSelection();
                        }}
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
    } else if (column.label === "") {
      return {
        name: "SubmissionId",
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
    } else if (column.label === "Task ID") {
      return {
        name: "WorkitemId",
        options: {
          filter: true,
          viewColumns: false,
          sort: true,
          customHeadLabelRender: () => generateCustomHeaderName("Task ID"),
          customBodyRender: (value: number) => {
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
    } else if (column.name === "TaskColorCode") {
      return {
        name: "TaskColorCode",
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
          customBodyRender: (value: string, tableMeta: any) => {
            const statusColorCode =
              tableMeta.rowData[activeTab === 1 ? 11 : 10];

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
    } else if (column.name === "TaskStatusName") {
      return {
        name: "TaskStatusName",
        options: {
          filter: true,
          sort: true,
          viewColumns: false,
          customHeadLabelRender: () => generateCustomHeaderName("Task Status"),
          customBodyRender: (value: string, tableMeta: any) => {
            const statusColorCode =
              tableMeta.rowData[activeTab === 1 ? 13 : 12];

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
    } else if (column.name === "Est*Qty") {
      return {
        name: "Est*Qty",
        options: {
          filter: true,
          sort: true,
          viewColumns: false,
          customHeadLabelRender: () => generateCustomHeaderName("Std. Time"),
          customBodyRender: (value: null, tableMeta: any) => {
            return (
              <span>
                {toHoursAndMinutes(
                  tableMeta.rowData[activeTab === 1 ? 15 : 14] *
                    tableMeta.rowData[activeTab === 1 ? 16 : 15]
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

  const approvalColumns = (
    activeTab === 1 ? columnConfigReview : columnConfigAllTask
  ).map((col: any) => {
    return generateConditionalColumn(col, 9);
  });

  const expandableColumns: any[] = [
    {
      name: "StartDateTime",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Start Date & Time"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "EndDateTime",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("End Date & Time"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "Client",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Client"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "Project",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Project"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "Process",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Idle / Break"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "TotalHours",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Total Hours"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
  ];

  const propsForActionBar = {
    selectedRowsCount,
    selectedRows,
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

          {loadingInside ? (
            <Popover
              id={workloadIdFilter}
              open={isWorkloadExpanded}
              anchorEl={workloadAnchorElFilter}
              TransitionComponent={DialogTransition}
              onClose={() => {
                setIsWorkloadExpanded(false);
                setClickedWorkloadRowId(-1);
                setReviewListInsideData([]);
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
                      User Name:
                    </label>
                    <label className="text-sm font-bold font-proxima capitalize">
                      {reviewListInsideData[0]?.UserName.length > 0
                        ? reviewListInsideData[0]?.UserName
                        : "-"}
                    </label>
                  </div>
                </div>
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setIsWorkloadExpanded(false);
                    setClickedWorkloadRowId(-1);
                    setReviewListInsideData([]);
                    setLoadingInside(false);
                  }}
                >
                  <CloseIcon />
                </div>
              </div>
              <MUIDataTable
                title={undefined}
                columns={expandableColumns}
                data={reviewListInsideData}
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
        getOverLay={(e: boolean) => setIsLoadingApprovalsDatatable(e)}
      />
      {isLoadingApprovalsDatatable || isWorkloadExpanded ? <OverLay /> : ""}
    </div>
  );
};

export default Datatable;
