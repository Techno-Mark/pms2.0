import {
  generateCommonBodyRender,
  generateCommonBodyRenderPercentage,
  generateCustomFormatDate,
  generateCustomHeaderName,
  generateDateWithTime,
  generateDateWithoutTime,
  generateEmailboxSLAStatusWithColor,
  generateEmailboxStatusWithColor,
  generateInitialTimer,
  generateIsLoggedInBodyRender,
  generatePriorityWithColor,
  generateRatingsBodyRender,
  generateStatusWithColor,
  getTagDataForReport,
} from "../CommonFunction";
import { generateCustomColumn } from "../ColsGenerateFunctions";

const RatingReportColsConfig = [
  {
    name: "WorkItemId",
    label: "Task ID",
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
    name: "ReturnTypes",
    label: "Return Type",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "RatingOn",
    label: "Rating Date",
    bodyRenderer: generateCustomFormatDate,
  },
  {
    name: "DateSubmitted",
    label: "Date Submitted",
    bodyRenderer: generateCustomFormatDate,
  },
  // {
  //   name: "HoursLogged",
  //   label: "Hours Logged",
  //   bodyRenderer: generateCommonBodyRender,
  // },
  {
    name: "Ratings",
    label: "Ratings",
    bodyRenderer: generateRatingsBodyRender,
  },
  {
    name: "Comments",
    label: "Comments",
    bodyRenderer: generateCommonBodyRender,
  },
];

const reportTaskColConfig = [
  {
    name: "WorkItemId",
    label: "Task ID",
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
    name: "Type",
    label: "Type",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "Priority",
    label: "Priority",
    bodyRenderer: generatePriorityWithColor,
  },
  {
    name: "Status",
    label: "Status",
    bodyRenderer: (value: string, tableMeta: any) =>
      generateStatusWithColor(
        value,
        tableMeta.rowData[tableMeta.rowData.length - 1]
      ),
  },
  {
    name: "AssignedTo",
    label: "Assigned To",
    bodyRenderer: generateCommonBodyRender,
  },
  // {
  //   name: "HoursLogged",
  //   label: "Hours Logged",
  //   bodyRenderer: generateCommonBodyRender,
  // },
  {
    name: "StartDate",
    label: "Start Date",
    bodyRenderer: generateCustomFormatDate,
  },
  {
    name: "DueDate",
    label: "Due Date",
    bodyRenderer: generateCustomFormatDate,
  },
  {
    name: "ReworkReceivedDate",
    label: "Rework Received Date",
    bodyRenderer: generateCustomFormatDate,
  },
  {
    name: "ReworkDueDate",
    label: "Rework Due Date",
    bodyRenderer: generateCustomFormatDate,
  },
  {
    name: "ColorCode",
    options: {
      display: false,
    },
  },
];

const auditColConfig = [
  {
    header: "TaskId",
    label: "Task ID",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "EmployeeCode",
    label: "Employee Code",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "UserName",
    label: "User Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "DepartmentName",
    label: "Department",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "TaskCreatedDate",
    label: "Task Created Date",
    bodyRenderer: generateDateWithoutTime,
  },
  {
    header: "LoginTime",
    label: "Login Time",
    bodyRenderer: generateDateWithTime,
  },
  {
    header: "LogoutTime",
    label: "Logout Time",
    bodyRenderer: generateDateWithTime,
  },
  {
    header: "ClientName",
    label: "Client",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ProjectName",
    label: "Project",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "TaskName",
    label: "Task Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ProcessName",
    label: "Proces",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "SubProcessName",
    label: "Sub-Process",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "StandardTime",
    label: "Std. Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "TotalTime",
    label: "Total Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "TotalBreakTime",
    label: "Break Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "TotalIdleTime",
    label: "Idle Time",
    bodyRenderer: generateInitialTimer,
  },
];

