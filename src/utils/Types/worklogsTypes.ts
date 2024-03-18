export interface List {
  WorkitemId: number;
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
  TimelogId: number | null;
  State: number;
  Timer: number;
  AssignedToId: number;
  AssignedToName: string;
  PriorityId: number;
  PriorityName: string;
  StatusId: number;
  StatusType: string;
  StatusName: string;
  StatusColorCode: string;
  EstimateTime: string;
  EstimateTimeSec: number;
  Quantity: number;
  STDTime: string;
  ActualTime: string;
  ActualTimeSec: number;
  StdTimeSec: number;
  StartDate: string;
  EndDate: string;
  AssignedById: number;
  AssignedByName: string;
  IsManual: boolean | null;
  IsHasErrorlog: boolean;
  IsHasErrorlogAddedByClient: boolean;
  ErrorlogSignedOffPending: boolean;
  IsRecurring: boolean;
  WorkType: string;
  WorkTypeId: number;
  IsActive: boolean;
  AllInfoDate: string | null;
  IsCreatedByClient: boolean;
  ReceiverDate: string;
  ManagerId: number;
  ReviewerId: number;
  ReturnYear: number | null;
  PreparorTimeSec: number;
  PreparorTime: string;
}

export interface Response {
  worklogExportFilter: any | null;
  TotalTime: string;
  TodaysTime: string;
  BreakTime: string;
  List: List[];
  TotalCount: number;
}

export interface AppliedFilter {
  ClientId: number | null;
  TypeOfWork: number | null;
  ProjectId: number | null;
  Status: number | null;
  AssignedTo: number | null;
  AssignedBy: number | null;
  DueDate: string | null;
  StartDate: string | null;
  EndDate: string | null;
  ReviewStatus: number | null;
}

export interface FilterData {
  FilterId: number;
  Name: string;
  AppliedFilter: AppliedFilter;
}

export interface AppliedFilterWorklogsPage {
  ClientId: number | null;
  TypeOfWork: number | null;
  ProjectId: number | null;
  StatusId?: number | null;
  Status?: number | null;
  AssignedTo: number | null;
  AssignedBy: number | null;
  DueDate: string | null;
  StartDate: string | null;
  EndDate: string | null;
  ReviewStatus: number | null;
}

export interface FilterWorklogsPage {
  FilterId: number;
  Name: string;
  AppliedFilter: AppliedFilterWorklogsPage;
}

export interface WorkitemGetbyid {
  TaskName: string;
  ClientId: number;
  WorkTypeId: number;
  ProjectId: number;
  ProcessId: number;
  SubProcessId: number;
  StatusId: number;
  Priority: number | null;
  Quantity: number;
  Description: string | null;
  ReceiverDate: string;
  DueDate: string;
  ReviewerDate: string | null;
  PreparationDate: string | null;
  AssignedId: number;
  ReviewerId: number;
  TaxReturnType: string | null;
  TypeOfReturnId: number | null;
  TaxCustomFields: {
    ReturnYear: number;
    Complexity: null;
    CountYear: null;
    NoOfPages: number;
  } | null;
  IsManual: boolean | null;
  AllInfoDate: string | null;
  ChecklistWorkpaper: boolean | null;
  ManagerId: number;
  DepartmentId: number;
  IsCreatedByClient: boolean;
  CreatedById: number | null;
  CreatedByName: string | null;
  IsHasErrorlog: boolean;
  IsHasErrorlogAddedByClient: boolean;
  ErrorlogSignedOffPending: boolean;
  WorkItemId: number;
}
