export interface ApprovalsPopupResponse {
  UserName: string;
  StartDateTime: string;
  EndDateTime: string;
  Client: string;
  Project: string;
  Process: string;
  TotalHours: string;
}

export interface List {
  SubmissionId: number;
  WorkitemId: number;
  TaskName: string;
  EmpolyeeId: number;
  EmpolyeeName: string;
  Role: string;
  EstimateTime: number;
  TotalTime: number;
  ClientId: number;
  ClientName: string;
  ProjectId: number;
  ProjectName: string;
  ProcessId: number;
  ParentProcess: string | null;
  SubProcessId: number;
  SubProcess: string;
  WorkTypeId: number;
  WorkType: string;
  StatusId: number;
  StatusType: string;
  StatusName: string;
  ColorCode: string;
  TaskColorCode: string;
  TaskStatusName: string;
  PriorityId: number | null;
  PriorityName: string | null;
  AssigneeId: number;
  AssignedName: string;
  StartDate: string;
  EndDate: string;
  Quantity: number | null;
  EmployeeIsManual: boolean;
  ReviewerIsManual: boolean | null;
  State: number;
  Timer: number;
  EmployeeManualTime: number | null;
  ManagerId: number;
  ManagerName: string;
  TimelogId: number | null;
  IsActive: boolean;
  IsFinalSubmited: boolean;
  IsHasErrorlog: boolean;
  IsHasErrorlogAddedByClient: boolean;
  ErrorlogSignedOffPending: boolean;
  ReviewerId: number;
  ReviewerName: string;
  StdTimeSec: number;
  StdTime: string;
  PreparorTimeSec: number;
  PreparorTime: string;
  ReviewerTimeSec: number;
  ReviewerTime: string;
  ActualTimeSec: number;
  ActualTime: string;
}

export interface InitialFilterApprovals {
  PageNo: number;
  PageSize: number;
  sortColumn: string;
  isDesc: boolean;
  globalSearch: string;
  userId: number | null;
  ClientId: number | null;
  TypeOfWork: number | null;
  projectId: number | null;
  startDate: string | null;
  endDate: string | null;
  dueDate: string | null;
  StatusId: number | null;
  ProcessId: number | null;
  DateFilter: string | null;
}
