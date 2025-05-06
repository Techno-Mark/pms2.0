import {
  generateBillingStatusBodyRender,
  generateCommonBodyRender,
  generateCustomFormatDate,
  generateDashboardReportBodyRender,
  generateDashboardReportBodyRenderSecondToTime,
  generateDashboardReportBodyRenderShortName,
  generateDateWithTime,
  generateEmailboxSLAStatusWithColor,
  generateEmailboxStatusWithColor,
  generatePriorityWithColor,
  generateStatusWithColor,
  getTagDataForDashboard,
} from "../CommonFunction";
import {
  generateCustomColumn,
  generateStatusColumn,
} from "../ColsGenerateFunctions";

const adminDashboardReportCols = [
  { header: "ClientName", label: "Client Name" },
  { header: "Total", label: "Total" },
  { header: "NotStarted", label: "Not Started" },
  { header: "InPreparation", label: "In Preparation" },
  { header: "PreparationCompleted", label: "Preparation Completed" },
  { header: "Submitted", label: "Submitted" },
  { header: "ErrorLogs", label: "Errorlogs" },
  { header: "InReview", label: "In Review" },
  { header: "ReviewCompleted", label: "Review Completed" },
  { header: "ReviewCompletedAWN", label: "Review Completed [AWN]" },
  { header: "Rework", label: "Rework" },
  { header: "ReworkInPreparation", label: "Rework In Preparation" },
  { header: "ReworkPrepCompleted", label: "Rework Prep Completed" },
  { header: "ReworkSubmitted", label: "Rework Submitted" },
  { header: "ReworkInReview", label: "Rework In Review" },
  { header: "ReworkReviewCompleted", label: "Rework Review Completed" },
  {
    header: "ReworkReviewCompletedAWN",
    label: "Rework Review Completed [AWN]",
  },
  { header: "Rejected", label: "Rejected" },
  { header: "Signedoff", label: "Signed Off" },
  { header: "Assigned", label: "Assigned" },
  { header: "PendingfromAccounting", label: "Pending from Accounting" },
  { header: "SecondManagerReview", label: "Second/Manager Review" },
  { header: "Withdraw", label: "WithDraw" },
  { header: "WithdrawnbyClient", label: "Withdrawn by Client" },
  { header: "OnHoldFromClient", label: "On Hold From Client" },
].map((i: { header: string; label: string }) =>
  generateCustomColumn(i.header, i.label, generateDashboardReportBodyRender)
);

const adminDashboardBillingTypeCols = [
  { header: "ClientName", label: "Client Name" },
  { header: "TypeOfWorkName", label: "Type of Work" },
  { header: "BillingTypeName", label: "Billing Type" },
  { header: "Status", label: "Status" },
  { header: "ContractedHours", label: "Contracted Hours" },
  { header: "InternalHours", label: "Internal Hours" },
].map((i: { header: string; label: string }) =>
  generateCustomColumn(
    i.header,
    i.label,
    i.header === "Status"
      ? generateBillingStatusBodyRender
      : generateDashboardReportBodyRender
  )
);

const adminDashboardEmailTypeCols = [
  { header: "TicketId", label: "Ticket ID" },
  { header: "Subject", label: "Subject Name" },
  { header: "ClientName", label: "Client Name" },
  { header: "Type", label: "Email Type" },
  { header: "StandardSLATime", label: "Standard SLA Time" },
  { header: "ActualTimeTaken", label: "Actual Time Taken" },
  { header: "SLAStatusType", label: "SLA Status" },
  { header: "StatusName", label: "Ticket Status" },
  { header: "PriorityName", label: "Priority" },
  { header: "Tag", label: "Tags" },
  { header: "ReceivedOn", label: "Received On" },
  { header: "OpenDate", label: "Opened Time" },
  { header: "DueOn", label: "Due On" },
  { header: "AssignTo", label: "Assigned To" },
  { header: "ReportingManager", label: "Reporting Manager" },
  { header: "Department", label: "Department" },
].map((i: { header: string; label: string }) =>
  generateCustomColumn(
    i.header,
    i.label,
    i.header === "StatusName"
      ? generateEmailboxStatusWithColor
      : i.header === "SLAStatusType"
      ? generateEmailboxSLAStatusWithColor
      : i.header === "StandardSLATime" || i.header === "ActualTimeTaken"
      ? generateDashboardReportBodyRenderSecondToTime
      : i.header === "PriorityName"
      ? generatePriorityWithColor
      : i.header === "Tag"
      ? getTagDataForDashboard
      : i.header === "ReceivedOn" ||
        i.header === "OpenDate" ||
        i.header === "DueOn"
      ? generateDateWithTime
      : generateDashboardReportBodyRenderShortName
  )
);