const reportsProjectsColConfig = [
  {
    header: "ProjectName",
    label: "Project",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ClientName",
    label: "Client Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "WorkType",
    label: "Type of Work",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "BillingType",
    label: "Billing Type",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "InternalHours",
    label: "Internal Hours",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "StandardTime",
    label: "Std. Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "EditHours",
    label: "Edited Hours",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "TotalTime",
    label: "Total Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "DifferenceTime",
    label: "Difference Time",
    bodyRenderer: generateInitialTimer,
  },
];

const reportsLogColConfig = [
  {
    header: "WorkItemId",
    label: "Task Id",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "WorkItemTaskName",
    label: "Task Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "Filed",
    label: "Field Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "OldValue",
    label: "Old Value",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "NewValue",
    label: "New Value",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "UpdatedOn",
    label: "Date & Time",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "UpdatedBy",
    label: "Modify By",
    bodyRenderer: generateCommonBodyRender,
  },
];

const reportsRatingColConfig = [
  {
    name: "WorkItemId",
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
    name: "ReturnTypes",
    label: "Return Type",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "RatingOn",
    label: "Rating Date",
    bodyRenderer: generateCustomFormatDate,
  },
  {
    name: "DateSubmitted",
    label: "Date Submitted",
    bodyRenderer: generateCustomFormatDate,
  },
  {
    name: "HoursLogged",
    label: "Hours Logged",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "Ratings",
    label: "Ratings",
    bodyRenderer: generateRatingsBodyRender,
  },
  {
    name: "Comments",
    label: "Comments",
    bodyRenderer: generateCommonBodyRender,
  },
];

const reportsActivityColConfig = [
  {
    header: "EmployeeCode",
    label: "Employee Code",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "UserName",
    label: "User Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "DepartmentName",
    label: "Department",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "TotalHours",
    label: "Total Hours",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "TotalProductive",
    label: "Productive",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "TotalNonProductive",
    label: "Non-Productive",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "TotalBillable",
    label: "Billable",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "TotalNonBillable",
    label: "Non-Billable",
    bodyRenderer: generateCommonBodyRender,
  },
];

const reportsAPColConfig = [
  {
    header: "WorkItemId",
    label: "Task ID",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ClientName",
    label: "Client Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ProjectName",
    label: "Project Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ProcessName",
    label: "Process",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "SubProcessName",
    label: "Sub-Process",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "DepartmentName",
    label: "Department",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "Category",
    label: "Client Category",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "TaskDate",
    label: "Created On",
    bodyRenderer: generateDateWithoutTime,
  },
  {
    header: "Description",
    label: "Description",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "AssignedTo",
    label: "Assign To",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ReportingTo",
    label: "Reporting To",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "Quantity",
    label: "QTY",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "StdTime",
    label: "STD Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "QAQuantity",
    label: "QA QTY",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "PreparorAutoTime",
    label: "Preparer Auto Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "PreparorManualTime",
    label: "Preparer Manual Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "PreparorTotalTime",
    label: "Preparer Total Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "QAAutoTime",
    label: "QA Auto Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "QAManualTime",
    label: "QA Manual Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "QATotalTime",
    label: "QA Total Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "ReviewerAutoTime",
    label: "Reviewer Auto Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "ReviewerManualTime",
    label: "Reviewer Manual Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "ReviewerTotalTime",
    label: "Reviewer Total Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "PrevReviewerAutoTimeTracked",
    label: "Prev. Reviewer Auto Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "PrevReviewerManualTimeTracked",
    label: "Prev. Reviewer Manual Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "PrevReviewerTimeTracked",
    label: "Prev. Reviewer Total Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "TotalTime",
    label: "Total Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "ReviewerStatusName",
    label: "Approval Status",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "Difference",
    label: "Difference (%)",
    bodyRenderer: generateCommonBodyRenderPercentage,
  },
  {
    header: "Comment",
    label: "Reviewer's Note",
    bodyRenderer: generateCommonBodyRender,
  },
];

