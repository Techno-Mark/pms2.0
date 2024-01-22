import {
  generateCommonBodyRender,
  generateCustomFormatDate,
  generateCustomHeaderName,
  generateDateWithTime,
  generateDateWithoutTime,
  generateInitialTimer,
  generateIsLoggedInBodyRender,
  generatePriorityWithColor,
  generateRatingsBodyRender,
  generateStatusWithColor,
} from "../CommonFunction";
import { generateCustomColumn } from "./ColsGenerateFunctions";

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
    bodyRenderer: (value: any, tableMeta: any) =>
      generateStatusWithColor(value, tableMeta.rowData[11]),
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
    name: "ColorCode",
    options: {
      display: false,
    },
  },
];

const auditColConfig = [
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
        customBodyRender: (value: any, tableMeta: any) =>
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
        customBodyRender: (value: any) => {
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
        customBodyRender: (value: any) => {
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
        customBodyRender: (value: any) => {
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
        customBodyRender: (value: any) => {
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
        customBodyRender: (value: any) => {
          return generateInitialTimer(value);
        },
      },
    };
  } else {
    return generateCustomColumn(column.name, column.label, column.bodyRenderer);
  }
};

const reportDatatatbleRatingCols: any = RatingReportColsConfig.map((col: any) =>
  generateCustomColumn(col.name, col.label, col.bodyRenderer)
);

const reportDatatableTaskCols: any = reportTaskColConfig.map((col: any) =>
  generateCustomizableCols(col, 11)
);

const reportsAuditCols: any = auditColConfig.map((col: any) =>
  generateCustomColumn(col.header, col.label, col.bodyRenderer)
);

const reportsLogCols: any = reportsLogColConfig.map((col: any) =>
  generateCustomColumn(col.header, col.label, col.bodyRenderer)
);

const reportsProjectsCols: any = reportsProjectsColConfig.map((col: any) =>
  generateCustomColumn(col.header, col.label, col.bodyRenderer)
);

const reportsRatingCols: any = reportsRatingColConfig.map((col: any) =>
  generateCustomColumn(col.name, col.label, col.bodyRenderer)
);

const reportsUserLogsCols: any[] = [
  {
    name: "UserName",
    options: {
      sort: true,
      filter: true,
      customHeadLabelRender: () => generateCustomHeaderName("User Name"),
      customBodyRender: (value: any) => {
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
      customBodyRender: (value: any) => {
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
      customBodyRender: (value: any) => {
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
      customBodyRender: (value: any) => {
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
      customBodyRender: (value: any) => {
        return generateDateWithTime(value);
      },
    },
  },
  {
    name: "TotalIdleTime",
    options: {
      sort: true,
      filter: true,
      customHeadLabelRender: () => generateCustomHeaderName("Idle Time"),
      customBodyRender: (value: any) => {
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
      customBodyRender: (value: any) => {
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
      customBodyRender: (value: any) => {
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
      customBodyRender: (value: any) => generateIsLoggedInBodyRender(value),
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
};
