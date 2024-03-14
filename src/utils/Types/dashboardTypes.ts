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

export interface ListProjectStatus {
  ColorCode: string;
  Percentage: number;
  Key: string;
  Value: number;
}
