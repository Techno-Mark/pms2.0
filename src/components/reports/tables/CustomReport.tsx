import {
  generateCustomHeaderName,
  generateCommonBodyRender,
  generateInitialTimer,
  generateDateWithoutTime,
  generateStatusWithColor,
  generatePriorityWithColor,
  generateDateWithTime,
} from "@/utils/datatable/CommonFunction";
import MUIDataTable from "mui-datatables";
import { useEffect, useRef, useState } from "react";
import { callAPI } from "@/utils/API/callAPI";
import { options } from "@/utils/datatable/TableOptions";
import { ColorToolTip, getMuiTheme } from "@/utils/datatable/CommonStyle";
import { TablePagination, ThemeProvider } from "@mui/material";
import { haveSameData } from "@/utils/reports/commonFunctions";
import { customreport_InitialFilter } from "@/utils/reports/getFilters";
import ReportLoader from "@/components/common/ReportLoader";
import TableActionIcon from "@/assets/icons/TableActionIcon";
import React from "react";
import { toast } from "react-toastify";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";

interface FilteredData {
  pageNo: number;
  pageSize: number;
  sortColumn: string;
  isDesc: boolean;
  globalSearch: string;
  projectIdsJSON: number[] | [];
  clientIdsJSON: number[] | [];
  processIdsJSON: number[] | [];
  WorkTypeId: number | null;
  subProcessId: number | null;
  assignedById: number | null;
  assigneeId: number | null;
  returnTypeId: number | null;
  numberOfPages: number | null;
  returnYear: number | null;
  currentYear: number | null;
  StatusId: number | null;
  reviewerId: number | null;
  complexity: number | null;
  priority: number | null;
  receivedDate: string | null;
  dueDate: string | null;
  allInfoDate: string | null;
  startDate: string | null;
  endDate: string | null;
  startDateReview: string | null;
  endDateReview: string | null;
  startDateLogged: string | null;
  endDateLogged: string | null;
  ReworkReceivedDate: string | null;
  ReworkDueDate: string | null;
  isDownload: boolean;
  QAId: number | null;
}

interface List {
  WorkItemId: number;
  TaskName: string;
  Description: string | null;
  ClientId: number;
  ClientName: string;
  ProjectId: number;
  ProjectName: string;
  ProcessId: number;
  ProcessName: string;
  SubProcessId: number;
  SubProcessName: string;
  Status: string;
  AssignedById: number;
  AssignedBy: string;
  AssigneeId: number;
  AssigneeName: string;
  ReviewerId: number;
  ReviewerName: string;
  PrevReviewerName: string | null;
  TaxReturnType: any;
  TypeOfReturnId: any;
  TypeOfReturnName: any;
  NoOfPages: number | null;
  ReturnYear: number | null;
  CurrentYear: number | null;
  Complexity: number | null;
  priority: string;
  DateCreated: string;
  DateOfPreparation: string | null;
  DateOfReview: string | null;
  ReceiverDate: string;
  DueDate: string;
  AllInfoDate: string | null;
  TotalEstimatedHours: string;
  TotalSTDHours: string;
  AssigneeAutoTimeTracked: string;
  AssigneeManualTimeTracked: string;
  AssigneeTimeTracked: string;
  ReviewerAutoTimeTracked: string;
  ReviewerManualTimeTracked: string;
  ReviewerTimeTracked: string;
  PrevReviewerAutoTimeTracked: string | null;
  PrevReviewerManualTimeTracked: string | null;
  PrevReviewerTimeTracked: string | null;
  BTC: any;
  IsBTC: string;
  TotalTime: string;
  TotalTimeInMinutes: number | null;
  EditedHours: any;
  StatusColorCode: string;
  Errors: number;
  Quantity: number;
  HoursShared: string;
  TotalEditedHours: string;
  ReviewerActualTime: string;
  ReviewerEditedTime: string;
  HoursSharedDate: string | null;
  PeriodFrom: string | null;
  PeriodTo: string | null;
  ReworkReceivedDate: string | null;
  ReworkDueDate: string | null;
  QAId: number | null;
  QAName: string | null;
  QATotalTime: string | null;
  QAAutoTime: string | null;
  QAManualTime: string | null;
  QAEditedTime: number | null;
  QAQuantity: string | null;
  QASubmittedOn: string | null;
}