const reportsKRAColConfig = [
  {
    header: "WorkItemId",
    label: "Task ID",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ClientName",
    label: "Client Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ProjectName",
    label: "Project Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ProcessName",
    label: "Process",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "SubProcessName",
    label: "Sub-Process",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "UserName",
    label: "User Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "DepartmentName",
    label: "Department",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "StdTime",
    label: "STD Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "Quantity",
    label: "QTY",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "AutoTime",
    label: "Auto Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "ManualTime",
    label: "Manual Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "TotalTime",
    label: "Total Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "Efficiency",
    label: "Efficiency (%)",
    bodyRenderer: generateCommonBodyRenderPercentage,
  },
  {
    header: "Remarks",
    label: "Remarks/Comments",
    bodyRenderer: generateCommonBodyRender,
  },
];

const reportsAMColConfig = [
  {
    header: "EmployeeCode",
    label: "Employee Code",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "UserName",
    label: "User Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "DepartmentName",
    label: "Department",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ReportingTo",
    label: "Reporting Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "StdTime",
    label: "STD Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "AutoTime",
    label: "Auto Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "ManualTime",
    label: "Manual Time",
    bodyRenderer: generateInitialTimer,
  },
  {
    header: "TotalTime",
    label: "Total Time",
    bodyRenderer: generateInitialTimer,
  },
];

const reportsErrorLogColConfig = [
  {
    header: "TaskId",
    label: "Task ID",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "TaskName",
    label: "Task Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "Category",
    label: "Client Category",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ErrorIdentificationDate",
    label: "Error Identification Date",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "DateOfTransaction",
    label: "Transaction Recorded Date",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ErrorTypeVal",
    label: "Error Type",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "IdentifiedBy",
    label: "Error Identified by",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "NatureOfErrorVal",
    label: "Error Details",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "RootCauseVal",
    label: "Error Category",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ImpactVal",
    label: "Impact",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "PriorityVal",
    label: "Criticality",
    bodyRenderer: generatePriorityWithColor,
  },
  {
    header: "VendorName",
    label: "Vendor Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "DocumentNumber",
    label: "Accounting Transaction ID",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "Amount",
    label: "Amount of Impact (if any)",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ErrorCount",
    label: "Error count",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "RootCauseAnalysis",
    label: "Root Cause Analysis",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "MitigationPlan",
    label: "Corrective Action",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ContigencyPlan",
    label: "Preventative Action",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ResolutionStatusVal",
    label: "Resolution status",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "Remark",
    label: "Additional Remark (If any)",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "PreparorErrorTime",
    label: "Preparer Error Logged time",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ReviewerErrorTime",
    label: "Reveiwer Error Logged time",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "AssigneeName",
    label: "Assignee",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ReviewerName",
    label: "Reviewer",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "DepartmentName",
    label: "Department",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "SubmittedOn",
    label: "Date of Creation",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "DateOfReview",
    label: "Date of Review",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "MissingInfo",
    label: "Missing Info",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ReportingManagerName",
    label: "Reporting Manager",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ClientName",
    label: "Client Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ProjectName",
    label: "Project Name",
    bodyRenderer: generateCommonBodyRender,
  },
];

const reportsEmailTypeColConfig = [
  {
    header: "TicketId",
    label: "ID",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "SubjectName",
    label: "Sub Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ClientName",
    label: "Client Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "EmailType",
    label: "Email Type",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "STD_SLA_Time",
    label: "STD SLA Time",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ActualTime",
    label: "Actual Time",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "TagList",
    label: "Tag",
    bodyRenderer: getTagDataForReport,
  },
  {
    header: "TicketStatusName",
    label: "Ticket Status",
    bodyRenderer: generateEmailboxStatusWithColor,
  },
  {
    header: "SLAStatus",
    label: "SLA Status",
    bodyRenderer: generateEmailboxSLAStatusWithColor,
  },
  {
    header: "ReceivedOn",
    label: "Received On",
    bodyRenderer: generateDateWithTime,
  },
  {
    header: "OpenedTime",
    label: "Opened Time",
    bodyRenderer: generateDateWithTime,
  },
  {
    header: "DueOn",
    label: "Due On",
    bodyRenderer: generateDateWithTime,
  },
  {
    header: "AssignedToName",
    label: "Assigned To",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "ReportingManagerName",
    label: "Reporting Manager",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    header: "DepartmentNames",
    label: "Department",
    bodyRenderer: generateCommonBodyRender,
  },
];