const SummaryColConfig = [
  {
    name: "TaskId",
    label: "Task Id",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "TaskName",
    label: "Task Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ProjectName",
    label: "Project Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ClientName",
    label: "Client Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "StatusName",
    label: "Status",
    bodyRenderer: (value: any, tableMeta: any) =>
      generateStatusWithColor(value, tableMeta.rowData[14]),
  },
  {
    name: "TaxReturnTypeName",
    label: "Return Type",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "WorkTypeName",
    label: "Type of Work",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "StartDate",
    label: "Start Date",
    bodyRenderer: generateCustomFormatDate,
  },
  {
    name: "EndDate",
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
    name: "PriorityName",
    label: "Priority",
    bodyRenderer: generatePriorityWithColor,
  },
  {
    name: "AssignedByName",
    label: "Assigned By",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "AssignedToName",
    label: "Assigned To",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "StatusColorCode",
    options: {
      filter: false,
      sort: false,
      display: false,
    },
  },
];

const errorlogColConfig = [
  {
    name: "TaskId",
    label: "Task Id",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "TaskName",
    label: "Task Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ClientName",
    label: "Client Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "Category",
    label: "Client Category",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ProjectName",
    label: "Project Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ProcessName",
    label: "Process Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "SubProcessName",
    label: "SubProcess Name",
    bodyRenderer: generateCommonBodyRender,
  },
  // {
  //   name: "StatusName",
  //   label: "Status",
  //   bodyRenderer: (value: any, tableMeta: any) =>
  //     generateStatusWithColor(
  //       value,
  //       tableMeta.rowData[tableMeta.rowData.length - 1]
  //     ),
  // },
  {
    name: "StartDate",
    label: "Start Date",
    bodyRenderer: generateCustomFormatDate,
  },
  {
    name: "EndDate",
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
    name: "PriorityName",
    label: "Priority",
    bodyRenderer: generatePriorityWithColor,
  },
  {
    name: "AssignedByName",
    label: "Assigned By",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "AssignedToName",
    label: "Assigned To",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "DepartmentName",
    label: "Department",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ErrorTypeVal",
    label: "Error Type",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "RootCauseVal",
    label: "Error Category",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "NatureOfErrorVal",
    label: "Error Details",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ErrorlogPriorityVal",
    label: "Criticality",
    bodyRenderer: generatePriorityWithColor,
  },
  {
    name: "ImpactVal",
    label: "Impact",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "Amount",
    label: "Amount of Impact",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "DateOfTransaction",
    label: "Transaction Recorded Date",
    bodyRenderer: generateCustomFormatDate,
  },
  {
    name: "Remark",
    label: "Additional Remark",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "RootCauseAnalysis",
    label: "Root Cause Analysis",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "MitigationPlan",
    label: "Corrective Action",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ContigencyPlan",
    label: "Preventative Action",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "VendorName",
    label: "Vendor Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "DocumentNumber",
    label: "Accounting Transaction ID",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ErrorIdentificationDate",
    label: "Error Identification Date",
    bodyRenderer: generateCustomFormatDate,
  },
  {
    name: "ResolutionStatusVal",
    label: "Resolution status",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "IdentifiedBy",
    label: "Error Identified by",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ResolvedBy",
    label: "Resolved By",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "SolvedOn",
    label: "Resolved On",
    bodyRenderer: generateCustomFormatDate,
  },
  {
    name: "IsImported",
    label: "Is Imported",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "SubTaskName",
    label: "Sub Task Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "SubTaskDescription",
    label: "Sub Task Description",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "CustomerName",
    label: "Vendor/Customer Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "InvoiceNumber",
    label: "Bill/Invoice Number",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "SubTaskDate",
    label: "Date",
    bodyRenderer: generateCustomFormatDate,
  },
  {
    name: "BillAmount",
    label: "Bill Amount",
    bodyRenderer: generateCommonBodyRender,
  },
  // {
  //   name: "StatusColorCode",
  //   options: {
  //     filter: false,
  //     sort: false,
  //     display: false,
  //   },
  // },
];