interface Response {
  CustomReportFilters: any | null;
  List: List[];
  TotalCount: number;
}

const CustomReport = ({
  filteredData,
  searchValue,
  hasHoursShared,
  isSavingHourData,
  onSaveHourDataComplete,
  onHandleExport,
}: any) => {
  const [customReportFields, setCustomReportFields] = useState<any>({
    loaded: true,
    data: [],
    dataCount: 0,
  });
  const [customReportCurrentPage, setCustomReportCurrentPage] =
    useState<number>(0);
  const [customReportRowsPerPage, setCustomReportRowsPerPage] =
    useState<number>(10);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[] | []>([]);
  const [selectedRowsCount, setSelectedRowsCount] = useState<number>(0);
  const [isPopupOpen, setIsPopupOpen] = useState<
    { index: number; dataIndex: number }[] | []
  >([]);
  const [selectedRowIds, setSelectedRowIds] = useState<number[] | []>([]);

  const getData = async (arg1: FilteredData) => {
    setCustomReportFields({
      ...customReportFields,
      loaded: false,
    });
    const url = `${process.env.report_api_url}/report/custom`;

    const successCallback = (
      ResponseData: Response,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        onHandleExport(ResponseData.List.length > 0);
        setCustomReportFields({
          ...customReportFields,
          loaded: true,
          data: ResponseData.List,
          dataCount: ResponseData.TotalCount,
        });
        handleClearSelection();
      } else {
        setCustomReportFields({
          ...customReportFields,
          loaded: true,
          data: [],
          dataCount: 0,
        });
        handleClearSelection();
      }
    };
    callAPI(url, arg1, successCallback, "post");
  };

  const handleRowSelect = (
    currentRowsSelected: { index: number; dataIndex: number }[] | [],
    allRowsSelected: { index: number; dataIndex: number }[] | [],
    rowsSelected: number[] | []
  ) => {
    const selectedData: List[] | [] = allRowsSelected.map(
      (row: { index: number; dataIndex: number }) =>
        customReportFields.data[row.dataIndex]
    );
    setSelectedRowsCount(rowsSelected?.length);
    setSelectedRows(rowsSelected);

    const selectedWorkItemIds =
      selectedData.length > 0
        ? selectedData.map((selectedRow: List) => selectedRow?.WorkItemId)
        : [];
    setSelectedRowIds(selectedWorkItemIds);

    setIsPopupOpen(allRowsSelected);
  };

  const handleClearSelection = () => {
    setSelectedRowsCount(0);
    setSelectedRows([]);
    setIsPopupOpen([]);
  };

  const saveHoursData = (arg1: number[]) => {
    const params = {
      WorkItemIds: arg1,
      IsHoursShared: 1, // 0 -> pending
    };
    const url = `${process.env.report_api_url}/report/custom/hoursshared`;
    const successCallback = (
      ResponseData: number | string | boolean,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Selected tasks hours shared successfully.");
        hasHoursShared(false);
        onSaveHourDataComplete();
        handleClearSelection();
        setCustomReportCurrentPage(0);
        setCustomReportRowsPerPage(10);
        getData({ ...filteredData, globalSearch: searchValue });
      } else if (ResponseStatus === "Warning" && error === false) {
        toast.warning(ResponseData);
        hasHoursShared(false);
        onSaveHourDataComplete();
        handleClearSelection();
        setCustomReportCurrentPage(0);
        setCustomReportRowsPerPage(10);
        getData({ ...filteredData, globalSearch: searchValue });
      } else {
        hasHoursShared(false);
        onSaveHourDataComplete();
        handleClearSelection();
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => hasHoursShared(selectedRowIds.length > 0), [selectedRowIds]);

  useEffect(() => {
    if (isSavingHourData) {
      saveHoursData(selectedRowIds);
    }
  }, [isSavingHourData]);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setCustomReportCurrentPage(newPage);

    if (filteredData !== null) {
      if (!haveSameData(customreport_InitialFilter, filteredData)) {
        getData({
          ...filteredData,
          globalSearch: searchValue,
          pageNo: newPage + 1,
          pageSize: customReportRowsPerPage,
        });
      }
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCustomReportCurrentPage(0);
    setCustomReportRowsPerPage(parseInt(event.target.value));

    if (filteredData !== null) {
      if (!haveSameData(customreport_InitialFilter, filteredData)) {
        getData({
          ...filteredData,
          globalSearch: searchValue,
          pageNo: 1,
          pageSize: event.target.value,
        });
      }
    }
  };

  const handleDeleteRow = async () => {
    if (selectedRowId) {
      const params = {
        workitemIds: [selectedRowId],
      };
      const url = `${process.env.worklog_api_url}/workitem/deleteworkitem`;
      const successCallback = (
        ResponseData: null,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success("Task has been deleted successfully!");
        }
      };
      callAPI(url, params, successCallback, "POST");
      setSelectedRowId(null);
      setIsDeleteOpen(false);
      getData({ ...filteredData, globalSearch: searchValue });
    }
  };

  const closeModal = () => {
    setSelectedRowId(null);
    setIsDeleteOpen(false);
  };

  useEffect(() => {
    if (filteredData !== null) {
      if (haveSameData(customreport_InitialFilter, filteredData)) {
        setCustomReportFields({
          ...customReportFields,
          data: [],
          dataCount: 0,
        });
      } else {
        setCustomReportCurrentPage(0);
        setCustomReportRowsPerPage(10);
        getData({ ...filteredData, globalSearch: searchValue });
      }
    }
  }, [filteredData, searchValue]);

  const handleActionValue = async (actionId: string, id: number) => {
    if (actionId.toLowerCase() === "edit") {
      window.open(`${process.env.redirectEditURL}${id}`, "_blank");
    }
    if (actionId.toLowerCase() === "delete") {
      setSelectedRowId(id);
      setIsDeleteOpen(true);
    }
  };

  const Actions = ({ actions, id }: { actions: string[]; id: number }) => {
    const actionsRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        actionsRef.current &&
        !actionsRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    useEffect(() => {
      window.addEventListener("click", handleOutsideClick);
      return () => {
        window.removeEventListener("click", handleOutsideClick);
      };
    }, []);

    const actionPermissions = actions.filter(
      (action: string) =>
        action.toLowerCase() === "edit" || action.toLowerCase() === "delete"
    );

    return actionPermissions.length > 0 &&
      localStorage.getItem("isAdmin") == "true" ? (
      <div>
        <span
          ref={actionsRef}
          className="w-5 h-5 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <TableActionIcon />
        </span>
        {open && (
          <React.Fragment>
            <div className="absolute top-30 right-4 z-10 flex justify-center items-center">
              <div className="py-2 border border-lightSilver rounded-md bg-pureWhite shadow-lg ">
                <ul className="w-28">
                  {actionPermissions.map((action: string, index: number) => (
                    <li
                      key={index}
                      onClick={() => handleActionValue(action, id)}
                      className="flex w-full h-9 px-3 hover:bg-lightGray !cursor-pointer"
                    >
                      <div className="flex justify-center items-center ml-2 cursor-pointer">
                        <label className="inline-block text-xs cursor-pointer">
                          {action}
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    ) : localStorage.getItem("isAdmin") == "true" ? (
      <div className="w-5 h-5 relative opacity-50 pointer-events-none">
        <TableActionIcon />
      </div>
    ) : (
      localStorage.getItem("isAdmin") == "false" && (
        <div className="w-5 h-5 relative opacity-50 pointer-events-none">-</div>
      )
    );
  };

  const columns = [
    {
      name: "WorkItemId",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Task ID"),
      },
    },
    {
      name: "ClientName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Client Name"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "ProjectName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Project Name"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "TaskName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Task Name"),
        customBodyRender: (value: string, tableMeta: any) => {
          const shortProcessName =
            value !== null &&
            value !== undefined &&
            value !== "" &&
            value !== "0" &&
            value.length > 20
              ? value.slice(0, 20)
              : value;
          return (
            <div className="ml-2">
              {!value || value === "0" ? (
                "-"
              ) : (
                <a
                  target="_blank"
                  href={`${process.env.redirectURL}${tableMeta.rowData[0]}`}
                  className="text-[#0592C6] cursor-pointer"
                >
                  {value.length > 20 ? (
                    <>
                      <ColorToolTip title={value} placement="top">
                        <span>{shortProcessName}</span>
                      </ColorToolTip>
                      <span>...</span>
                    </>
                  ) : (
                    shortProcessName
                  )}
                </a>
              )}
            </div>
          );
        },
      },
    },
    {
      name: "ProcessName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Process Name"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "SubProcessName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Sub-Process"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "Category",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Client Category"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "HoursShared",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Shared Hrs. Status"),
        customBodyRender: (value: string) => {
          return generateStatusWithColor(
            value,
            value === "Hours Shared" ? "#00B050" : "#A5A5A5"
          );
        },
      },
    },
    {
      name: "HoursSharedDate",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Hours Shared Date"),
        customBodyRender: (value: string) => {
          return generateDateWithTime(value);
        },
      },
    },
    {
      name: "Status",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Status"),
        customBodyRender: (value: string, tableMeta: any) => {
          return generateStatusWithColor(
            value,
            tableMeta.rowData[tableMeta.rowData.length - 1]
          );
        },
      },
    },
    {
      name: "AssigneeName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Assignee"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "QAName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("QA"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "ReviewerName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Reviewer"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "PrevReviewerName",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Prev. Reviewer"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "AssignedBy",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Assigned By"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "TaxReturnType",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Return Type"),
        customBodyRender: (value: string | null) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "NoOfPages",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("No. of Pages"),
        customBodyRender: (value: string | null) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "ReturnYear",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Return Year"),
        customBodyRender: (value: string | number | null) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "CurrentYear",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Current Year"),
        customBodyRender: (value: string | number | null) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "Complexity",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Complexity"),
        customBodyRender: (value: string | number | null) => {
          switch (value) {
            case 1:
              return "Moderate";
            case 2:
              return "Intermediate";
            case 3:
              return "Complex";
            default:
              return "-";
          }
        },
      },
    },
    {
      name: "priority",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Priority"),
        customBodyRender: (value: string | null) => {
          return generatePriorityWithColor(value);
        },
      },
    },
    {
      name: "ReceiverDate",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Recieved Date"),
        customBodyRender: (value: string) => {
          return generateDateWithoutTime(value);
        },
      },
    },
    {
      name: "DueDate",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Due Date"),
        customBodyRender: (value: string) => {
          return generateDateWithoutTime(value);
        },
      },
    },
    {
      name: "AllInfoDate",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("All Info Date"),
        customBodyRender: (value: string | null) => {
          return generateDateWithoutTime(value);
        },
      },
    },
    {
      name: "ReworkReceivedDate",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Rework Recieved Date"),
        customBodyRender: (value: string) => {
          return generateDateWithoutTime(value);
        },
      },
    },
    {
      name: "ReworkDueDate",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Rework Due Date"),
        customBodyRender: (value: string) => {
          return generateDateWithoutTime(value);
        },
      },
    },
    {
      name: "Description",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Description"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "DateCreated",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Date of Creation"),
        customBodyRender: (value: string | null) => {
          return generateDateWithoutTime(value);
        },
      },
    },
    {
      name: "DateOfPreparation",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Date of Preparation"),
        customBodyRender: (value: string | null) => {
          return generateDateWithoutTime(value);
        },
      },
    },
    {
      name: "QASubmittedOn",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Date of QA"),
        customBodyRender: (value: string | null) => {
          return generateDateWithoutTime(value);
        },
      },
    },
    {
      name: "DateOfReview",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Date of Review"),
        customBodyRender: (value: string | null) => {
          return generateDateWithoutTime(value);
        },
      },
    },
    {
      name: "PeriodFrom",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Period From"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "PeriodTo",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Period To"),
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "TotalEstimatedHours",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Total Est. Time"),
        customBodyRender: (value: string | null) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "Quantity",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Qty."),
        customBodyRender: (value: string | number) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "TotalSTDHours",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Total Std. Time"),
        customBodyRender: (value: string | null) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "QAQuantity",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("QA Qty."),
        customBodyRender: (value: string | number) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "AssigneeAutoTimeTracked",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Preparer Auto Time"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "AssigneeManualTimeTracked",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Preparer Manual Time"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "AssigneeTimeTracked",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Preparer Time Tracked"),
        customBodyRender: (value: string | null) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "QAAutoTime",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("QA Auto Time"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "QAManualTime",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("QA Manual Time"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "QATotalTime",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("QA Time Tracked"),
        customBodyRender: (value: string | null) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "ReviewerAutoTimeTracked",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Reviewer Auto Time"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "ReviewerManualTimeTracked",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Reviewer Manual Time"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "ReviewerTimeTracked",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Reviewer Time Tracked"),
        customBodyRender: (value: string | null) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "PrevReviewerAutoTimeTracked",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Prev. Reviewer Auto Time"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "PrevReviewerManualTimeTracked",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Prev. Reviewer Manual Time"),
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "PrevReviewerTimeTracked",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Prev. Reviewer Time Tracked"),
        customBodyRender: (value: string | null) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "TotalTime",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Total Time"),
        customBodyRender: (value: string | null) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "EditedHours",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Assignee Edited Hours"),
        customBodyRender: (value: string | null) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "QAEditedTime",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("QA Edited Hours"),
        customBodyRender: (value: string | null) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "ReviewerEditedTime",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Reviewer Edited Hours"),
        customBodyRender: (value: string | null) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "TotalEditedHours",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Total Edited Hours"),
        customBodyRender: (value: string | null) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "Errors",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Errors-Reviewer"),
        customBodyRender: (value: string | number) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "BTC",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("BTC Hours"),
        customBodyRender: (value: string | number | null) => {
          return generateInitialTimer(value);
        },
      },
    },
    {
      name: "IsBTC",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Billing Status"),
        customBodyRender: (value: string | number) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "Comments",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Comment"),
        customBodyRender: (value: string | number) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "MissingInfo",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Missing Info"),
        customBodyRender: (value: string | number) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "WorkItemId",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Change Request"),
        customBodyRender: (value: number | string) => {
          return (
            <div>
              {!value || value === "0" ? (
                <span className="ml-[-30px]">-</span>
              ) : (
                <Actions actions={["Edit", "Delete"]} id={Number(value)} />
              )}
            </div>
          );
        },
      },
    },
    {
      name: "StatusColorCode",
      options: {
        display: false,
      },
    },
  ];

  return customReportFields.loaded ? (
    <>
      <div
        className={`${
          customReportFields.data.length > 0 && "muiTableActionCustom"
        }`}
      >
        <ThemeProvider theme={getMuiTheme()}>
          <MUIDataTable
            columns={columns}
            data={customReportFields.data}
            title={undefined}
            options={{
              ...options,
              rowsSelected: selectedRows,
              selectAllRows: isPopupOpen && selectedRowsCount === 0,
              selectableRows: "multiple",
              tableBodyHeight: "73vh",
              textLabels: {
                body: {
                  noMatch: (
                    <div className="flex items-start">
                      <span>
                        {filteredData === null
                          ? "Please apply filter to view data."
                          : "Currently there is no record available."}
                      </span>
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
          />
          <TablePagination
            component="div"
            count={customReportFields.dataCount}
            page={customReportCurrentPage}
            onPageChange={handleChangePage}
            rowsPerPage={customReportRowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={
              customReportFields.dataCount > 100
                ? [10, 25, 50, 100, customReportFields.dataCount]
                : [10, 25, 50, 100]
            }
          />
        </ThemeProvider>
      </div>

      {/* Delete Modal */}
      {isDeleteOpen && (
        <DeleteDialog
          isOpen={isDeleteOpen}
          onClose={closeModal}
          onActionClick={handleDeleteRow}
          Title={"Delete Task"}
          firstContent={"Are you sure you want to delete Task?"}
          secondContent={
            "If you delete task, you will permanently loose task and task related data."
          }
        />
      )}
    </>
  ) : (
    <ReportLoader />
  );
};

export default CustomReport;