const generateCustomizableCols = (
  column: {
    name: string;
    label: string;
    bodyRenderer: (arg0: any) => any;
  },
  rowDataIndex: number
) => {
  if (column.name === "Status") {
    return {
      name: "Status",
      options: {
        filter: true,
        sort: true,
        customHeadLabelRender: () => generateCustomHeaderName("Status"),
        customBodyRender: (value: string, tableMeta: any) =>
          generateStatusWithColor(value, tableMeta.rowData[rowDataIndex]),
      },
    };
  } else if (column.name === "ColorCode") {
    return {
      name: "ColorCode",
      options: {
        display: false,
      },
    };
  } else if (column.name === "LoginTime") {
    return {
      name: "LoginTime",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Login"),
        customBodyRender: (value: string | null) => {
          return generateDateWithTime(value);
        },
      },
    };
  } else if (column.name === "LogoutTime") {
    return {
      name: "LogoutTime",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Logout"),
        customBodyRender: (value: string | null) => {
          return generateDateWithTime(value);
        },
      },
    };
  } else if (column.name === "TotalIdleTime") {
    return {
      name: "TotalIdleTime",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Idle Time"),
        customBodyRender: (value: string) => {
          return generateInitialTimer(value);
        },
      },
    };
  } else if (column.name === "TotalBreakTime") {
    return {
      name: "TotalBreakTime",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () => generateCustomHeaderName("Break Time"),
        customBodyRender: (value: string) => {
          return generateInitialTimer(value);
        },
      },
    };
  } else if (column.name === "TotalProductiveTime") {
    return {
      name: "TotalProductiveTime",
      options: {
        sort: true,
        filter: true,
        customHeadLabelRender: () =>
          generateCustomHeaderName("Productive Time"),
        customBodyRender: (value: string) => {
          return generateInitialTimer(value);
        },
      },
    };
  } else {
    return generateCustomColumn(column.name, column.label, column.bodyRenderer);
  }
};

const reportDatatatbleRatingCols = RatingReportColsConfig.map((col: any) =>
  generateCustomColumn(col.name, col.label, col.bodyRenderer)
);

const reportDatatableTaskCols = reportTaskColConfig.map((col: any) =>
  generateCustomizableCols(col, 12)
);

const reportsAuditCols = auditColConfig.map((col: any) =>
  generateCustomColumn(col.header, col.label, col.bodyRenderer)
);

const reportsLogCols = reportsLogColConfig.map((col: any) =>
  generateCustomColumn(col.header, col.label, col.bodyRenderer)
);

const reportsProjectsCols = reportsProjectsColConfig.map((col: any) =>
  generateCustomColumn(col.header, col.label, col.bodyRenderer)
);

const reportsRatingCols = reportsRatingColConfig.map((col: any) =>
  generateCustomColumn(col.name, col.label, col.bodyRenderer)
);

const reportsActivityCols = reportsActivityColConfig.map((col: any) =>
  generateCustomColumn(col.header, col.label, col.bodyRenderer)
);

const reportsAPCols = reportsAPColConfig.map((col: any) =>
  generateCustomColumn(col.header, col.label, col.bodyRenderer)
);

const reportsKRACols = reportsKRAColConfig.map((col: any) =>
  generateCustomColumn(col.header, col.label, col.bodyRenderer)
);

const reportsAMCols = reportsAMColConfig.map((col: any) =>
  generateCustomColumn(col.header, col.label, col.bodyRenderer)
);

const reportsErrorLogCols = reportsErrorLogColConfig.map((col: any) =>
  generateCustomColumn(col.header, col.label, col.bodyRenderer)
);

const generateCustomizableColsForEmail = (column: {
  header: string;
  label: string;
  bodyRenderer: (arg0: any) => any;
}) => {
  if (column.header === "TagList") {
    return {
      name: "TagList",
      options: {
        filter: true,
        sort: false,
        customHeadLabelRender: () => generateCustomHeaderName("Tag"),
        customBodyRender: (value: string[] | null) =>
          !!value ? getTagDataForReport(value) : "-",
      },
    };
  } else {
    return generateCustomColumn(
      column.header,
      column.label,
      column.bodyRenderer
    );
  }
};