const tasksSubmittedAssignedColConfig = [
  {
    name: "TaskId",
    label: "Task Id",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "TaskName",
    label: "Task Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ClientName",
    label: "Client Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "TypeOfWork",
    label: "Type Of Work",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ProjectName",
    label: "Project Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "Process",
    label: "Process Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "DepartmentName",
    label: "Department",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "AssignedToName",
    label: "Assigned To",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "AssignedByName",
    label: "Assigned By",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "StatusName",
    label: "Status",
    bodyRenderer: (value: any, tableMeta: any) =>
      generateStatusWithColor(value, tableMeta.rowData[15]),
  },
  {
    name: "PriorityName",
    label: "Priority",
    bodyRenderer: generatePriorityWithColor,
  },
  {
    name: "StartDate",
    label: "Start Date",
    bodyRenderer: generateCustomFormatDate,
  },
  {
    name: "EndDate",
    label: "Due Date",
    bodyRenderer: generateCustomFormatDate,
  },
  {
    name: "AutoTime",
    label: "Auto Time",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ManualTime",
    label: "Manual Time",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "StatusColorCode",
    options: {
      filter: false,
      sort: false,
      display: false,
    },
  },
];

const reworkTrendColConfig = [
  {
    name: "TaskId",
    label: "Task Id",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "TaskName",
    label: "Task Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ClientName",
    label: "Client Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "WorkTypeName",
    label: "Type Of Work",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ProjectName",
    label: "Project Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ProcessName",
    label: "Process Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "SubProcessName",
    label: "SubProcess Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "DepartmentName",
    label: "Department",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "StatusName",
    label: "Status",
    bodyRenderer: (value: any, tableMeta: any) =>
      generateStatusWithColor(value, tableMeta.rowData[16]),
  },
  {
    name: "AssigneeName",
    label: "Assigned To",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "AssignedByName",
    label: "Assigned By",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ReviewerName",
    label: "Reviewer",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "StartDate",
    label: "Start Date",
    bodyRenderer: generateCustomFormatDate,
  },
  {
    name: "EndDate",
    label: "Due Date",
    bodyRenderer: generateCustomFormatDate,
  },
  {
    name: "ReworkReceivedDate",
    label: "Rework Received Date",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "Comments",
    label: "Comments/Remarks",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "StatusColorCode",
    options: {
      filter: false,
      sort: false,
      display: false,
    },
  },
];

const autoManualColConfig = [
  {
    name: "EmployeeCode",
    label: "Employee Code",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "UserName",
    label: "User Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ReportingManagerName",
    label: "Reporting Manager",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "RoleName",
    label: "Department",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "DepartmentName",
    label: "Designation",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "TotalTime",
    label: "Total Time",
    bodyRenderer: generateCommonBodyRender,
  },
];

const peakProductiveColConfig = [
  {
    name: "UserName",
    label: "User Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "DepartmentName",
    label: "Department",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "TotalTime",
    label: "Total Time",
    bodyRenderer: generateCommonBodyRender,
  },
];

