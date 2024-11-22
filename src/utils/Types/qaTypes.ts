export interface FilterQAPage {
  FilterId: number;
  Name: string;
  AppliedFilter: AppliedFilterQAPage;
}

export interface AppliedFilterQAPage {
  ClientId: number | null;
  TypeOfWork: number | null;
  ProjectId: number | null;
  AssignedTo: number | null;
  AssignedBy: number | null;
  StartDate: string | null;
  EndDate: string | null;
}

export interface QAList {
  TaskId: number;
  TaskName: string;
  Description: string;
  ClientId: number;
  ClientName: string;
  ProjectId: number;
  ProjectName: string;
  ProcessId: number;
  ProcessName: string;
  SubProcessId: number;
  SubProcessName: string;
  State: number;
  PriorityId: number | null;
  PriorityName: string;
  EstimateTime: string;
  Quantity: number;
  STDTime: string;
  AssignedToId: number;
  AssignedToName: string;
  StartDate: string;
  EndDate: string;
  AssignedById: number;
  AssignedByName: string;
  ReviewerId: number;
  ReviewerName: string;
  ManagerId: number;
  ManagerName: string;
  WorkType: string;
  WorkTypeId: number;
  IsCreatedByClient: boolean;
  DepartmentId: number;
  DepartmentName: string;
}

export interface Response {
  worklogExportFilter: any | null;
  List: QAList[];
  TotalCount: number;
}

export interface FilterQAPageTask {
  FilterId: number;
  Name: string;
  AppliedFilter: AppliedFilterQAPageTask;
}

export interface AppliedFilterQAPageTask {
  ClientId: number | null;
  TypeOfWork: number | null;
  ProjectId: number | null;
  StatusId: number | null;
  DateFilter: string | null;
}

export interface QAListTask {
  SubmissionId: number;
  TaskId: number;
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
  PriorityId: number | null;
  PriorityName: string | null;
  EstimateTimeSec: number | null;
  EstimateTime: string;
  Quantity: 1;
  StdTimeSec: number | null;
  StdTime: string;
  StartDate: string;
  EndDate: string;
  TaskCreatedOn: string;
  QATimerSec: number | null;
  QATimer: string;
  AssigneeId: number;
  AssignedTo: string;
  Designation: string;
  ReviewerId: number;
  ReviewerName: string;
  ManagerId: number;
  ManagerName: string;
  TaskStatusType: string;
  TaskStatusName: string;
  TaskStatucColorCode: string;
  QAStatusType: string;
  QAStatusName: string;
  QAStatucColorCode: string;
  TotalTimeSec: number | null;
  TotalTime: string;
  ReviewerTimeSec: null;
  ReviewerTime: string;
  PreparerTimeSec: number | null;
  PreparerTime: string;
  State: number;
  TimelogId: number;
}

export interface ResponseTask {
  worklogExportFilter: any | null;
  List: QAListTask[];
  TotalCount: number;
  TotalTime: string | null;
  PreparorTotalTime: string | null;
}