const reportsEmailTypeCols = reportsEmailTypeColConfig.map((col: any) =>
  generateCustomizableColsForEmail(col)
);

const reportsUserLogsCols: any[] = [
  {
    name: "EmployeeCode",
    options: {
      sort: true,
      filter: true,
      customHeadLabelRender: () => generateCustomHeaderName("Employee Code"),
      customBodyRender: (value: string) => {
        return generateCommonBodyRender(value);
      },
    },
  },
  {
    name: "UserName",
    options: {
      sort: true,
      filter: true,
      customHeadLabelRender: () => generateCustomHeaderName("User Name"),
      customBodyRender: (value: string) => {
        return generateCommonBodyRender(value);
      },
    },
  },
  {
    name: "ReportingManager",
    options: {
      sort: true,
      filter: true,
      customHeadLabelRender: () => generateCustomHeaderName("Reporting To"),
      customBodyRender: (value: string) => {
        return generateCommonBodyRender(value);
      },
    },
  },
  {
    name: "DepartmentName",
    options: {
      sort: true,
      filter: true,
      customHeadLabelRender: () => generateCustomHeaderName("Department"),
      customBodyRender: (value: string) => {
        return generateCommonBodyRender(value);
      },
    },
  },
  {
    name: "LoginTime",
    options: {
      sort: true,
      filter: true,
      customHeadLabelRender: () => generateCustomHeaderName("Login"),
      customBodyRender: (value: string | null) => {
        return generateDateWithTime(value);
      },
    },
  },
  {
    name: "LogoutTime",
    options: {
      sort: true,
      filter: true,
      customHeadLabelRender: () => generateCustomHeaderName("Logout"),
      customBodyRender: (value: string | null) => {
        return generateDateWithTime(value);
      },
    },
  },
  {
    name: "TotalTrackedTime",
    options: {
      sort: true,
      filter: true,
      customHeadLabelRender: () => generateCustomHeaderName("Auto Time"),
      customBodyRender: (value: string) => {
        return generateInitialTimer(value);
      },
    },
  },
  {
    name: "TotalManualTime",
    options: {
      sort: true,
      filter: true,
      customHeadLabelRender: () => generateCustomHeaderName("Manual Time"),
      customBodyRender: (value: string) => {
        return generateInitialTimer(value);
      },
    },
  },
  {
    name: "TotalIdleTime",
    options: {
      sort: true,
      filter: true,
      customHeadLabelRender: () => generateCustomHeaderName("Idle Time"),
      customBodyRender: (value: string) => {
        return generateInitialTimer(value);
      },
    },
  },
  {
    name: "TotalBreakTime",
    options: {
      sort: true,
      filter: true,
      customHeadLabelRender: () => generateCustomHeaderName("Break Time"),
      customBodyRender: (value: string) => {
        return generateInitialTimer(value);
      },
    },
  },
  {
    name: "TotalProductiveTime",
    options: {
      sort: true,
      filter: true,
      customHeadLabelRender: () => generateCustomHeaderName("Productive Time"),
      customBodyRender: (value: string) => {
        return generateInitialTimer(value);
      },
    },
  },
  {
    name: "IsLoggedIn",
    options: {
      sort: true,
      filter: true,
      customHeadLabelRender: () => generateCustomHeaderName("Is Logged In"),
      customBodyRender: (value: number) => generateIsLoggedInBodyRender(value),
    },
  },
];

export {
  reportDatatatbleRatingCols,
  reportDatatableTaskCols,
  reportsAuditCols,
  reportsProjectsCols,
  reportsRatingCols,
  reportsUserLogsCols,
  reportsLogCols,
  reportsActivityCols,
  reportsAPCols,
  reportsKRACols,
  reportsAMCols,
  reportsErrorLogCols,
  reportsEmailTypeCols,
};