const billableNonBillableColConfig = [
  {
    name: "TaskId",
    label: "Task Id",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "TaskName",
    label: "Task Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ProcessName",
    label: "Process Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "SubProcessName",
    label: "SubProcess Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "DepartmentName",
    label: "Department",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "AssigneeName",
    label: "Assigned To",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "AssignedBy",
    label: "Assigned By",
    bodyRenderer: generateCommonBodyRender,
  },
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
  // {
  //   name: "IsBillable",
  //   label: "Logged Hours (Billable / Non-Billable)",
  //   bodyRenderer: generateCommonBodyRender,
  // },
  // {
  //   name: "IsProductive",
  //   label: "Productivity Tag (Productive / Non-Productive)",
  //   bodyRenderer: generateCommonBodyRender,
  // },
];

const slaTATAchivementColConfig = [
  {
    name: "TaskId",
    label: "Task Id",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "TaskName",
    label: "Task Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ClientName",
    label: "Client Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "TypeOfWork",
    label: "Type Of Work",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ProjectName",
    label: "Project Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ProcessName",
    label: "Process Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "SubProcessName",
    label: "SubProcess Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "DepartmentName",
    label: "Department",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "Assignee",
    label: "Assigned To",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "AssignedBy",
    label: "Assigned By",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "TaskStatus",
    label: "Status",
    bodyRenderer: (value: any, tableMeta: any) =>
      generateStatusWithColor(value, tableMeta.rowData[18]),
  },
  {
    name: "Reviewer",
    label: "Reviewer",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "EstimateTime",
    label: "Est. Time",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "StdTime",
    label: "Std. Time",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "TotalTime",
    label: "Total Time",
    bodyRenderer: generateCommonBodyRender,
  },
  // {
  //   name: "SLAStatus",
  //   label: "SLA Status",
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
    name: "StatusColorCode",
    options: {
      filter: false,
      sort: false,
      display: false,
    },
  },
];

const adminDashboardSummaryCols = SummaryColConfig.map((column: any) =>
  generateStatusColumn(column, 14)
);

const adminDashboardProjectStatusCols = SummaryColConfig.map((column: any) =>
  generateStatusColumn(column, 14)
);

const adminDashboardTaskStatusCols = SummaryColConfig.map((column: any) =>
  generateStatusColumn(column, 14)
);

const adminDashboardErrorlogCols = errorlogColConfig.map((column: any) =>
  generateStatusColumn(column, 14)
);

const adminDashboardTasksSubmittedAssignedCols =
  tasksSubmittedAssignedColConfig.map((column: any) =>
    generateStatusColumn(column, 15)
  );

const adminDashboardReworkTrendCols = reworkTrendColConfig.map((column: any) =>
  generateStatusColumn(column, 16)
);

const adminDashboardAutoManualCols = autoManualColConfig.map((column: any) =>
  generateStatusColumn(column, 16)
);

const adminDashboardPeakProductiveCols = peakProductiveColConfig.map(
  (column: any) => generateStatusColumn(column, 16)
);

const adminDashboardBillableNonBillableCols = billableNonBillableColConfig.map(
  (column: any) => generateStatusColumn(column, 16)
);

const adminDashboardSLATATAchivementCols = slaTATAchivementColConfig.map(
  (column: any) => generateStatusColumn(column, 18)
);

export {
  adminDashboardReportCols,
  adminDashboardBillingTypeCols,
  adminDashboardSummaryCols,
  adminDashboardProjectStatusCols,
  adminDashboardTaskStatusCols,
  adminDashboardErrorlogCols,
  adminDashboardEmailTypeCols,
  adminDashboardTasksSubmittedAssignedCols,
  adminDashboardReworkTrendCols,
  adminDashboardAutoManualCols,
  adminDashboardPeakProductiveCols,
  adminDashboardBillableNonBillableCols,
  adminDashboardSLATATAchivementCols,
};
