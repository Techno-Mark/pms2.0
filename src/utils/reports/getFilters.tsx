import { getDates } from "@/utils/timerFunctions";

export const client_project_InitialFilter: any = {
  pageNo: 1,
  pageSize: 10,
  sortColumn: "",
  isDesc: true,
  globalSearch: "",
  typeOfWork: null,
  billType: null,
  clients: [],
  projects: [],
  department: null,
  isActive: true,
  showSubProject: false,
  isClientReport: false,
  isDownload: false,
  startDate: null,
  endDate: null,
};

export const user_InitialFilter: any = {
  pageNo: 1,
  pageSize: 10,
  sortColumn: "",
  isDesc: true,
  globalSearch: "",
  departmentId: null,
  isActive: true,
  users: [],
  startDate: getDates()[0],
  endDate: getDates()[getDates().length - 1],
  isDownload: false,
};

export const timeSheet_InitialFilter: any = {
  pageNo: 1,
  pageSize: 10,
  sortColumn: "",
  isDesc: true,
  globlaSearch: "",
  departmentId: null,
  isActive: true,
  users: [],
  startDate: getDates()[0],
  endDate: getDates()[getDates().length - 1],
  isDownload: false,
};

export const workLoad_InitialFilter: any = {
  pageNo: 1,
  pageSize: 10,
  sortColumn: "",
  isDesc: true,
  globalSearch: "",
  departmentId: null,
  dateFilter: null,
  isDownload: false,
};

export const userLogs_InitialFilter: any = {
  pageNo: 1,
  pageSize: 10,
  sortColumn: "",
  isDesc: true,
  globalSearch: "",
  departmentId: null,
  isActive: true,
  users: [],
  dateFilter: null,
  isLoggedInFilter: null,
  isDownload: false,
};

export const audit_InitialFilter: any = {
  PageNo: 1,
  PageSize: 10,
  GlobalSearch: "",
  SortColumn: "",
  IsDesc: true,
  IsDownload: false,
  StartDate: null,
  EndDate: null,
  Clients: [],
  Users: [],
};

export const billingreport_InitialFilter = {
  pageNo: 1,
  pageSize: 10,
  sortColumn: "",
  isDesc: true,
  globalSearch: "",
  startDate: null,
  endDate: null,
  isDownload: false,
  clients: [],
  IsBTC: false,
  projects: [],
  returnTypeId: null,
  typeofReturnId: null,
  assigneeId: null,
  reviewerId: null,
  numberOfPages: null,
};

export const customreport_InitialFilter = {
  pageNo: 1,
  pageSize: 10,
  sortColumn: "",
  isDesc: true,
  globalSearch: "",
  projectIdsJSON: [],
  clientIdsJSON: [],
  processIdsJSON: [],
  subProcessId: null,
  assignedById: null,
  assigneeId: null,
  returnTypeId: null,
  numberOfPages: null,
  returnYear: null,
  currentYear: null,
  StatusId: null,
  reviewerId: null,
  complexity: null,
  priority: null,
  receivedDate: null,
  dueDate: null,
  allInfoDate: null,
  startDate: null,
  endDate: null,
  startDateReview: null,
  endDateReview: null,
  isDownload: false,
};

export const rating_InitialFilter: any = {
  pageNo: 1,
  pageSize: 10,
  GlobalSearch: "",
  SortColumn: "",
  IsDesc: true,
  Projects: [],
  ReturnTypeId: null,
  Ratings: null,
  Clients: [],
  DepartmentId: null,
  StartDate: null,
  EndDate: null,
};

export const logReport_InitialFilter = {
  GlobalSearch: "",
  PageNo: 1,
  PageSize: 10,
  SortColumn: null,
  IsDesc: 1,
  ClientFilter: [],
  ProjectFilter: [],
  ProcessFilter: [],
  UpdatedByFilter: [],
  StartDate: null,
  EndDate: null,
};

export const activity_InitialFilter = {
  PageNo: 1,
  PageSize: 10,
  sortColumn: "",
  IsDesc: true,
  GlobalSearch: "",
  StartDate: null,
  EndDate: null,
  Users: [],
  DepartmentId: null,
  IsDownload: false,
};

export const ap_InitialFilter = {
  PageNo: 1,
  PageSize: 10,
  sortColumn: "",
  IsDesc: true,
  GlobalSearch: "",
  StartDate: null,
  EndDate: null,
  Users: [],
  Clients: [],
  ReportingManagers: [],
  DepartmentId: null,
  IsDownload: false,
};

export const client_InitialFilter = {
  PageNo: 1,
  PageSize: 10,
  GlobalSearch: "",
  SortColumn: "",
  IsDesc: true,
  IsDownload: false,
  StartDate: null,
  EndDate: null,
  Client: [],
  TypeOfWork: [],
  Department: [],
  BillingType: [],
};

export const kra_InitialFilter = {
  PageNo: 1,
  PageSize: 10,
  sortColumn: "",
  IsDesc: true,
  GlobalSearch: "",
  StartDate: null,
  EndDate: null,
  Users: [],
  Clients: [],
  DepartmentId: null,
  IsDownload: false,
};

export const am_InitialFilter = {
  PageNo: 1,
  PageSize: 10,
  sortColumn: "",
  IsDesc: true,
  GlobalSearch: "",
  StartDate: null,
  EndDate: null,
  Users: [],
  ReportingManagerId: null,
  DepartmentId: null,
  IsDownload: false,
};

export const wltr_InitialFilter = {
  PageNo: 1,
  PageSize: 10,
  GlobalSearch: "",
  SortColumn: "",
  IsDesc: true,
  IsDownload: false,
  StartDate: null,
  EndDate: null,
  Clients: [],
};

export const getCurrentTabDetails = (activeTab: number, getBody?: boolean) => {
  if (activeTab === 1) {
    return getBody ? client_project_InitialFilter : "project";
  }
  if (activeTab === 2) {
    return getBody ? user_InitialFilter : "user";
  }
  if (activeTab === 3) {
    return getBody ? timeSheet_InitialFilter : "timesheet";
  }
  if (activeTab === 4) {
    return getBody ? workLoad_InitialFilter : "workLoad";
  }
  if (activeTab === 5) {
    return getBody ? userLogs_InitialFilter : "userLog";
  }
  if (activeTab === 6) {
    return getBody ? audit_InitialFilter : "audit";
  }
  if (activeTab === 7) {
    return getBody ? billingreport_InitialFilter : "billing";
  }
  if (activeTab === 8) {
    return getBody ? customreport_InitialFilter : "custom";
  }
  if (activeTab === 9) {
    return getBody ? rating_InitialFilter : "admin/rating";
  }
  if (activeTab === 10) {
    return getBody ? logReport_InitialFilter : "auditlog";
  }
  if (activeTab === 11) {
    return getBody ? activity_InitialFilter : "activity";
  }
  if (activeTab === 12) {
    return getBody ? ap_InitialFilter : "a/p";
  }
  if (activeTab === 13) {
    return getBody ? kra_InitialFilter : "client";
  }
  if (activeTab === 14) {
    return getBody ? kra_InitialFilter : "kra";
  }
  if (activeTab === 15) {
    return getBody ? kra_InitialFilter : "auto/manual";
  }
  if (activeTab === 16) {
    return getBody ? wltr_InitialFilter : "wltr";
  }
};
