export interface ListDashboard {
  TaskId: number;
  TaskName: string;
  ProjectId: number;
  ProjectName: string;
  ClientId: number;
  ClientName: string;
  StatusId: number;
  StatusName: string;
  StatusColorCode: string;
  WorkTypeId: number;
  WorkTypeName: string;
  TaxReturnTypeId: number | null;
  TaxReturnTypeName: string | null;
  ProcessId: number;
  ProcessName: string;
  SubProcessId: number;
  SubProcessName: string;
  TypeOfReturnId?: number | null;
  TypeOfReturnName?: string | null;
  StartDate: string | null;
  EndDate: string | null;
  PriorityId: number | null;
  PriorityName: string | null;
  AssignedById: number | null;
  AssignedByName: string | null;
  AssignedToId: number | null;
  AssignedToName: string | null;
  DepartmentId: number;
  DepartmentName: string;
  ReworkReceivedDate: null;
  ReworkDueDate: null;
  ErrorLogId: number;
  SubmitedBy: string;
  SubmitedOn: string;
  ErrorType: number;
  RootCause: number;
  NatureOfError: number;
  ErrologPriority: number;
  Impact: number;
  ErrorCount: number;
  ErrorTypeVal: string;
  RootCauseVal: string;
  NatureOfErrorVal: string;
  ErrorlogPriorityVal: string;
  ImpactVal: string;
  Amount: string | null;
  DateOfTransaction: string | null;
  Remark: string;
  RootCauseAnalysis: string;
  MitigationPlan: string;
  ContigencyPlan: string;
  VendorName: string;
  DocumentNumber: string;
  IsHasErrorlogAddedByClient: number;
  ResolvedBy: string;
  SolvedOn: string;
  IsImported: string;
  ErrorIdentificationDate: string;
  ResolutionStatus: number;
  ResolutionStatusVal: string;
  IdentifiedBy: string | null;
}

export interface ListClientDashboard {
  WorkitemId: number;
  ProjectId: number | null;
  ProjectName: string | null;
  TaskName: string;
  TypeOfWorkId: number;
  TypeOfWorkName: string;
  StartDate: string | null;
  EndDate: string | null;
  StatusId: number;
  StatusName: string;
  StatusColorCode: string;
  PriorityId: number | null;
  PriorityName: string | null;
  AssignedToId: number | null;
  AssignedToName: string | null;
  ProcessId: number | null;
  ProcessName: string | null;
  SubProcessId: number | null;
  SubProcessName: string | null;
  TaxReturnTypeId: number | null;
  TaxReturnTypeName: string | null;
  TypeOfReturnId: number | null;
  TypeOfReturnName: string | null;
}

export interface ResponseDashboardErrorlog {
  TotalCount: number;
  ErrorLogSummaryFilters: null;
  ErrorlogList: ListDashboard[] | [];
}

export interface ResponseDashboardProjectSummary {
  TotalCount: number;
  DashboardSummaryFilters: null;
  ProjectStatusList: ListDashboard[] | [];
}

export interface ResponseDashboardTask {
  TotalCount: number;
  DashboardSummaryFilters: null;
  TaskStatusList: ListDashboard[] | [];
}

export interface ListProjectStatusSequence {
  ColorCode: string;
  Percentage: number;
  Key: string;
  Value: number;
  Sequence: number;
}

export interface ListProjectStatus {
  ColorCode: string;
  Percentage: number;
  Key: string;
  Value: number;
}

export interface ListOverallProject {
  ColorCode: string;
  Percentage: number;
  Key: string;
  Count: number;
}

export interface DashboardInitialFilter {
  Clients: number[] | [];
  WorkTypeId: number | null;
  DepartmentIds: number[] | [];
  AssigneeIds: number[] | [];
  ReviewerIds: number[] | [];
  StatusIds: number[] | [];
  StartDate: string | null | undefined;
  EndDate: string | null | undefined;
}
