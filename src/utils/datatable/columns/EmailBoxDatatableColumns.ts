import {
  generateCommonBodyRender,
  generateDateWithTime,
  generateEmailboxStatusWithColor,
  generatePriorityWithColor,
} from "../CommonFunction";

export const inboxColsConfig = [
  {
    name: "Id",
    label: "Id",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "Subject",
    label: "Subject Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ClientName",
    label: "Client Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "EmailTypeName",
    label: "Email Type",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "AssignToName",
    label: "Assign To",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "PriorityName",
    label: "Priority",
    bodyRenderer: generatePriorityWithColor,
  },
  {
    name: "StatusName",
    label: "Status",
    bodyRenderer: generateEmailboxStatusWithColor,
  },
  {
    name: "TagList",
    label: "Tag",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "AssignByName",
    label: "Assigned By",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ReceivedOn",
    label: "Received On",
    bodyRenderer: generateDateWithTime,
  },
  {
    name: "OpenDate",
    label: "Open Time",
    bodyRenderer: generateDateWithTime,
  },
  {
    name: "TATEndON",
    label: "Due On",
    bodyRenderer: generateDateWithTime,
  },
  {
    name: "DepartmentNames",
    label: "Department",
    bodyRenderer: generateCommonBodyRender,
  },
];

export const unProcessedColsConfig = [
  {
    name: "Id",
    label: "Id",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "Subject",
    label: "Subject Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "From",
    label: "Client Email",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ClientName",
    label: "Client Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "EmailTypeName",
    label: "Email Type",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "AssignToName",
    label: "Assign To",
    bodyRenderer: generateCommonBodyRender,
  },
  // {
  //   name: "SLATime",
  //   label: "SLA Time",
  //   bodyRenderer: generateCommonBodyRender,
  // },
  // {
  //   name: "TotalTime",
  //   label: "Total Time",
  //   bodyRenderer: generateCommonBodyRender,
  // },
  {
    name: "StatusName",
    label: "Status",
    bodyRenderer: generateEmailboxStatusWithColor,
  },
  {
    name: "PriorityName",
    label: "Priority",
    bodyRenderer: generatePriorityWithColor,
  },
  {
    name: "TagList",
    label: "Tag",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ReceivedOn",
    label: "Received On",
    bodyRenderer: generateDateWithTime,
  },
  {
    name: "DueOn",
    label: "Due On",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "DepartmentNames",
    label: "Department",
    bodyRenderer: generateCommonBodyRender,
  },
];

export const failedColsConfig = [
  {
    name: "Id",
    label: "Id",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "SubjectName",
    label: "Subject Name",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "Sender",
    label: "Sender",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "Recipient",
    label: "Recipient",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "ReceivedTime",
    label: "Received Time",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "EmailTypeName",
    label: "Email Type",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "FailureReason",
    label: "Failure Reason",
    bodyRenderer: generateCommonBodyRender,
  },
  {
    name: "FailureTime",
    label: "Failure Time",
    bodyRenderer: generateCommonBodyRender,
  },
];
