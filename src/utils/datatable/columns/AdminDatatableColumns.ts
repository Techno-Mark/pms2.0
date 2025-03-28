import {
  generateBillingStatusBodyRender,
  generateCommonBodyRender,
  generateCustomFormatDate,
  generateDashboardReportBodyRender,
  generatePriorityWithColor,
  generateStatusWithColor,
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

export {
  adminDashboardReportCols,
  adminDashboardBillingTypeCols,
  adminDashboardSummaryCols,
  adminDashboardProjectStatusCols,
  adminDashboardTaskStatusCols,
  adminDashboardErrorlogCols,
};
